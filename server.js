// Secure Solera Cask Server - Production Ready
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

dotenv.config();
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-netlify-domain.netlify.app', 'https://soleracask.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// DEBUG: Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
  
  // DEBUG: Check if files exist
  const fs = require('fs');
  console.log('Checking files:');
  console.log('index.html exists:', fs.existsSync(path.join(__dirname, 'index.html')));
  console.log('admin.html exists:', fs.existsSync(path.join(__dirname, 'admin.html')));
  console.log('public folder exists:', fs.existsSync(path.join(__dirname, 'public')));
  console.log('Current directory:', __dirname);
  
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these in your .env file or hosting environment');
  process.exit(1);
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
  content: { type: String, required: true },
  link: String,
  tags: [String],
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  images: [String], // Array of image URLs/data
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
  data: String, // Base64 data
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
      
      // Create default posts for Solera Cask
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
      },
      {
        id: generateId("Understanding Sherry Types for Aging"),
        title: "Understanding Sherry Types for Aging",
        type: "Education",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        excerpt: "A comprehensive guide to the six sherry types and how each imparts unique characteristics to spirits and beer.",
        content: "Understanding the different sherry types is crucial for selecting the right barrel for your aging program. Each of the six main sherry types brings distinct flavor profiles and characteristics to spirits and beer.\n\n## Fino and Manzanilla\nFino and Manzanilla, aged under flor, contribute bright, mineral, and saline notes perfect for lighter spirits. These sherries develop under a layer of yeast called flor, which protects the wine from oxidation and creates unique aldehydic compounds.\n\n## Amontillado\nAmontillado offers balanced complexity with nutty and oxidative characteristics. Starting life under flor like Fino, these sherries later undergo oxidative aging.\n\n## Oloroso\nOloroso provides rich, robust flavors ideal for whisky and dark beer styles. These sherries undergo full oxidative aging from the beginning.\n\n## Pedro Ximénez\nPedro Ximénez delivers intense sweetness and rich fruit character for dessert-style expressions.",
        link: "",
        tags: ["education", "sherry-types", "aging", "flavor-profiles"],
        status: "published"
      }
    ];

    await Post.insertMany(defaultPosts);
    console.log('Default Solera Cask posts created');
  } catch (error) {
    console.error('Error creating default posts:', error);
  }
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
    
    // Update last login
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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

// Get single published post by ID
app.get('/api/posts/public/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ 
      id: req.params.id, 
      status: 'published' 
    }).select('-_id -__v');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.set('Cache-Control', 'public, max-age=300');
    res.json(post);
  } catch (error) {
    console.error('Error fetching public post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Get single published post by slug
app.get('/api/posts/public/slug/:slug', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).select('-_id -__v');
    const post = posts.find(p => createPostSlug(p) === req.params.slug);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.set('Cache-Control', 'public, max-age=300');
    res.json(post);
  } catch (error) {
    console.error('Error fetching public post by slug:', error);
    res.status(500).json({ message: 'Error fetching post' });
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
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const postData = {
      id: req.body.id || generateId(req.body.title),
      title: req.body.title.trim(),
      type: req.body.type || 'News',
      excerpt: req.body.excerpt ? req.body.excerpt.trim() : '',
      content: req.body.content.trim(),
      link: req.body.link ? req.body.link.trim() : '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : 
            (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()) : []),
      status: req.body.status || 'published',
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

// Image upload endpoint (admin only)
app.post('/api/images/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imageId = uuidv4();
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    
    const imageDoc = new Image({
      id: imageId,
      filename: `${imageId}.${req.file.mimetype.split('/')[1]}`,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      data: dataUrl,
      uploadedBy: req.user.username
    });
    
    await imageDoc.save();
    
    res.json({
      id: imageId,
      filename: imageDoc.filename,
      url: dataUrl,
      size: req.file.size,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Get uploaded images (admin only)
app.get('/api/images', authenticateToken, async (req, res) => {
  try {
    const images = await Image.find()
      .select('-_id -__v -data') // Don't send data in list view
      .sort({ uploadedAt: -1 });
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Error fetching images' });
  }
});

// Get single image with data (admin only)
app.get('/api/images/:id', authenticateToken, async (req, res) => {
  try {
    const image = await Image.findOne({ id: req.params.id }).select('-_id -__v');
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Error fetching image' });
  }
});

// Delete image (admin only)
app.delete('/api/images/:id', authenticateToken, async (req, res) => {
  try {
    const image = await Image.findOneAndDelete({ id: req.params.id });
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    console.log(`Deleted image: ${image.filename} by ${req.user.username}`);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

// Export/Import posts (admin only)
app.get('/api/posts/export', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find().select('-_id -__v');
    const images = await Image.find().select('-_id -__v');
    
    res.json({
      posts,
      images,
      exportDate: new Date().toISOString(),
      version: '1.0'
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Error exporting data' });
  }
});

app.post('/api/posts/import', authenticateToken, async (req, res) => {
  try {
    const { posts, images } = req.body;
    
    let importedPosts = 0;
    let importedImages = 0;
    let skippedPosts = 0;
    let skippedImages = 0;
    
    // Import posts
    if (Array.isArray(posts)) {
      for (const postData of posts) {
        try {
          await Post.create({
            ...postData,
            author: req.user.username,
            updatedAt: new Date()
          });
          importedPosts++;
        } catch (error) {
          if (error.code === 11000) {
            skippedPosts++;
          } else {
            throw error;
          }
        }
      }
    }
    
    // Import images
    if (Array.isArray(images)) {
      for (const imageData of images) {
        try {
          await Image.create({
            ...imageData,
            uploadedBy: req.user.username
          });
          importedImages++;
        } catch (error) {
          if (error.code === 11000) {
            skippedImages++;
          } else {
            throw error;
          }
        }
      }
    }
    
    res.json({ 
      message: `Import complete: ${importedPosts} posts imported, ${skippedPosts} posts skipped, ${importedImages} images imported, ${skippedImages} images skipped`
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ message: 'Error importing data' });
  }
});

// Change password (admin only)
app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate(
      { username: req.user.username },
      { password: passwordHash }
    );
    
    console.log(`Password changed for user: ${req.user.username}`);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Solera Cask API',
    version: '1.0.0'
  });
});

// ===== STATIC ROUTES =====

// Serve static files first
app.use(express.static(path.join(__dirname, '.')));

// Serve specific pages
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

// Catch-all handler for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
  });
});

module.exports = app;