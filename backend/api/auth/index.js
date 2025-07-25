

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    fica: {
      proofOfAddress,
      idCopy
    }
  };
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
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
  // Admin hardcoded user (optional fallback)
  if (email === 'admin@all4you.com' && password === 'admin123') {
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

module.exports = router;
