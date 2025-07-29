const path = require('path');

const fs = require('fs');
const path = require('path');
const verifyAdmin = require('../auth/verify-admin');
const dataPath = path.join(__dirname, '../../data/auctionDeposits.json');

function readDeposits() {
  if (!fs.existsSync(dataPath)) return [];
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}
function writeDeposits(deposits) {
  fs.writeFileSync(dataPath, JSON.stringify(deposits, null, 2), 'utf-8');
}

// GET: Get deposit status for a user/auction
router.get('/:auctionId/:email', (req, res) => {
  const { auctionId, email } = req.params;
  const deposits = readDeposits();
  const entry = deposits.find(d => d.auctionId === auctionId && d.email === email);
  res.json(entry || { auctionId, email, status: 'not_paid' });
});

// POST: User marks deposit as paid (pending admin approval)
router.post('/:auctionId/:email', (req, res) => {
  const { auctionId, email } = req.params;
  const deposits = readDeposits();
  let entry = deposits.find(d => d.auctionId === auctionId && d.email === email);
  if (!entry) {
    entry = { auctionId, email, status: 'pending', notified: false };
    deposits.push(entry);
  } else {
    entry.status = 'pending';
    entry.notified = false;
  }
  writeDeposits(deposits);
  res.json(entry);
});

// PUT: Admin approves deposit
router.put('/:auctionId/:email', verifyAdmin, (req, res) => {
  const { auctionId, email } = req.params;
  const deposits = readDeposits();
  let entry = deposits.find(d => d.auctionId === auctionId && d.email === email);
  if (!entry) {
    return res.status(404).json({ error: 'No deposit record found' });
  }
  entry.status = req.body.status || 'approved';
  writeDeposits(deposits);
  res.json(entry);
});

// GET: List all deposits for an auction (admin)
router.get('/auction/:auctionId', verifyAdmin, (req, res) => {
  const { auctionId } = req.params;
  const deposits = readDeposits().filter(d => d.auctionId === auctionId);
  res.json(deposits);
});

module.exports = router;
