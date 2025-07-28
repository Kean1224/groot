const jwt = require('jsonwebtoken');

// Use a strong secret in production!
const SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'Keanmartin75@gmail.com';
const ADMIN_PASSWORD = 'Tristan@89';

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Issue JWT
    const token = jwt.sign({ email, role: 'admin' }, SECRET, { expiresIn: '2h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};
