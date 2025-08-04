const jwt = require('jsonwebtoken');

// Use a strong secret in production!
const SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// No hardcoded admin credentials - admin access disabled

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, password } = req.body;
  // Admin access disabled - no users configured
  return res.status(401).json({ error: 'Admin access disabled - no admin users configured' });
};
