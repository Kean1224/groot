// Test CORS with Node.js
const https = require('https');

const options = {
  hostname: 'groot-2.onrender.com',
  port: 443,
  path: '/api/ping',
  method: 'GET',
  headers: {
    'Origin': 'https://groot-cvb5.onrender.com',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
