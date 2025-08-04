// backend/api/fica/index.js - Integrated FICA Management
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_PATH = path.join(__dirname, '../../data/users.json');
const FICA_UPLOADS_DIR = path.join(__dirname, '../../uploads/fica');
if (!fs.existsSync(FICA_UPLOADS_DIR)) fs.mkdirSync(FICA_UPLOADS_DIR, { recursive: true });

const upload = multer({ 
  dest: FICA_UPLOADS_DIR,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

function readUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// List all users with FICA documents (admin view)
router.get('/', (req, res) => {
  const users = readUsers();
  const ficaUsers = users
    .filter(user => user.idDocument || user.proofOfAddress)
    .map(user => ({
      email: user.email,
      name: user.name,
      status: user.ficaStatus || (user.ficaApproved ? 'approved' : 'pending'),
      registeredAt: user.registeredAt,
      idDocument: user.idDocument,
      proofOfAddress: user.proofOfAddress,
      fileUrl: user.idDocument ? `/uploads/fica/${user.idDocument}` : null
    }));
  
  res.json(ficaUsers);
});

// Get FICA status for a specific user
router.get('/:email', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.email === req.params.email);
  
  if (!user) {
    return res.json({ status: 'not_uploaded' });
  }

  let status = 'not_uploaded';
  if (user.ficaStatus) {
    status = user.ficaStatus;
  } else if (user.ficaApproved === true) {
    status = 'approved';
  } else if (user.idDocument && user.proofOfAddress) {
    status = 'pending';
  }

  res.json({ 
    status,
    email: user.email,
    name: user.name,
    registeredAt: user.registeredAt
  });
});

// Upload FICA document for existing user
router.post('/:email', upload.single('file'), (req, res) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === req.params.email);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const fileUrl = `/uploads/fica/${req.file.filename}`;
  
  // Update user's FICA document
  users[userIndex].idDocument = req.file.filename;
  users[userIndex].ficaStatus = 'pending';
  users[userIndex].ficaApproved = false;
  
  writeUsers(users);
  
  console.log(`📄 FICA document uploaded for ${req.params.email}`);
  res.json({ 
    success: true, 
    status: 'pending',
    message: 'FICA document uploaded successfully. Waiting for admin approval.'
  });
});

// Approve FICA (admin)
router.post('/:email/approve', async (req, res) => {
  try {
    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === req.params.email);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user status
    users[userIndex].ficaStatus = 'approved';
    users[userIndex].ficaApproved = true;
    users[userIndex].approvedAt = new Date().toISOString();
    
    writeUsers(users);

    // Send approval email
    try {
      const { sendMail } = require('../../utils/mailer');
      await sendMail({
        to: users[userIndex].email,
        subject: 'FICA Approved - All4You Auctions',
        html: `
          <h2>FICA Documents Approved!</h2>
          <p>Dear ${users[userIndex].name},</p>
          <p>Great news! Your FICA documents have been approved.</p>
          <p><strong>You can now participate fully in auctions and place bids!</strong></p>
          <p>Thank you for choosing All4You Auctions.</p>
          <p>Happy bidding!</p>
          <p>All4You Auctions Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    console.log(`✅ FICA approved for ${req.params.email}`);
    res.json({ 
      success: true, 
      message: 'FICA approved successfully',
      user: {
        email: users[userIndex].email,
        name: users[userIndex].name,
        status: 'approved'
      }
    });

  } catch (error) {
    console.error('Error approving FICA:', error);
    res.status(500).json({ error: 'Failed to approve FICA' });
  }
});

// Reject FICA (admin)
router.post('/:email/reject', async (req, res) => {
  try {
    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === req.params.email);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { reason } = req.body;

    // Update user status
    users[userIndex].ficaStatus = 'rejected';
    users[userIndex].ficaApproved = false;
    users[userIndex].rejectedAt = new Date().toISOString();
    users[userIndex].rejectionReason = reason || 'Documents did not meet requirements';
    
    writeUsers(users);

    // Send rejection email
    try {
      const { sendMail } = require('../../utils/mailer');
      await sendMail({
        to: users[userIndex].email,
        subject: 'FICA Documents Require Attention - All4You Auctions',
        html: `
          <h2>FICA Documents Rejected</h2>
          <p>Dear ${users[userIndex].name},</p>
          <p>Unfortunately, your FICA documents have been rejected.</p>
          <p><strong>Reason:</strong> ${users[userIndex].rejectionReason}</p>
          <p>Please upload new, clearer documents to continue with account activation.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>All4You Auctions Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    console.log(`❌ FICA rejected for ${req.params.email}: ${reason}`);
    res.json({ 
      success: true, 
      message: 'FICA rejected',
      user: {
        email: users[userIndex].email,
        name: users[userIndex].name,
        status: 'rejected',
        reason: users[userIndex].rejectionReason
      }
    });

  } catch (error) {
    console.error('Error rejecting FICA:', error);
    res.status(500).json({ error: 'Failed to reject FICA' });
  }
});

// Get FICA document file
router.get('/document/:filename', (req, res) => {
  const filePath = path.join(FICA_UPLOADS_DIR, req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

module.exports = router;
