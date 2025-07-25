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
  const parts = body.toString('binary').split(`--${boundary}`);
  
  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data; name="image"')) {
      const filenameMatch = part.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'upload.jpg';
      
      const dataStartIndex = part.indexOf('\r\n\r\n') + 4;
      const dataEndIndex = part.lastIndexOf('\r\n');
      
      if (dataStartIndex < dataEndIndex) {
        const imageData = part.slice(dataStartIndex, dataEndIndex);
        const buffer = Buffer.from(imageData, 'binary');
        
        return {
          filename,
          buffer,
          size: buffer.length
        };
      }
    }
  }
  
  throw new Error('No image found in multipart data');
}

// Upload to Cloudinary
async function uploadToCloudinary(imageBuffer, filename) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials not configured');
  }

  // Create signature for Cloudinary
  const timestamp = Math.round(Date.now() / 1000);
  const crypto = require('crypto');
  
  const publicId = `solera-cask/${uuidv4()}`;
  const params = {
    timestamp: timestamp,
    public_id: publicId,
    folder: 'solera-cask'
  };
  
  // Create signature
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');

  // Create form data for Cloudinary
  const FormData = require('form-data');
  const form = new FormData();
  
  form.append('file', imageBuffer, { filename });
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('public_id', publicId);
  form.append('folder', 'solera-cask');
  form.append('signature', signature);

  // Upload to Cloudinary
  const fetch = require('node-fetch');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const result = await response.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height
  };
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
    
    // Validate file size (10MB limit for Cloudinary)
    if (imageData.size > 10 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'File size must be less than 10MB' })
      };
    }
    
    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(imageData.buffer, imageData.filename);
    
    // Generate response
    const response = {
      id: uuidv4(),
      url: cloudinaryResult.url,
      filename: imageData.filename,
      size: imageData.size,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      publicId: cloudinaryResult.publicId,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.username
    };
    
    console.log(`Image uploaded to Cloudinary: ${imageData.filename} (${imageData.size} bytes) by ${user.username}`);
    
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