// CORS configuration for custom domain with API subdomain
const cors = require('cors');

module.exports = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://groot-cvb5.onrender.com',
    'https://groot-1.onrender.com',
    'https://groot-2.onrender.com',
    'https://groot-frontend.onrender.com',
    'https://all4youauctions.co.za',
    'https://www.all4youauctions.co.za',
    'https://api.all4youauctions.co.za'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
});
