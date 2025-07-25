const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const authenticateToken = require('../../middleware/auth');
const { sendMail } = require('../../utils/mailer');
const router = express.Router();

// ✅ POST: End auction with per-lot stagger and sniper protection
router.post('/:auctionId/end', async (req, res) => {
  const { auctionId } = req.params;
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  // Set up per-lot end times: first lot ends now, next ends 10s later, etc.
  const now = Date.now();
  let notifications = [];
  let lotEndTimes = [];
  let lots = auction.lots || [];
  lots.forEach((lot, idx) => {
    // If lot already ended, skip
    if (lot.status === 'ended') return;
    // Set or update endTime for each lot
    lot.endTime = new Date(now + idx * 10000).toISOString();
    lot.status = 'scheduled';
    lotEndTimes.push({ lotId: lot.id, endTime: lot.endTime });
  });
  writeAuctions(auctions);

  // Function to end a lot, with sniper protection
  async function endLotWithSniperProtection(lot, auctionId) {
    // Check if lot already ended
    if (lot.status === 'ended') return;
    // Check for sniper protection: if last bid within 2min of end, extend by 2min
    let endTime = new Date(lot.endTime).getTime();
    let lastBidTime = lot.bidHistory && lot.bidHistory.length > 0 ? new Date(lot.bidHistory[lot.bidHistory.length - 1].time).getTime() : null;
    if (lastBidTime && lastBidTime >= endTime - 2 * 60 * 1000) {
      // Extend end time by 2min
      endTime = lastBidTime + 2 * 60 * 1000;
      lot.endTime = new Date(endTime).toISOString();
      writeAuctions(auctions);
      // Wait until new end time
      const waitMs = Math.max(0, endTime - Date.now());
      await new Promise(r => setTimeout(r, waitMs));
    }
    // End the lot
    lot.status = 'ended';
    writeAuctions(auctions);
    // Notify winner/seller if there was a winner
    if (lot.bidHistory && lot.bidHistory.length > 0) {
      const winningBid = lot.bidHistory[lot.bidHistory.length - 1];
      try {
        await sendMail({
          to: winningBid.bidderEmail,
          subject: 'Congratulations! You won an auction lot',
          text: `You have won lot ${lot.title} in auction ${auctionId} for R${winningBid.amount}. An invoice will be generated for you.`,
          html: `<p>Congratulations! You have <b>won</b> lot <b>${lot.title}</b> in auction <b>${auctionId}</b> for <b>R${winningBid.amount}</b>.<br>An invoice will be generated for you.</p>`
        });
        notifications.push(`Winner notified: ${winningBid.bidderEmail}`);
      } catch (e) { notifications.push(`Failed to notify winner: ${winningBid.bidderEmail}`); }
      if (lot.sellerEmail) {
        try {
          await sendMail({
            to: lot.sellerEmail,
            subject: 'Your lot has been sold!',
            text: `Your lot ${lot.title} in auction ${auctionId} has been sold for R${winningBid.amount}. An invoice will be generated for you.`,
            html: `<p>Your lot <b>${lot.title}</b> in auction <b>${auctionId}</b> has been <b>sold</b> for <b>R${winningBid.amount}</b>.<br>An invoice will be generated for you.</p>`
          });
          notifications.push(`Seller notified: ${lot.sellerEmail}`);
        } catch (e) { notifications.push(`Failed to notify seller: ${lot.sellerEmail}`); }
      }
    }
  }

  // Sequentially end each lot with 10s stagger
  (async () => {
    for (let i = 0; i < lots.length; i++) {
      const lot = lots[i];
      if (lot.status === 'ended') continue;
      const waitMs = Math.max(0, new Date(lot.endTime).getTime() - Date.now());
      await new Promise(r => setTimeout(r, waitMs));
      await endLotWithSniperProtection(lot, auctionId);
    }
  })();

  res.json({ message: 'Auction lots scheduled to end with stagger and sniper protection.', lotEndTimes });
});
const auctionsPath = path.join(__dirname, '../../data/auctions.json');

// Helper: Load & Save Auctions
function readAuctions() {
  if (!fs.existsSync(auctionsPath)) return [];
  return JSON.parse(fs.readFileSync(auctionsPath, 'utf-8'));
}
function writeAuctions(data) {
  fs.writeFileSync(auctionsPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/lots/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// ✅ GET lots for auction
router.get('/:auctionId', (req, res) => {
  const { auctionId } = req.params;
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);

  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  res.json(auction.lots || []);
});

// ✅ POST: Add a new lot to an auction
router.post('/:auctionId', upload.single('image'), (req, res) => {
  const { auctionId } = req.params;
  const { title, description, startPrice, bidIncrement, endTime, sellerEmail } = req.body;
  const image = req.file ? `/uploads/lots/${req.file.filename}` : '';

  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  auction.lots = auction.lots || [];
  // Find the highest lotNumber in this auction
  let maxLotNumber = 0;
  auction.lots.forEach(lot => {
    if (typeof lot.lotNumber === 'number' && lot.lotNumber > maxLotNumber) {
      maxLotNumber = lot.lotNumber;
    }
  });
  const newLot = {
    id: uuidv4(),
    title,
    description,
    startPrice: parseFloat(startPrice),
    image,
    currentBid: parseFloat(startPrice),
    bidIncrement: parseFloat(bidIncrement) || 10,
    bidHistory: [],
    endTime: endTime || null,
    createdAt: new Date().toISOString(),
    sellerEmail: sellerEmail || null,
    lotNumber: maxLotNumber + 1
  };
  auction.lots.push(newLot);
  writeAuctions(auctions);
  res.status(201).json(newLot);
});

// ✅ PUT: Update a lot
router.put('/:auctionId/:lotId', (req, res) => {
  const { auctionId, lotId } = req.params;
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  const lotIndex = auction.lots.findIndex(l => l.id === lotId);
  if (lotIndex === -1) return res.status(404).json({ error: 'Lot not found' });

  auction.lots[lotIndex] = {
    ...auction.lots[lotIndex],
    ...req.body
  };

  writeAuctions(auctions);
  res.json(auction.lots[lotIndex]);
});

// ✅ DELETE: Remove a lot
router.delete('/:auctionId/:lotId', (req, res) => {
  const { auctionId, lotId } = req.params;
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  auction.lots = auction.lots.filter(l => l.id !== lotId);
  writeAuctions(auctions);

  res.json({ message: 'Lot deleted successfully' });
});


// ✅ NEW: Set or update auto-bid for a user on a lot (protected)
router.put('/:auctionId/:lotId/autobid', authenticateToken, (req, res) => {
  const { auctionId, lotId } = req.params;
  const { bidderEmail, maxBid } = req.body;
  if (!bidderEmail || typeof maxBid !== 'number') {
    return res.status(400).json({ error: 'bidderEmail and maxBid required' });
  }
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  const lot = auction.lots.find(l => l.id === lotId);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });
  lot.autoBids = lot.autoBids || [];
  // Remove any previous autobid for this user
  lot.autoBids = lot.autoBids.filter(b => b.bidderEmail !== bidderEmail);
  lot.autoBids.push({ bidderEmail, maxBid });
  writeAuctions(auctions);
  res.json({ message: 'Auto-bid set', autoBids: lot.autoBids });
});

// ✅ Place a bid using increment, and process auto-bids (protected)
router.put('/:auctionId/:lotId/bid', authenticateToken, async (req, res) => {
  const { auctionId, lotId } = req.params;
  const { bidderEmail } = req.body;

  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  const lot = auction.lots.find(l => l.id === lotId);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });

  const increment = lot.bidIncrement || 10;
  let newBid = lot.currentBid + increment;
  let lastBidder = bidderEmail || 'unknown';
  let previousBidder = lot.bidHistory && lot.bidHistory.length > 0 ? lot.bidHistory[lot.bidHistory.length - 1].bidderEmail : null;

  lot.currentBid = newBid;
  lot.bidHistory = lot.bidHistory || [];
  lot.bidHistory.push({
    bidderEmail: lastBidder,
    amount: newBid,
    time: new Date().toISOString()
  });

  // Notify previous bidder if outbid
  if (previousBidder && previousBidder !== lastBidder) {
    try {
      await sendMail({
        to: previousBidder,
        subject: 'You have been outbid',
        text: `You have been outbid on lot ${lot.title} in auction ${auctionId}. Place a new bid to stay in the lead!`,
        html: `<p>You have been <b>outbid</b> on lot <b>${lot.title}</b> in auction <b>${auctionId}</b>.<br>Place a new bid to stay in the lead!</p>`
      });
    } catch (e) { console.error('Failed to send outbid email:', e); }
  }

  // Process auto-bids
  lot.autoBids = lot.autoBids || [];
  let autobidTriggered = true;
  while (autobidTriggered) {
    autobidTriggered = false;
    // Find all auto-bidders who can outbid current
    const eligible = lot.autoBids.filter(b => b.maxBid >= lot.currentBid + increment && b.bidderEmail !== lastBidder);
    if (eligible.length > 0) {
      // Highest maxBid wins
      eligible.sort((a, b) => b.maxBid - a.maxBid);
      const winner = eligible[0];
      newBid = lot.currentBid + increment;
      lot.currentBid = newBid;
      lot.bidHistory.push({
        bidderEmail: winner.bidderEmail,
        amount: newBid,
        time: new Date().toISOString()
      });
      // Notify previous bidder if outbid
      if (lastBidder && lastBidder !== winner.bidderEmail) {
        try {
          await sendMail({
            to: lastBidder,
            subject: 'You have been outbid',
            text: `You have been outbid on lot ${lot.title} in auction ${auctionId}. Place a new bid to stay in the lead!`,
            html: `<p>You have been <b>outbid</b> on lot <b>${lot.title}</b> in auction <b>${auctionId}</b>.<br>Place a new bid to stay in the lead!</p>`
          });
        } catch (e) { console.error('Failed to send outbid email:', e); }
      }
      lastBidder = winner.bidderEmail;
      autobidTriggered = true;
    }
  }

  writeAuctions(auctions);
  res.json({ message: 'Bid placed successfully', currentBid: lot.currentBid });
});

module.exports = router;

