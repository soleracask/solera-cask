const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

dotenv.config();
const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://soleracask.netlify.app', 'https://soleracask.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://127.0.0.1:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
const cloudinaryEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
const missingCloudinaryVars = cloudinaryEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

if (missingCloudinaryVars.length > 0) {
  console.warn('Missing Cloudinary environment variables:', missingCloudinaryVars.join(', '));
  console.warn('Image uploads will use local storage instead');
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Database name:', db.name);
  }
});

// Database Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const PostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  excerpt: String,
  content: String,
  contentHtml: String,
  featuredImage: String,
  link: String,
  tags: [String],
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  featured: { type: Boolean, default: false },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  author: String
});

const ImageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  cloudinaryUrl: String, // Store Cloudinary URL
  cloudinaryPublicId: String, // Store Cloudinary public ID for deletion
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: String
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Image = mongoose.model('Image', ImageSchema);

// Utility Functions
function generateId(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-') + '-' + Date.now();
}

function createPostSlug(post) {
  return post.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Security: Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLoginAttempts(username) {
  const attempts = loginAttempts.get(username);
  if (!attempts) return true;
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    if (Date.now() - attempts.lastAttempt < LOCKOUT_DURATION) {
      return false;
    } else {
      loginAttempts.delete(username);
      return true;
    }
  }
  return true;
}

function recordLoginAttempt(username, success) {
  if (success) {
    loginAttempts.delete(username);
  } else {
    const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(username, attempts);
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    try {
      await User.findOneAndUpdate(
        { username: decoded.username },
        { lastLogin: new Date() }
      );
    } catch (error) {
      console.error('Error updating last login:', error);
    }
    
    req.user = decoded;
    next();
  });
}

// Image upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Initialize admin user
async function initializeDefaultUser() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword || adminPassword.length < 8) {
      console.error('ADMIN_PASSWORD must be at least 8 characters long');
      process.exit(1);
    }
    
    const existingUser = await User.findOne({ username: adminUsername });
    
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({ 
        username: adminUsername, 
        password: passwordHash,
        role: 'admin'
      });
      console.log(`Admin user '${adminUsername}' created successfully`);
      await createDefaultPosts();
    } else {
      console.log(`Admin user '${adminUsername}' already exists`);
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
    process.exit(1);
  }
}

// Create default posts for Solera Cask
async function createDefaultPosts() {
  try {
    const existingPosts = await Post.countDocuments();
    if (existingPosts > 0) return;

    const defaultPosts = [
      {
        id: generateId("Welcome to Solera Cask Stories"),
        title: "Welcome to Solera Cask Stories",
        type: "News",
        date: new Date().toISOString().split('T')[0],
        excerpt: "Discover the heritage, craftsmanship, and stories behind our premium sherry barrels from Jerez de la Frontera.",
        content: "Welcome to Solera Cask Stories, where we share the rich heritage and exceptional craftsmanship behind our premium sherry barrels. From our historic solera systems in Jerez de la Frontera to the modern craft distilleries and breweries worldwide, each barrel tells a story of tradition, quality, and transformation.\n\nHere you'll find updates on our latest partnerships, educational content about sherry barrel aging, tasting notes from exceptional spirits and beers, and stories from the passionate makers who trust Solera Cask for their most important expressions.\n\nOur journey begins in the heart of Andalusia, where the ancient art of sherry making has been perfected over centuries. Each barrel we source carries with it the wisdom of generations of bodega masters, the terroir of Jerez de la Frontera, and the unique characteristics that only authentic Spanish sherry casks can provide.",
        link: "",
        tags: ["welcome", "heritage", "craftsmanship", "solera", "jerez"],
        status: "published"
      }
    ];

    await Post.insertMany(defaultPosts);
    console.log('Default Solera Cask posts created');
  } catch (error) {
    console.error('Error creating default posts:', error);
  }
}

// ===== PUBLIC API ROUTES =====

// Get all published posts
app.get('/api/posts/public', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .select('-_id -__v')
      .sort({ createdAt: -1 });
    
    console.log(`Public: Fetched ${posts.length} published posts`);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching public posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get featured post
app.get('/api/featured-post', async (req, res) => {
  try {
    let featuredPost = await Post.findOne({ 
      featured: true,
      status: 'published' 
    })
    .select('-_id -__v')
    .sort({ createdAt: -1 });

    if (!featuredPost) {
      featuredPost = await Post.findOne({ 
        status: 'published' 
      })
      .select('-_id -__v')
      .sort({ createdAt: -1 });
    }

    if (!featuredPost) {
      return res.status(404).json({ message: 'No featured post found' });
    }

    console.log(`Featured post: ${featuredPost.title}`);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(featuredPost);
  } catch (error) {
    console.error('Error fetching featured post:', error);
    res.status(500).json({ message: 'Error fetching featured post' });
  }
});

// ===== AUTHENTICATED API ROUTES =====

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    if (!checkLoginAttempts(username)) {
      return res.status(429).json({ 
        message: 'Too many login attempts. Please try again later.' 
      });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      recordLoginAttempt(username, false);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      recordLoginAttempt(username, false);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    recordLoginAttempt(username, true);
    const token = jwt.sign(
      { username: user.username, id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    res.json({ 
      token,
      user: {
        username: user.username,
        role: user.role
      },
      message: 'Login successful',
      expiresIn: '8h'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all posts (admin only)
app.get('/api/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .select('-_id -__v')
      .sort({ createdAt: -1 });
    
    console.log(`Admin: Fetched ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create new post (admin only)
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    if (!req.body.title || (!req.body.content && !req.body.contentHtml)) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const postData = {
      id: req.body.id || generateId(req.body.title),
      title: req.body.title.trim(),
      type: req.body.type || 'News',
      excerpt: req.body.excerpt ? req.body.excerpt.trim() : '',
      content: req.body.content ? req.body.content.trim() : '',
      contentHtml: req.body.contentHtml ? req.body.contentHtml.trim() : '',
      featuredImage: req.body.featuredImage || '',
      link: req.body.link ? req.body.link.trim() : '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : 
            (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()) : []),
      status: req.body.status || 'published',
      featured: req.body.featured || false,
      date: req.body.date || new Date().toISOString().split('T')[0],
      images: req.body.images || [],
      author: req.user.username,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const post = await Post.create(postData);
    console.log(`Created post: ${post.title} by ${req.user.username}`);
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Post with this ID already exists' });
    } else {
      res.status(500).json({ message: 'Error creating post' });
    }
  }
});

// Update post (admin only)
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      author: req.user.username
    };
    
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }
    
    const post = await Post.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, select: '-_id -__v' }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log(`Updated post: ${post.title} by ${req.user.username}`);
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete post (admin only)
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log(`Deleted post: ${post.title} by ${req.user.username}`);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Cloudinary image upload endpoint (admin only)
app.post('/api/images/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('Uploading image to Cloudinary:', req.file.originalname);

    // Upload to Cloudinary using buffer
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'solera-cask', // Organize images in a folder
          public_id: `${uuidv4()}-${req.file.originalname.split('.')[0]}`,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    // Save image metadata to database
    const imageId = uuidv4();
    const imageDoc = new Image({
      id: imageId,
      filename: uploadResult.public_id,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      uploadedBy: req.user.username
    });

    await imageDoc.save();

    console.log(`Image uploaded successfully: ${req.file.originalname} -> ${uploadResult.secure_url}`);

    res.json({
      id: imageId,
      filename: req.file.originalname,
      url: uploadResult.secure_url,
      size: req.file.size,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image: ' + error.message });
  }
});

// Alternative endpoint for compatibility
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  // Redirect to the main upload endpoint
  req.url = '/api/images/upload';
  return app._router.handle(req, res);
});

// Set featured post (admin only)
app.post('/api/featured-post', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.body;
    
    // Clear all featured posts first
    await Post.updateMany({}, { featured: false });
    
    if (postId) {
      const post = await Post.findOneAndUpdate(
        { id: postId, status: 'published' },
        { featured: true, updatedAt: new Date() },
        { new: true, select: '-_id -__v' }
      );
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found or not published' });
      }
      
      console.log(`Set featured post: ${post.title} by ${req.user.username}`);
      res.json({ 
        message: 'Featured post updated successfully',
        post: post
      });
    } else {
      console.log(`Cleared featured post by ${req.user.username}`);
      res.json({ message: 'Featured post cleared successfully' });
    }
  } catch (error) {
    console.error('Error setting featured post:', error);
    res.status(500).json({ message: 'Error setting featured post' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Solera Cask API',
    version: '1.0.0',
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
  });
});

// Serve static files and routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/post/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'post.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize and start server
initializeDefaultUser().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Solera Cask server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Admin user: ${process.env.ADMIN_USERNAME}`);
    console.log(`Cloudinary configured: ${!!process.env.CLOUDINARY_CLOUD_NAME}`);
  });
});

module.exports = app;