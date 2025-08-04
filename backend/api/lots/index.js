const verifyAdmin = require('../auth/verify-admin');
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
// WebSocket notifications
let wsNotify = null;
try {
  wsNotify = require('../../ws-server').sendNotification;
} catch (e) {
  console.log('⚠️  WebSocket server not available for lot notifications');
}
const { v4: uuidv4 } = require('uuid');
const authenticateToken = require('../../middleware/auth');

// Email notifications (with error handling)
let sendMail = null;
try {
  const mailerModule = require('../../utils/mailer');
  sendMail = mailerModule.sendMail;
  console.log('✅ Email service loaded for lot notifications');
} catch (e) {
  console.log('⚠️  Email service not available:', e.message);
  // Create a mock sendMail function that doesn't throw errors
  sendMail = async (options) => {
    console.log(`📧 Mock email to ${options.to}: ${options.subject}`);
    return Promise.resolve();
  };
}

const router = express.Router();

// ✅ POST: End auction with per-lot stagger and sniper protection (admin only)
router.post('/:auctionId/end', verifyAdmin, async (req, res) => {
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
    // Check for sniper protection: if last bid within 4min of end, extend by 4min
    let endTime = new Date(lot.endTime).getTime();
    let lastBidTime = lot.bidHistory && lot.bidHistory.length > 0 ? new Date(lot.bidHistory[lot.bidHistory.length - 1].time).getTime() : null;
    if (lastBidTime && lastBidTime >= endTime - 4 * 60 * 1000) {
      // Extend end time by 4min
      endTime = lastBidTime + 4 * 60 * 1000;
      lot.endTime = new Date(endTime).toISOString();
  // Notify all buyers: Auction is live now!
  if (wsNotify) wsNotify(null, { message: `Auction "${auction.title}" is live now!` });
  // Schedule 15 min warning
  setTimeout(() => {
    if (wsNotify) wsNotify(null, { message: `Auction "${auction.title}" ends in 15 mins!` });
  }, Math.max(0, (new Date(auction.endTime).getTime() - 15 * 60 * 1000) - Date.now()));
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
      } catch (e) { 
        console.log('Email notification failed:', e.message);
        notifications.push(`Failed to notify winner: ${winningBid.bidderEmail} (${e.message})`); 
      }
      if (lot.sellerEmail) {
        try {
          await sendMail({
            to: lot.sellerEmail,
            subject: 'Your lot has been sold!',
            text: `Your lot ${lot.title} in auction ${auctionId} has been sold for R${winningBid.amount}. An invoice will be generated for you.`,
            html: `<p>Your lot <b>${lot.title}</b> in auction <b>${auctionId}</b> has been <b>sold</b> for <b>R${winningBid.amount}</b>.<br>An invoice will be generated for you.</p>`
          });
          notifications.push(`Seller notified: ${lot.sellerEmail}`);
        } catch (e) { 
          console.log('Email notification failed:', e.message);
          notifications.push(`Failed to notify seller: ${lot.sellerEmail} (${e.message})`); 
        }
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
    // After all lots ended, auto-generate and email invoices
    try {
      const fetch = require('node-fetch');
      const apiUrl = process.env.API_INTERNAL_URL || `http://localhost:3001/api/invoices/email-invoices/${auctionId}`;
      await fetch(apiUrl, { method: 'POST' });
    } catch (e) {
      console.error('Failed to auto-email invoices:', e);
    }
  })();

  res.json({ message: 'Auction lots scheduled to end with stagger and sniper protection. Invoices will be emailed automatically after auction ends.', lotEndTimes });
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

  let lots = auction.lots || [];
  
  // Add staggered end times if they don't exist
  const now = new Date();
  let hasChanges = false;
  
  lots = lots.map((lot, index) => {
    if (!lot.endTime) {
      // Create staggered end times: first lot ends in 5 minutes, each subsequent lot 1 minute later
      const endTime = new Date(now.getTime() + (5 + index) * 60 * 1000);
      lot.endTime = endTime.toISOString();
      hasChanges = true;
      console.log(`📅 Auto-assigned end time for lot ${index + 1}: ${endTime.toLocaleString()}`);
    }
    
    // Ensure lot has a lotNumber
    if (!lot.lotNumber) {
      lot.lotNumber = index + 1;
      hasChanges = true;
    }
    
    return lot;
  });
  
  // Save changes if any were made
  if (hasChanges) {
    auction.lots = lots;
    writeAuctions(auctions);
  }

  res.json({ lots });
});

// ✅ POST: Add a new lot to an auction
router.post('/:auctionId', upload.single('image'), (req, res) => {
  const { auctionId } = req.params;
  const { title, description, startPrice, bidIncrement, endTime, sellerEmail, condition } = req.body;
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
  
  // Create staggered end time if not provided
  let lotEndTime = endTime;
  if (!lotEndTime) {
    const now = new Date();
    // Each lot ends 1 minute after the previous lot
    // First lot (lotNumber 1) ends in 5 minutes from now
    // Second lot (lotNumber 2) ends in 6 minutes from now, etc.
    const minutesToAdd = 5 + maxLotNumber; // maxLotNumber is current count, so new lot will be maxLotNumber + 1
    lotEndTime = new Date(now.getTime() + minutesToAdd * 60 * 1000).toISOString();
    console.log(`📅 Auto-scheduled lot ${maxLotNumber + 1} to end at: ${new Date(lotEndTime).toLocaleString()}`);
  }
  
  const newLot = {
    id: uuidv4(),
    title,
    description,
    startPrice: parseFloat(startPrice),
    image,
    currentBid: parseFloat(startPrice),
    bidIncrement: parseFloat(bidIncrement) || 10,
    bidHistory: [],
    endTime: lotEndTime,
    createdAt: new Date().toISOString(),
    sellerEmail: sellerEmail || null,
    lotNumber: maxLotNumber + 1,
    condition: condition || 'Good'
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
    ...req.body,
    condition: req.body.condition || auction.lots[lotIndex].condition || 'Good'
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
router.put('/:auctionId/:lotId/autobid', authenticateToken, async (req, res) => {
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

  // ✅ NEW: Check FICA or Deposit authorization before allowing auto-bids
  if (auction.depositRequired) {
    // Check deposit status
    try {
      const depositResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/deposits/${auctionId}/${bidderEmail}`);
      if (depositResponse.ok) {
        const depositData = await depositResponse.json();
        if (depositData.status !== 'approved') {
          return res.status(403).json({ error: 'Deposit approval required to set auto-bid' });
        }
      } else {
        return res.status(403).json({ error: 'Deposit approval required to set auto-bid' });
      }
    } catch (error) {
      return res.status(403).json({ error: 'Unable to verify deposit status' });
    }
  } else {
    // Check FICA status
    try {
      const ficaResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/fica/${bidderEmail}`);
      if (ficaResponse.ok) {
        const ficaData = await ficaResponse.json();
        if (ficaData.status !== 'approved') {
          return res.status(403).json({ error: 'FICA approval required to set auto-bid' });
        }
      } else {
        return res.status(403).json({ error: 'FICA approval required to set auto-bid' });
      }
    } catch (error) {
      return res.status(403).json({ error: 'Unable to verify FICA status' });
    }
  }

  lot.autoBids = lot.autoBids || [];
  // Remove any previous autobid for this user
  lot.autoBids = lot.autoBids.filter(b => b.bidderEmail !== bidderEmail);
  lot.autoBids.push({ bidderEmail, maxBid });
  writeAuctions(auctions);
  res.json({ message: 'Auto-bid set', maxBid });
});

// ✅ NEW: Get auto-bid status for a user on a lot (protected)
router.get('/:auctionId/:lotId/autobid/:userEmail', authenticateToken, (req, res) => {
  const { auctionId, lotId, userEmail } = req.params;
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  const lot = auction.lots.find(l => l.id === lotId);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });
  
  const autoBid = lot.autoBids?.find(b => b.bidderEmail === userEmail);
  res.json({ maxBid: autoBid?.maxBid || null });
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

  // ✅ NEW: Check FICA or Deposit authorization before allowing bids
  if (auction.depositRequired) {
    // Check deposit status
    try {
      const depositResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/deposits/${auctionId}/${bidderEmail}`);
      if (depositResponse.ok) {
        const depositData = await depositResponse.json();
        if (depositData.status !== 'approved') {
          return res.status(403).json({ error: 'Deposit approval required to bid' });
        }
      } else {
        return res.status(403).json({ error: 'Deposit approval required to bid' });
      }
    } catch (error) {
      return res.status(403).json({ error: 'Unable to verify deposit status' });
    }
  } else {
    // Check FICA status
    try {
      const ficaResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/fica/${bidderEmail}`);
      if (ficaResponse.ok) {
        const ficaData = await ficaResponse.json();
        if (ficaData.status !== 'approved') {
          return res.status(403).json({ error: 'FICA approval required to bid' });
        }
      } else {
        return res.status(403).json({ error: 'FICA approval required to bid' });
      }
    } catch (error) {
      return res.status(403).json({ error: 'Unable to verify FICA status' });
    }
  }

  // Check if user is trying to bid against themselves
  let previousBidder = lot.bidHistory && lot.bidHistory.length > 0 ? lot.bidHistory[lot.bidHistory.length - 1].bidderEmail : null;
  if (previousBidder === bidderEmail) {
    return res.status(400).json({ error: 'You are already the highest bidder' });
  }

  const increment = lot.bidIncrement || 10;
  let newBid = lot.currentBid + increment;
  let lastBidder = bidderEmail || 'unknown';

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
    } catch (e) { 
      console.error('Failed to send outbid email:', e.message); 
    }
  }

  // Process auto-bids
  lot.autoBids = lot.autoBids || [];
  let autobidTriggered = true;
  while (autobidTriggered) {
    autobidTriggered = false;
    // Find all auto-bidders who can outbid current and are not the current highest bidder
    const eligible = lot.autoBids.filter(b => 
      b.maxBid >= lot.currentBid + increment && 
      b.bidderEmail !== lastBidder
    );
    
    if (eligible.length > 0) {
      // Sort by max bid (highest first), then by when auto-bid was set
      eligible.sort((a, b) => b.maxBid - a.maxBid);
      const winner = eligible[0];
      
      // Calculate new bid - only increment by the minimum needed
      newBid = Math.min(winner.maxBid, lot.currentBid + increment);
      
      // Only proceed if the auto-bidder's max is high enough
      if (newBid <= winner.maxBid) {
        // Notify previous bidder if outbid
        if (lastBidder && lastBidder !== winner.bidderEmail) {
          if (wsNotify) wsNotify(lastBidder, { message: `You've been outbid on lot ${lot.title}!` });
          try {
            await sendMail({
              to: lastBidder,
              subject: 'You have been outbid',
              text: `You have been outbid on lot ${lot.title} in auction ${auctionId}. Place a new bid to stay in the lead!`,
              html: `<p>You have been <b>outbid</b> on lot <b>${lot.title}</b> in auction <b>${auctionId}</b>.<br>Place a new bid to stay in the lead!</p>`
            });
          } catch (e) { 
            console.error('Failed to send outbid email:', e.message); 
          }
        }
        
        lot.currentBid = newBid;
        lot.bidHistory.push({
          bidderEmail: winner.bidderEmail,
          amount: newBid,
          time: new Date().toISOString(),
          isAutoBid: true
        });
        
        lastBidder = winner.bidderEmail;
        
        // If we reached the auto-bidder's max, remove their auto-bid
        if (newBid >= winner.maxBid) {
          lot.autoBids = lot.autoBids.filter(b => b.bidderEmail !== winner.bidderEmail);
        }
        
        // Continue if there are more eligible auto-bidders
        const stillEligible = lot.autoBids.filter(b => 
          b.maxBid >= lot.currentBid + increment && 
          b.bidderEmail !== lastBidder
        );
        autobidTriggered = stillEligible.length > 0;
      }
    }
  }

  writeAuctions(auctions);
  res.json({ message: 'Bid placed successfully', currentBid: lot.currentBid });
});

// ✅ NEW: Place a direct bid amount (for quick bidding) (protected)
router.put('/:auctionId/:lotId/quickbid', authenticateToken, async (req, res) => {
  const { auctionId, lotId } = req.params;
  const { bidderEmail, bidAmount } = req.body;

  if (!bidAmount || typeof bidAmount !== 'number') {
    return res.status(400).json({ error: 'bidAmount is required and must be a number' });
  }

  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  const lot = auction.lots.find(l => l.id === lotId);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });

  // ✅ FICA/Deposit validation
  if (auction.depositRequired) {
    try {
      const depositResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/deposits/${auctionId}/${bidderEmail}`);
      if (depositResponse.ok) {
        const depositData = await depositResponse.json();
        if (depositData.status !== 'approved') {
          return res.status(403).json({ error: 'Deposit approval required to bid' });
        }
      } else {
        return res.status(403).json({ error: 'Deposit approval required to bid' });
      }
    } catch (error) {
      return res.status(403).json({ error: 'Unable to verify deposit status' });
    }
  } else {
    try {
      const ficaResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/fica/${bidderEmail}`);
      if (ficaResponse.ok) {
        const ficaData = await ficaResponse.json();
        if (ficaData.status !== 'approved') {
          return res.status(403).json({ error: 'FICA approval required to bid' });
        }
      } else {
        return res.status(403).json({ error: 'FICA approval required to bid' });
      }
    } catch (error) {
      return res.status(403).json({ error: 'Unable to verify FICA status' });
    }
  }

  // Validate bid amount
  const increment = lot.bidIncrement || 10;
  if (bidAmount <= lot.currentBid) {
    return res.status(400).json({ error: `Bid must be higher than current bid of R${lot.currentBid}` });
  }

  // Check if user is already highest bidder
  let previousBidder = lot.bidHistory && lot.bidHistory.length > 0 ? lot.bidHistory[lot.bidHistory.length - 1].bidderEmail : null;
  if (previousBidder === bidderEmail) {
    return res.status(400).json({ error: 'You are already the highest bidder' });
  }

  // Set the bid directly to the specified amount
  lot.currentBid = bidAmount;
  lot.bidHistory = lot.bidHistory || [];
  lot.bidHistory.push({
    bidderEmail,
    amount: bidAmount,
    time: new Date().toISOString()
  });

  // Process auto-bids after the direct bid
  lot.autoBids = lot.autoBids || [];
  let autobidTriggered = true;
  while (autobidTriggered) {
    autobidTriggered = false;
    const eligible = lot.autoBids.filter(b => 
      b.maxBid > lot.currentBid && b.bidderEmail !== bidderEmail
    );

    if (eligible.length > 0) {
      const nextBidder = eligible.sort((a, b) => b.maxBid - a.maxBid)[0];
      const nextBid = Math.min(nextBidder.maxBid, lot.currentBid + increment);
      
      if (nextBid > lot.currentBid) {
        lot.currentBid = nextBid;
        lot.bidHistory.push({
          bidderEmail: nextBidder.bidderEmail,
          amount: nextBid,
          time: new Date().toISOString()
        });
        
        bidderEmail = nextBidder.bidderEmail;
        const stillEligible = lot.autoBids.filter(b => 
          b.maxBid > lot.currentBid && b.bidderEmail !== bidderEmail
        );
        autobidTriggered = stillEligible.length > 0;
      }
    }
  }

  writeAuctions(auctions);
  res.json({ message: 'Quick bid placed successfully', currentBid: lot.currentBid });
});

module.exports = router;

