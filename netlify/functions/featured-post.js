const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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


const PostSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: String,
  date: String,
  excerpt: String,
  content: String,
  contentHtml: String,
  link: String,
  tags: [String],
  status: String,
  featured: { type: Boolean, default: false },
  featuredImage: String,
  author: String,
  
  // ✅ ADD THESE SEO FIELDS:
  seoTitle: String,
  seoDescription: String,
  seoKeywords: String,
  seoImage: String,
  canonicalUrl: String,
  noIndex: { type: Boolean, default: false },
  autoGenerateSEO: { type: Boolean, default: true },
  
  createdAt: Date,
  updatedAt: Date
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

function authenticateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    await connectDB();
    
    const { httpMethod } = event;
    
    // GET /featured-post - Get current featured post (public)
    if (httpMethod === 'GET') {
      // First try to find a post specifically marked as featured
      let featuredPost = await Post.findOne({ 
        featured: true, 
        status: 'published' 
      }).select('-_id -__v').sort({ createdAt: -1 });
      
      // If no featured post found, get the most recent published post
      if (!featuredPost) {
        featuredPost = await Post.findOne({ 
          status: 'published' 
        }).select('-_id -__v').sort({ createdAt: -1 });
      }
      
      if (!featuredPost) {
        return {
          statusCode: 404,
          headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
          body: JSON.stringify({ message: 'No featured post found' })
        };
      }
      
      // Ensure the post has all fields expected by homepage integration
      const responsePost = {
        ...featuredPost.toObject(),
        // Add contentHtml if it doesn't exist
        contentHtml: featuredPost.contentHtml || featuredPost.content,
        // Add featuredImage if it doesn't exist but there are images
        featuredImage: featuredPost.featuredImage || 
                      (featuredPost.images && featuredPost.images.length > 0 ? featuredPost.images[0] : null)
      };
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify(responsePost)
      };
    }
    
    // POST /featured-post - Set featured post (admin only)
    if (httpMethod === 'POST') {
      // Authenticate user for admin operations
      const user = authenticateToken(event.headers.authorization);
      
      const { postId } = JSON.parse(event.body);
      
      // Remove featured status from all posts
      await Post.updateMany({}, { featured: false });
      
      // Set new featured post if postId provided
      if (postId) {
        const post = await Post.findOneAndUpdate(
          { id: postId, status: 'published' },
          { featured: true, updatedAt: new Date() },
          { new: true, select: '-_id -__v' }
        );
        
        if (!post) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Post not found or not published' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Featured post updated successfully',
            post: post
          })
        };
      } else {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Featured post cleared successfully' })
        };
      }
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Featured post function error:', error);
    
    if (error.message === 'No token provided' || error.name === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Authentication required' })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};