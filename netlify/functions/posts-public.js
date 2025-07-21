const mongoose = require('mongoose');

// Cache connection
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  cachedDb = mongoose.connection;
  return cachedDb;
}

// Post Schema
const PostSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: String,
  date: String,
  excerpt: String,
  content: String,
  link: String,
  tags: [String],
  status: String,
  createdAt: Date,
  updatedAt: Date
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

function createPostSlug(post) {
  return post.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

exports.handler = async (event, context) => {
  // Allow connection reuse
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    await connectDB();
    
    const { path, httpMethod } = event;
    const segments = path.split('/').filter(Boolean);
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    };
    
    if (httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }
    
    // GET /api/posts/public - All published posts
    if (httpMethod === 'GET' && segments[1] === 'posts' && segments[2] === 'public' && segments.length === 3) {
      const posts = await Post.find({ status: 'published' })
        .select('-_id -__v')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify(posts)
      };
    }
    
    // GET /api/posts/public/:id - Single post by ID
    if (httpMethod === 'GET' && segments[1] === 'posts' && segments[2] === 'public' && segments.length === 4) {
      const id = segments[3];
      const post = await Post.findOne({ id, status: 'published' }).select('-_id -__v');
      
      if (!post) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Post not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify(post)
      };
    }
    
    // GET /api/posts/public/slug/:slug - Single post by slug
    if (httpMethod === 'GET' && segments[1] === 'posts' && segments[2] === 'public' && segments[3] === 'slug') {
      const slug = segments[4];
      const posts = await Post.find({ status: 'published' }).select('-_id -__v');
      const post = posts.find(p => createPostSlug(p) === slug);
      
      if (!post) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Post not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify(post)
      };
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not found' })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};