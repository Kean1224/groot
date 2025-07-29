const express = require('express');
const router = express.Router();

// Test endpoint with explicit CORS headers
router.get('/ping-cors-test', (req, res) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', 'https://groot-cvb5.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log('CORS Test ping request from:', req.get('origin'));
  res.json({ 
    status: 'ok-with-cors', 
    time: new Date().toISOString(),
    version: '1.3-explicit-cors',
    origin: req.get('origin'),
    headers: req.headers
  });
});

module.exports = router;
