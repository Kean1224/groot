

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  getUserByEmail,
  setUserPassword,
  saveResetToken,
  getEmailByToken,
  deleteToken,
  generateToken
} = require('./reset-utils');
let sendMail = null;
try {
  sendMail = require('../../utils/mailer').sendMail;
} catch {}
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = getUserByEmail(email);
  if (!user) return res.json({ success: true }); // Don't reveal if email exists
  const token = generateToken();
  const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour
  saveResetToken(email, token, expiresAt);
  if (sendMail) {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    });
  }
  res.json({ success: true });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  const email = getEmailByToken(token);
  if (!email) return res.status(400).json({ error: 'Invalid or expired token' });
  const hashed = await bcrypt.hash(password, 10);
  setUserPassword(email, hashed);
  deleteToken(token);
  res.json({ success: true });
});
const multer = require('multer');

// Multer setup for FICA uploads
const ficaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/fica'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  }
});
const uploadFica = multer({ storage: ficaStorage });

const USERS_FILE = path.join(__dirname, '../../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '7d';



// POST /api/auth/register (with FICA uploads)
router.post('/register', uploadFica.fields([
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'idCopy', maxCount: 1 }
]), async (req, res) => {
  console.log('Register request body:', req.body);
  console.log('Register request files:', req.files);
  const { email, password, name, username, cell } = req.body;
  if (!email || !password || !name || !username) {
    return res.status(400).json({ error: 'Email, password, name, and username required.' });
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return res.status(400).json({ error: 'Username must contain only letters and numbers.' });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
  }
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already taken.' });
  }
  const hashed = await bcrypt.hash(password, 10);
  // Handle FICA files
  const proofOfAddress = req.files && req.files['proofOfAddress'] ? req.files['proofOfAddress'][0].filename : null;
  const idCopy = req.files && req.files['idCopy'] ? req.files['idCopy'][0].filename : null;
  const newUser = {
    email,
    password: hashed,
    name,
    username,
    cell: cell || '',
    ficaApproved: false,
    suspended: false,
    registeredAt: new Date().toISOString(),
    watchlist: [],
    idDocument: idCopy,
    proofOfAddress: proofOfAddress
  };
  console.log('New user to be saved:', newUser);
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log('All users after registration:', users);
  // Issue JWT
  const token = jwt.sign({ email, name, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ status: 'success', token, user: { email, name, cell: cell || '', fica: newUser.fica } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }
  if (!fs.existsSync(USERS_FILE)) {
    return res.status(500).json({ error: 'User data not found.' });
  }
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  // Admin hardcoded user (updated with your credentials)
  if (email === 'Keanmartin75@gmail.com' && password === 'Tristan@89') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ role: 'admin', status: 'success', email, token });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  if (user.suspended) {
    return res.status(403).json({ error: 'User is suspended.' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const token = jwt.sign({ email: user.email, name: user.name, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({
    role: 'user',
    email: user.email,
    name: user.name || '',
    cell: user.cell || '',
    ficaApproved: user.ficaApproved || false,
    status: 'success',
    token
  });
});

// POST /api/auth/admin-login - separate admin login endpoint
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }
  
  // Admin credentials check
  if (email === 'Keanmartin75@gmail.com' && password === 'Tristan@89') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ role: 'admin', status: 'success', email, token });
  }
  
  return res.status(401).json({ error: 'Invalid admin credentials.' });
});


// GET /api/auth/session - check login and admin status
router.get('/session', (req, res) => {
  let token = null;
  // Try to get token from Authorization header (Bearer) or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.replace('Bearer ', '');
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) return res.json({ isLoggedIn: false });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ isLoggedIn: true, email: payload.email, role: payload.role, isAdmin: payload.role === 'admin' });
  } catch {
    res.json({ isLoggedIn: false });
  }
});

module.exports = router;
