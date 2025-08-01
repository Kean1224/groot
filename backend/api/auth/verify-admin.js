const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

module.exports = (req, res, next) => {
  console.log('verifyAdmin middleware called for:', req.method, req.path);
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader ? 'present' : 'missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Missing or invalid authorization header');
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'present' : 'missing');
  
  try {
    const payload = jwt.verify(token, SECRET);
    console.log('JWT verified, payload:', payload);
    if (payload.role !== 'admin') {
      console.log('User role is not admin:', payload.role);
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.admin = payload;
    console.log('Admin verification successful');
    next ? next() : res.json({ ok: true });
  } catch (err) {
    console.log('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
