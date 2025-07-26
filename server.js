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
  // Basic Post Fields
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  excerpt: String,
  content: { type: String, required: true },
  contentHtml: String, // For HTML content posts
  link: String,
  tags: [String],
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  featured: { type: Boolean, default: false },
  
  // SEO Fields
  seoTitle: {
    type: String,
    maxlength: 60,
    // Auto-generated if not provided: "{title} - Solera Cask"
  },
  seoDescription: {
    type: String,
    maxlength: 160,
    // Auto-generated if not provided from excerpt or content
  },
  seoKeywords: {
    type: String,
    maxlength: 255,
    // Auto-generated if not provided from tags
  },
  seoImage: {
    type: String,
    // URL to featured image for social sharing
    // Falls back to default Solera Cask logo if not provided
  },
  
  // Open Graph specific fields (optional overrides)
  ogTitle: {
    type: String,
    maxlength: 60,
    // Falls back to seoTitle if not provided
  },
  ogDescription: {
    type: String,
    maxlength: 160,
    // Falls back to seoDescription if not provided
  },
  ogImage: {
    type: String,
    // Falls back to seoImage if not provided
  },
  
  // Twitter Card specific fields (optional overrides)
  twitterTitle: {
    type: String,
    maxlength: 60,
    // Falls back to seoTitle if not provided
  },
  twitterDescription: {
    type: String,
    maxlength: 160,
    // Falls back to seoDescription if not provided
  },
  twitterImage: {
    type: String,
    // Falls back to seoImage if not provided
  },
  
  // Additional SEO metadata
  canonicalUrl: {
    type: String,
    // Optional custom canonical URL
  },
  noIndex: {
    type: Boolean,
    default: false,
    // Set to true to prevent search engine indexing
  },
  noFollow: {
    type: Boolean,
    default: false,
    // Set to true to prevent following links
  },
  
  // Content metadata
  featuredImage: String, // Main featured image for the post
  readingTime: Number, // Estimated reading time in minutes
  wordCount: Number, // Auto-calculated word count
  
  // Media attachments
  images: [String], // Array of image URLs/data
  
  // Timestamps and authoring
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: Date, // When the post was first published
  author: String,
  
  // Analytics and performance
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  
  // Content structure
  tableOfContents: [{
    level: Number, // Header level (1, 2, 3, etc.)
    text: String,  // Header text
    id: String     // Anchor ID for linking
  }],
  
  // Related content
  relatedPostIds: [String], // Manually curated related posts
  categorySlug: String, // Category for better organization
  
  // Scheduling
  scheduledPublishAt: Date, // For scheduled publishing
  
  // Content flags
  isSponsored: { type: Boolean, default: false },
  isExternalContent: { type: Boolean, default: false },
  
  // SEO automation flags
  autoGenerateSEO: { type: Boolean, default: true },
  lastSEOUpdate: Date
});

// Pre-save middleware to auto-generate SEO fields
PostSchema.pre('save', function(next) {
  const post = this;
  
  // Update the updatedAt timestamp
  post.updatedAt = new Date();
  
  // Set publishedAt if this is the first time publishing
  if (post.status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date();
  }
  
  // Auto-generate SEO fields if autoGenerateSEO is true and fields are empty
  if (post.autoGenerateSEO) {
    // Generate SEO title if not provided
    if (!post.seoTitle) {
      post.seoTitle = `${post.title} - Solera Cask`;
      // Truncate if too long
      if (post.seoTitle.length > 60) {
        post.seoTitle = post.seoTitle.substring(0, 57) + '...';
      }
    }
    
    // Generate SEO description if not provided
    if (!post.seoDescription) {
      let description = post.excerpt || '';
      if (!description && post.content) {
        // Extract first 150 characters from content, removing markdown
        description = post.content
          .replace(/[#*`_\[\]()]/g, '') // Remove markdown characters
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .trim()
          .substring(0, 150);
      }
      if (!description) {
        description = `Read about ${post.title.toLowerCase()} and discover premium sherry barrels from Jerez de la Frontera, Spain.`;
      }
      
      // Ensure it ends properly and isn't cut off mid-word
      if (description.length >= 150) {
        const lastSpace = description.lastIndexOf(' ', 157);
        description = description.substring(0, lastSpace) + '...';
      }
      
      post.seoDescription = description;
    }
    
    // Generate SEO keywords if not provided
    if (!post.seoKeywords && post.tags && post.tags.length > 0) {
      const baseKeywords = ['sherry barrels', 'Solera Cask', 'Jerez de la Frontera'];
      const postKeywords = post.tags.slice(0, 5); // Limit to 5 tags
      post.seoKeywords = [...baseKeywords, ...postKeywords].join(', ');
    }
    
    // Set default SEO image if not provided
    if (!post.seoImage) {
      post.seoImage = post.featuredImage || '/images/logos/Solera-Cask-Logo.png';
    }
    
    // Calculate word count and reading time
    if (post.content) {
      const wordCount = post.content.split(/\s+/).length;
      post.wordCount = wordCount;
      post.readingTime = Math.ceil(wordCount / 200); // Assume 200 words per minute
    }
    
    // Update last SEO update timestamp
    post.lastSEOUpdate = new Date();
  }
  
  next();
});

// Instance method to generate post slug
PostSchema.methods.generateSlug = function() {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Instance method to get full SEO data
PostSchema.methods.getSEOData = function() {
  const baseUrl = process.env.BASE_URL || 'https://soleracask.com';
  const postUrl = `${baseUrl}/post/${this.generateSlug()}`;
  
  return {
    title: this.seoTitle || `${this.title} - Solera Cask`,
    description: this.seoDescription || this.excerpt || 'Premium sherry barrels from Jerez de la Frontera, Spain',
    keywords: this.seoKeywords || (this.tags ? this.tags.join(', ') : ''),
    image: this.seoImage || this.featuredImage || '/images/logos/Solera-Cask-Logo.png',
    url: postUrl,
    canonicalUrl: this.canonicalUrl || postUrl,
    
    // Open Graph
    ogTitle: this.ogTitle || this.seoTitle || `${this.title} - Solera Cask`,
    ogDescription: this.ogDescription || this.seoDescription || this.excerpt || 'Premium sherry barrels from Jerez de la Frontera, Spain',
    ogImage: this.ogImage || this.seoImage || this.featuredImage || '/images/logos/Solera-Cask-Logo.png',
    
    // Twitter
    twitterTitle: this.twitterTitle || this.seoTitle || `${this.title} - Solera Cask`,
    twitterDescription: this.twitterDescription || this.seoDescription || this.excerpt || 'Premium sherry barrels from Jerez de la Frontera, Spain',
    twitterImage: this.twitterImage || this.seoImage || this.featuredImage || '/images/logos/Solera-Cask-Logo.png',
    
    // Meta directives
    noIndex: this.noIndex,
    noFollow: this.noFollow,
    
    // Article data
    author: this.author || 'Solera Cask',
    publishedTime: this.publishedAt || this.createdAt,
    modifiedTime: this.updatedAt,
    section: this.type,
    tags: this.tags || []
  };
};

// Static method to find posts with SEO issues
PostSchema.statics.findSEOIssues = function() {
  return this.find({
    $or: [
      { seoTitle: { $exists: false } },
      { seoTitle: '' },
      { seoTitle: { $regex: /.{61,}/ } }, // Title too long
      { seoDescription: { $exists: false } },
      { seoDescription: '' },
      { seoDescription: { $regex: /.{161,}/ } }, // Description too long
      { seoKeywords: { $exists: false } },
      { seoKeywords: '' }
    ]
  });
};


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
      // ✅ FIX: Use author from form, fallback to logged-in username
      author: req.body.author || req.user.username,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // ✅ ADD: SEO fields support
      seoTitle: req.body.seoTitle || '',
      seoDescription: req.body.seoDescription || '',
      seoKeywords: req.body.seoKeywords || '',
      seoImage: req.body.seoImage || '',
      canonicalUrl: req.body.canonicalUrl || '',
      noIndex: req.body.noIndex || false,
      autoGenerateSEO: req.body.autoGenerateSEO !== undefined ? req.body.autoGenerateSEO : true
    };
    
    const post = await Post.create(postData);
    console.log(`Created post: ${post.title} by ${post.author}`);
    
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
      // ✅ FIX: Use author from form, fallback to logged-in username
      author: req.body.author || req.user.username
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
    
    console.log(`Updated post: ${post.title} by ${post.author}`);
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


// SEO API Endpoints for Solera Cask Blog System
// Add these routes to your existing server.js

// ===== SEO MANAGEMENT ENDPOINTS =====

// Get SEO data for a specific post
app.get('/api/posts/:id/seo', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Return comprehensive SEO data
    const seoData = post.getSEOData();
    res.json({
      success: true,
      seo: seoData,
      post: {
        id: post.id,
        title: post.title,
        type: post.type,
        status: post.status,
        lastSEOUpdate: post.lastSEOUpdate
      }
    });
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    res.status(500).json({ error: 'Failed to fetch SEO data' });
  }
});

// Update SEO data for a specific post
app.put('/api/posts/:id/seo', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const seoFields = [
      'seoTitle', 'seoDescription', 'seoKeywords', 'seoImage',
      'ogTitle', 'ogDescription', 'ogImage',
      'twitterTitle', 'twitterDescription', 'twitterImage',
      'canonicalUrl', 'noIndex', 'noFollow', 'autoGenerateSEO',
      'author', 'featuredImage'
    ];

    // Update only provided SEO fields
    seoFields.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    // Force SEO update timestamp
    post.lastSEOUpdate = new Date();

    await post.save();

    res.json({
      success: true,
      message: 'SEO data updated successfully',
      seo: post.getSEOData()
    });
  } catch (error) {
    console.error('Error updating SEO data:', error);
    res.status(500).json({ error: 'Failed to update SEO data' });
  }
});

// Bulk SEO analysis endpoint
app.get('/api/posts/seo/analysis', authenticateToken, async (req, res) => {
  try {
    const allPosts = await Post.find({ status: 'published' });
    const seoIssues = await Post.findSEOIssues();
    
    const analysis = {
      totalPosts: allPosts.length,
      postsWithIssues: seoIssues.length,
      issues: {
        missingTitle: 0,
        titleTooLong: 0,
        missingDescription: 0,
        descriptionTooLong: 0,
        missingKeywords: 0,
        missingImage: 0
      },
      recommendations: []
    };

    // Analyze each post
    seoIssues.forEach(post => {
      if (!post.seoTitle || post.seoTitle === '') {
        analysis.issues.missingTitle++;
      }
      if (post.seoTitle && post.seoTitle.length > 60) {
        analysis.issues.titleTooLong++;
      }
      if (!post.seoDescription || post.seoDescription === '') {
        analysis.issues.missingDescription++;
      }
      if (post.seoDescription && post.seoDescription.length > 160) {
        analysis.issues.descriptionTooLong++;
      }
      if (!post.seoKeywords || post.seoKeywords === '') {
        analysis.issues.missingKeywords++;
      }
      if (!post.seoImage && !post.featuredImage) {
        analysis.issues.missingImage++;
      }
    });

    // Generate recommendations
    if (analysis.issues.missingTitle > 0) {
      analysis.recommendations.push(`${analysis.issues.missingTitle} posts need SEO titles`);
    }
    if (analysis.issues.missingDescription > 0) {
      analysis.recommendations.push(`${analysis.issues.missingDescription} posts need SEO descriptions`);
    }
    if (analysis.issues.missingKeywords > 0) {
      analysis.recommendations.push(`${analysis.issues.missingKeywords} posts need keywords`);
    }
    if (analysis.issues.missingImage > 0) {
      analysis.recommendations.push(`${analysis.issues.missingImage} posts need featured images`);
    }

    res.json({
      success: true,
      analysis,
      postsWithIssues: seoIssues.map(post => ({
        id: post.id,
        title: post.title,
        issues: analyzePostSEO(post)
      }))
    });
  } catch (error) {
    console.error('Error performing SEO analysis:', error);
    res.status(500).json({ error: 'Failed to perform SEO analysis' });
  }
});

// Auto-generate SEO for a specific post
app.post('/api/posts/:id/seo/generate', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Force regeneration of SEO fields
    post.autoGenerateSEO = true;
    
    // Clear existing SEO fields to force regeneration
    if (req.body.regenerateAll) {
      post.seoTitle = '';
      post.seoDescription = '';
      post.seoKeywords = '';
    }

    await post.save(); // This triggers the pre-save middleware

    res.json({
      success: true,
      message: 'SEO data generated successfully',
      seo: post.getSEOData()
    });
  } catch (error) {
    console.error('Error generating SEO data:', error);
    res.status(500).json({ error: 'Failed to generate SEO data' });
  }
});

// Bulk SEO generation for multiple posts
app.post('/api/posts/seo/generate-bulk', authenticateToken, async (req, res) => {
  try {
    const { postIds, regenerateAll = false } = req.body;
    
    if (!postIds || !Array.isArray(postIds)) {
      return res.status(400).json({ error: 'Post IDs array is required' });
    }

    const results = {
      success: [],
      failed: [],
      total: postIds.length
    };

    // Process each post
    for (const postId of postIds) {
      try {
        const post = await Post.findOne({ id: postId });
        if (!post) {
          results.failed.push({ postId, error: 'Post not found' });
          continue;
        }

        // Force SEO regeneration
        post.autoGenerateSEO = true;
        
        if (regenerateAll) {
          post.seoTitle = '';
          post.seoDescription = '';
          post.seoKeywords = '';
        }

        await post.save();
        results.success.push({ postId, title: post.title });
      } catch (error) {
        results.failed.push({ postId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `SEO generated for ${results.success.length} of ${results.total} posts`,
      results
    });
  } catch (error) {
    console.error('Error in bulk SEO generation:', error);
    res.status(500).json({ error: 'Failed to generate SEO data for posts' });
  }
});

// Get SEO templates and suggestions
app.get('/api/seo/templates', authenticateToken, async (req, res) => {
  try {
    const templates = {
      titles: {
        'Guide': [
          '{title} - Complete Guide | Solera Cask',
          'How to {action} - {title} Guide | Solera Cask',
          'Master {topic} - {title} | Solera Cask'
        ],
        'News': [
          '{title} - Latest News | Solera Cask',
          'Breaking: {title} | Solera Cask',
          '{title} - Sherry Barrel News | Solera Cask'
        ],
        'Story': [
          '{title} - Heritage Story | Solera Cask',
          'The Story of {title} | Solera Cask',
          '{title} - Jerez Tradition | Solera Cask'
        ]
      },
      descriptions: {
        'Guide': [
          'Learn about {topic} with our comprehensive guide. Expert insights from Solera Cask, premium sherry barrel specialists from Jerez de la Frontera, Spain.',
          'Master the art of {topic} with professional guidance. Discover authentic sherry barrel techniques from Jerez de la Frontera, Spain.',
          'Complete guide to {topic}. Traditional methods and modern expertise from Solera Cask, your trusted sherry barrel partner in Spain.'
        ],
        'News': [
          'Latest news: {title}. Stay updated with Solera Cask\'s innovations in premium sherry barrels from Jerez de la Frontera, Spain.',
          'Breaking news from Solera Cask: {title}. Premium sherry barrel developments from Jerez de la Frontera, Spain.',
          '{title} - Read the latest developments in sherry barrel craftsmanship from Solera Cask, Jerez de la Frontera, Spain.'
        ],
        'Story': [
          'Discover the heritage behind {title}. Authentic stories from Solera Cask, premium sherry barrel craftsmen in Jerez de la Frontera, Spain.',
          'The fascinating story of {title}. Traditional craftsmanship and heritage from Solera Cask, Jerez de la Frontera, Spain.',
          'Explore the history of {title}. Heritage tales from the heart of sherry country - Jerez de la Frontera, Spain.'
        ]
      },
      keywords: {
        base: ['sherry barrels', 'Solera Cask', 'Jerez de la Frontera', 'Spain'],
        whisky: ['whisky aging', 'scotch barrels', 'whisky finishing', 'barrel aging'],
        rum: ['rum aging', 'rum barrels', 'rum finishing', 'Caribbean rum'],
        general: ['barrel craftsmanship', 'cooperage', 'oak barrels', 'spirit aging']
      }
    };

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching SEO templates:', error);
    res.status(500).json({ error: 'Failed to fetch SEO templates' });
  }
});

// SEO validation endpoint
app.post('/api/seo/validate', authenticateToken, async (req, res) => {
  try {
    const { seoTitle, seoDescription, seoKeywords } = req.body;
    
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: []
    };

    // Validate SEO title
    if (!seoTitle) {
      validation.errors.push('SEO title is required');
      validation.isValid = false;
    } else {
      if (seoTitle.length < 30) {
        validation.warnings.push('SEO title is quite short - consider making it 30-60 characters');
      }
      if (seoTitle.length > 60) {
        validation.errors.push('SEO title is too long - keep it under 60 characters');
        validation.isValid = false;
      }
      if (!seoTitle.includes('Solera Cask')) {
        validation.suggestions.push('Consider including "Solera Cask" in your title for brand recognition');
      }
    }

    // Validate SEO description
    if (!seoDescription) {
      validation.errors.push('SEO description is required');
      validation.isValid = false;
    } else {
      if (seoDescription.length < 120) {
        validation.warnings.push('SEO description is quite short - consider making it 120-160 characters');
      }
      if (seoDescription.length > 160) {
        validation.errors.push('SEO description is too long - keep it under 160 characters');
        validation.isValid = false;
      }
      if (!seoDescription.toLowerCase().includes('jerez')) {
        validation.suggestions.push('Consider mentioning "Jerez de la Frontera" for location relevance');
      }
    }

    // Validate keywords
    if (!seoKeywords) {
      validation.warnings.push('SEO keywords are empty - consider adding relevant keywords');
    } else {
      const keywordCount = seoKeywords.split(',').length;
      if (keywordCount < 3) {
        validation.warnings.push('Consider adding more keywords (3-7 recommended)');
      }
      if (keywordCount > 10) {
        validation.warnings.push('Too many keywords - focus on 3-7 most relevant ones');
      }
    }

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Error validating SEO data:', error);
    res.status(500).json({ error: 'Failed to validate SEO data' });
  }
});

// Enhanced post creation/update to include SEO
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const postData = req.body;
    
    // Generate unique ID if not provided
    if (!postData.id) {
      postData.id = generateId(postData.title);
    }

    // Create new post with SEO data
    const post = new Post(postData);
    await post.save(); // This will trigger SEO auto-generation

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...post.toObject(),
        seoData: post.getSEOData()
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Enhanced post update to include SEO
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update all provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        post[key] = req.body[key];
      }
    });

    await post.save(); // This will trigger SEO auto-generation if enabled

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: {
        ...post.toObject(),
        seoData: post.getSEOData()
      }
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// SEO sitemap generation endpoint
app.get('/api/seo/sitemap', async (req, res) => {
  try {
    const posts = await Post.find({ 
      status: 'published',
      noIndex: { $ne: true }
    }).sort({ publishedAt: -1 });

    const baseUrl = process.env.BASE_URL || 'https://soleracask.com';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add homepage
    sitemap += `
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Add blog index
    sitemap += `
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add individual posts
    posts.forEach(post => {
      const slug = post.generateSlug();
      const lastmod = post.updatedAt.toISOString().split('T')[0];
      
      sitemap += `
  <url>
    <loc>${baseUrl}/post/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// ===== UTILITY FUNCTIONS =====

// Analyze individual post SEO
function analyzePostSEO(post) {
  const issues = [];
  
  if (!post.seoTitle || post.seoTitle === '') {
    issues.push('Missing SEO title');
  } else if (post.seoTitle.length > 60) {
    issues.push('SEO title too long');
  } else if (post.seoTitle.length < 30) {
    issues.push('SEO title too short');
  }
  
  if (!post.seoDescription || post.seoDescription === '') {
    issues.push('Missing SEO description');
  } else if (post.seoDescription.length > 160) {
    issues.push('SEO description too long');
  } else if (post.seoDescription.length < 120) {
    issues.push('SEO description too short');
  }
  
  if (!post.seoKeywords || post.seoKeywords === '') {
    issues.push('Missing SEO keywords');
  }
  
  if (!post.seoImage && !post.featuredImage) {
    issues.push('Missing featured/SEO image');
  }
  
  return issues;
}

// Enhanced public post endpoint with SEO data
app.get('/api/posts-public', async (req, res) => {
  try {
    const { id, slug } = req.query;
    
    if (id) {
      // Get single post by ID
      const post = await Post.findOne({ id, status: 'published' });
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json({
        ...post.toObject(),
        seoData: post.getSEOData()
      });
    } else if (slug) {
      // Get single post by slug
      const posts = await Post.find({ status: 'published' });
      const post = posts.find(p => p.generateSlug() === slug);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json({
        ...post.toObject(),
        seoData: post.getSEOData()
      });
    } else {
      // Get all published posts
      const posts = await Post.find({ status: 'published' })
        .sort({ date: -1 });
      
      const postsWithSEO = posts.map(post => ({
        ...post.toObject(),
        seoData: post.getSEOData()
      }));
      
      res.json(postsWithSEO);
    }
  } catch (error) {
    console.error('Error fetching public posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://soleracask.com';
  
  const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/api/seo/sitemap

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow important pages
Allow: /blog
Allow: /post/
Allow: /images/`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = {
  analyzePostSEO
};

module.exports = app;