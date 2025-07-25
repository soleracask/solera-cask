const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function authenticateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Simple multipart parser for Netlify functions
function parseMultipartData(event) {
  const boundary = event.headers['content-type'].split('boundary=')[1];
  if (!boundary) {
    throw new Error('No boundary found in multipart data');
  }
  
  const body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  const parts = body.toString().split(`--${boundary}`);
  
  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data; name="image"')) {
      // Extract filename
      const filenameMatch = part.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'upload.jpg';
      
      // Find the start of binary data (after double CRLF)
      const dataStartIndex = part.indexOf('\r\n\r\n') + 4;
      const dataEndIndex = part.lastIndexOf('\r\n');
      
      if (dataStartIndex < dataEndIndex) {
        const imageData = part.slice(dataStartIndex, dataEndIndex);
        
        // Convert to base64 for storage
        const base64Data = Buffer.from(imageData, 'binary').toString('base64');
        const dataUrl = `data:image/${filename.split('.').pop()};base64,${base64Data}`;
        
        return {
          filename,
          data: dataUrl,
          size: imageData.length
        };
      }
    }
  }
  
  throw new Error('No image found in multipart data');
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    // Authenticate user
    const user = authenticateToken(event.headers.authorization);
    
    // Check content type
    if (!event.headers['content-type'] || !event.headers['content-type'].includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Content-Type must be multipart/form-data' })
      };
    }
    
    // Parse the uploaded image
    const imageData = parseMultipartData(event);
    
    // Validate file size (5MB limit)
    if (imageData.size > 5 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'File size must be less than 5MB' })
      };
    }
    
    // Generate unique ID and create response
    const imageId = uuidv4();
    const response = {
      id: imageId,
      url: imageData.data,
      filename: imageData.filename,
      size: imageData.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.username
    };
    
    console.log(`Image uploaded: ${imageData.filename} (${imageData.size} bytes) by ${user.username}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Upload function error:', error);
    
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
      body: JSON.stringify({ message: 'Upload failed', error: error.message })
    };
  }
};