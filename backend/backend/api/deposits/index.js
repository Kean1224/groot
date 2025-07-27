const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersPath = path.join(__dirname, '../../data/users.json');
const auctionsPath = path.join(__dirname, '../../data/auctions.json');

function readUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}
function writeUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2), 'utf-8');
}
function readAuctions() {
  if (!fs.existsSync(auctionsPath)) return [];
  return JSON.parse(fs.readFileSync(auctionsPath, 'utf-8'));
}

// POST: User requests/makes deposit for an auction
router.post('/request', (req, res) => {
  const { email, auctionId } = req.body;
  if (!email || !auctionId) return res.status(400).json({ error: 'Missing email or auctionId' });
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  if (!auction.depositRequired) return res.status(400).json({ error: 'Deposit not required for this auction' });
  if (!user.deposits) user.deposits = [];
  let deposit = user.deposits.find(d => d.auctionId === auctionId);
  if (!deposit) {
    deposit = { auctionId, status: 'paid', returned: false };
    user.deposits.push(deposit);
  } else {
    deposit.status = 'paid';
    deposit.returned = false;
  }
  writeUsers(users);
  res.json({ message: 'Deposit marked as paid', deposit });
});

// GET: Get deposit status for a user/auction
router.get('/status/:email/:auctionId', (req, res) => {
  const { email, auctionId } = req.params;
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const deposit = user.deposits ? user.deposits.find(d => d.auctionId === auctionId) : null;
  res.json({ deposit });
});

// PUT: Admin marks deposit as returned or in progress
router.put('/return', (req, res) => {
  const { email, auctionId, status } = req.body;
  if (!email || !auctionId || !status) return res.status(400).json({ error: 'Missing fields' });
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.deposits) user.deposits = [];
  let deposit = user.deposits.find(d => d.auctionId === auctionId);
  if (!deposit) {
    deposit = { auctionId, status: 'paid', returned: false };
    user.deposits.push(deposit);
  }
  if (status === 'in_progress') {
    deposit.status = 'return_in_progress';
    deposit.returned = false;
  } else if (status === 'returned') {
    deposit.status = 'returned';
    deposit.returned = true;
  }
  writeUsers(users);
  res.json({ message: 'Deposit status updated', deposit });
});

module.exports = router;
