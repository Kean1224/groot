const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const authenticateToken = require('../../middleware/auth');
const router = express.Router();

const usersPath = path.join(__dirname, '../../data/users.json');
const uploadDir = path.join(__dirname, '../../uploads/fica');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const email = req.body.email.replace(/[^a-zA-Z0-9]/g, '_'); // sanitize
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'idDocument' ? 'id' : 'proof';
    cb(null, `${email}-${prefix}${ext}`);
  }
});
const upload = multer({ storage });

// Helpers
function readUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}
function writeUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Ensure demo user exists
function ensureDemoUser() {
  const users = readUsers();
  const demoExists = users.some(u => u.email === 'demo@example.com');

  if (!demoExists) {
    const demoUser = {
      email: 'demo@example.com',
      password: 'demo123',
      name: 'Demo User',
      ficaApproved: true,
      suspended: false,
      registeredAt: new Date().toISOString(),
      idDocument: 'demo_id.pdf',
      proofOfAddress: 'demo_proof.pdf',
      watchlist: []
    };
    users.push(demoUser);
    writeUsers(users);
    console.log('✅ Demo user added.');
  }
}
ensureDemoUser();

// ✅ DELETE user by email
router.delete('/:email', (req, res) => {
  const users = readUsers();
  const email = decodeURIComponent(req.params.email);
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const [deleted] = users.splice(idx, 1);
  writeUsers(users);
  res.json({ message: 'User deleted', user: deleted });
});

// ✅ GET all users
router.get('/', (req, res) => {
  const users = readUsers();
  res.json(users);
});

// ✅ GET single user
router.get('/:email', (req, res) => {
  const users = readUsers();
  const email = decodeURIComponent(req.params.email);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ✅ PUT: Approve FICA
const { sendMail } = require('../../utils/mailer');
router.put('/fica/:email', async (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.email === req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.ficaApproved = true;
  writeUsers(users);

  // Send FICA approval email
  try {
    await sendMail({
      to: user.email,
      subject: 'FICA Approved - All4You Auctions',
      text: `Dear ${user.name || user.email},\n\nYour FICA documents have been approved. You can now participate fully in auctions.\n\nThank you!`,
      html: `<p>Dear ${user.name || user.email},</p><p>Your FICA documents have been <b>approved</b>. You can now participate fully in auctions.</p><p>Thank you!</p>`
    });
  } catch (e) {
    // Log but don't block approval
    console.error('Failed to send FICA approval email:', e);
  }

  res.json({ message: 'FICA approved', user });
});

const verifyAdmin = require('../auth/verify-admin');

// ✅ PUT: Suspend user (admin only)
router.put('/suspend/:email', verifyAdmin, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.email === req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Set suspended to the value provided in the request body
  if (typeof req.body.suspended === 'boolean') {
    user.suspended = req.body.suspended;
    writeUsers(users);
    res.json({ message: `User ${user.suspended ? 'suspended' : 'unsuspended'}`, user });
  } else {
    res.status(400).json({ error: 'Missing or invalid suspended value' });
  }
});

// ✅ PUT: Update user (admin only)
router.put('/:email', verifyAdmin, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.email === req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  Object.assign(user, req.body);
  writeUsers(users);
  res.json({ message: 'User updated', user });
});

// ✅ PUT: Toggle item in user's watchlist (user only, not admin)
router.put('/:email/watchlist', (req, res) => {
  const { lotId } = req.body;
  if (!lotId) return res.status(400).json({ error: 'Missing lotId' });

  const users = readUsers();
  const user = users.find(u => u.email === req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!user.watchlist) user.watchlist = [];

  if (user.watchlist.includes(lotId)) {
    user.watchlist = user.watchlist.filter(id => id !== lotId);
  } else {
    user.watchlist.push(lotId);
  }

  writeUsers(users);
  res.json({ message: 'Watchlist updated', watchlist: user.watchlist });
});

module.exports = router;
