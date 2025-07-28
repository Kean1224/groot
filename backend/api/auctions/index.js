const verifyAdmin = require('../auth/verify-admin');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../../data/auctions.json');

// Helper: read auctions
function readAuctions() {
  if (!fs.existsSync(dataPath)) return [];
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

// Helper: write auctions
function writeAuctions(auctions) {
  fs.writeFileSync(dataPath, JSON.stringify(auctions, null, 2), 'utf-8');
}

// GET all auctions
router.get('/', (req, res) => {
  const auctions = readAuctions();
  res.json(auctions);
});

// POST new auction (admin only)
router.post('/', verifyAdmin, (req, res) => {
  const { title, description, location, startTime, endTime, increment, depositRequired, depositAmount } = req.body;

  if (!title || !startTime || !endTime || !increment) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const auctions = readAuctions();

  const newAuction = {
    id: uuidv4(),
    title,
    description: description || '',
    location: location || '',
    startTime,
    endTime,
    increment: parseInt(increment),
    depositRequired: !!depositRequired,
    depositAmount: depositRequired ? Number(depositAmount) : 0,
    lots: [],
    createdAt: new Date().toISOString(),
  };

  auctions.push(newAuction);
  writeAuctions(auctions);

  res.status(201).json(newAuction);
});

// PUT update an auction (admin only)
router.put('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const auctions = readAuctions();
  const index = auctions.findIndex(a => a.id === id);

  if (index === -1) return res.status(404).json({ error: 'Auction not found' });

  // Only allow updating deposit fields if provided
  const update = { ...req.body };
  if (typeof update.depositRequired !== 'undefined') {
    update.depositRequired = !!update.depositRequired;
    update.depositAmount = update.depositRequired ? Number(update.depositAmount) : 0;
  }

  auctions[index] = { ...auctions[index], ...update };
  writeAuctions(auctions);

  res.json(auctions[index]);
});

// DELETE auction (admin only)
router.delete('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  let auctions = readAuctions();
  const auction = auctions.find(a => a.id === id);

  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  auctions = auctions.filter(a => a.id !== id);
  writeAuctions(auctions);

  res.json({ message: 'Auction deleted successfully' });
});

module.exports = router;
