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
    
    const { httpMethod, queryStringParameters } = event;
    
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
    
    if (httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }
    
    // For Netlify Functions, we need to handle different endpoints based on the function name
    // This function handles all posts-public routes
    
    // Check if there's a slug parameter (for individual posts)
    if (queryStringParameters && queryStringParameters.slug) {
      const slug = queryStringParameters.slug;
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
    
    // Check if there's an id parameter (for individual posts by ID)
    if (queryStringParameters && queryStringParameters.id) {
      const id = queryStringParameters.id;
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
    
    // Default: Return all published posts
    const posts = await Post.find({ status: 'published' })
      .select('-_id -__v')
      .sort({ createdAt: -1 });
    
    // If no posts exist, create default posts
    if (posts.length === 0) {
      console.log('No posts found, creating default posts...');
      await createDefaultPosts();
      
      // Fetch again after creating defaults
      const newPosts = await Post.find({ status: 'published' })
        .select('-_id -__v')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify(newPosts)
      };
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify(posts)
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Create default posts
async function createDefaultPosts() {
  const generateId = (title) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();
  };

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
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date()
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
      status: "published",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    }
  ];

  try {
    await Post.insertMany(defaultPosts);
    console.log('Default posts created successfully');
  } catch (error) {
    console.error('Error creating default posts:', error);
  }
}