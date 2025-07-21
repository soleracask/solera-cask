const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: 'admin' },
  lastLogin: Date
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }
  
  try {
    await connectDB();
    
    const { username, password } = JSON.parse(event.body);
    
    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Username and password are required' })
      };
    }
    
    // Check if user exists, if not create default admin
    let user = await User.findOne({ username });
    
    if (!user && username === process.env.ADMIN_USERNAME) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      user = await User.create({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin'
      });
    }
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }
    
    // Update last login
    await User.findOneAndUpdate(
      { username },
      { lastLogin: new Date() }
    );
    
    const token = jwt.sign(
      { username: user.username, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          username: user.username,
          role: user.role
        },
        message: 'Login successful',
        expiresIn: '8h'
      })
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};