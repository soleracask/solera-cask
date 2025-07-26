const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  
  await mongoose.connect(process.env.MONGO_URI);
  
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

function generateId(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-') + '-' + Date.now();
}

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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    await connectDB();
    
    // Authenticate user
    const user = authenticateToken(event.headers.authorization);
    
    const { httpMethod, path } = event;
    
    // Extract post ID from path: /posts/123 -> 123
    const pathParts = path.split('/');
    const postId = pathParts[pathParts.length - 1];
    const isSpecificPost = pathParts.length > 2 && postId !== 'posts';
    
    // GET /posts - Get all posts (admin)
    if (httpMethod === 'GET') {
      if (isSpecificPost) {
        const post = await Post.findOne({ id: postId }).select('-_id -__v');
        
        if (!post) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Post not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(post)
        };
      }
      
      // Return all posts
      const posts = await Post.find()
        .select('-_id -__v')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(posts)
      };
    }
    
    // POST /posts - Create new post
    if (httpMethod === 'POST') {
      const postData = JSON.parse(event.body);
      
      if (!postData.title || (!postData.content && !postData.contentHtml)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Title and content are required' })
        };
      }
      
      const newPost = {
        id: postData.id || generateId(postData.title),
        title: postData.title.trim(),
        type: postData.type || 'News',
        excerpt: postData.excerpt ? postData.excerpt.trim() : '',
        content: postData.content ? postData.content.trim() : '',
        contentHtml: postData.contentHtml ? postData.contentHtml.trim() : '',
        featuredImage: postData.featuredImage || '',
        featured: postData.featured || false,
        link: postData.link ? postData.link.trim() : '',
        tags: Array.isArray(postData.tags) ? postData.tags : 
              (typeof postData.tags === 'string' ? postData.tags.split(',').map(t => t.trim()) : []),
        status: postData.status || 'published',
        date: postData.date || new Date().toISOString().split('T')[0],
        author: user.username,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const post = await Post.create(newPost);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(post)
      };
    }
    
    // PUT /posts/123 - Update post
    if (httpMethod === 'PUT') {
      if (!isSpecificPost) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Post ID is required in URL path' })
        };
      }
      
      const updateData = JSON.parse(event.body);
      updateData.updatedAt = new Date();
      updateData.author = user.username;
      
      if (updateData.tags && typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(t => t.trim());
      }
      
      const post = await Post.findOneAndUpdate(
        { id: postId },
        updateData,
        { new: true, select: '-_id -__v' }
      );
      
      if (!post) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Post not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(post)
      };
    }
    
    // DELETE /posts/123 - Delete post
    if (httpMethod === 'DELETE') {
      if (!isSpecificPost) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Post ID is required in URL path' })
        };
      }
      
      const post = await Post.findOneAndDelete({ id: postId });
      
      if (!post) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Post not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Post deleted successfully' })
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Posts function error:', error);
    
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