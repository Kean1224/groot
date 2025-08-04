const verifyAdmin = require('../auth/verify-admin');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Helper: read lots from all auctions
function readLotsForAuction(auction) {
  return (auction.lots || []).map(lot => ({ ...lot }));
}

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

// Helper: Check if auction is completed (all lots have ended)
function isAuctionCompleted(auction) {
  if (!auction.lots || auction.lots.length === 0) {
    return false; // No lots means auction is not completed
  }
  return auction.lots.every(lot => lot.status === 'ended');
}

// GET all active auctions (excludes completed ones)
router.get('/', (req, res) => {
  const auctions = readAuctions();
  const activeAuctions = auctions.filter(auction => !isAuctionCompleted(auction));
  res.json(activeAuctions);
});

// GET all past/completed auctions
router.get('/past', (req, res) => {
  const auctions = readAuctions();
  const completedAuctions = auctions.filter(auction => isAuctionCompleted(auction));
  res.json(completedAuctions);
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

// GET /:id/lots - Get all lots for a specific auction
router.get('/:id/lots', (req, res) => {
  const { id } = req.params;
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === id);
  
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  
  const lots = readLotsForAuction(auction);
  res.json({ lots });
});

// GET /:id/is-registered?email=... - Check if user is registered for auction
router.get('/:id/is-registered', (req, res) => {
  const { id } = req.params;
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === id);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  const registered = Array.isArray(auction.registeredUsers) && auction.registeredUsers.includes(email);
  res.json({ registered });
});

// GET /registrations - Get all auction registrations with verification status (admin only)
router.get('/registrations', verifyAdmin, async (req, res) => {
  try {
    const auctions = readAuctions();
    const allRegistrations = [];

    for (const auction of auctions) {
      if (auction.registeredUsers && auction.registeredUsers.length > 0) {
        for (const email of auction.registeredUsers) {
          // Check if user has full account
          const usersPath = path.join(__dirname, '../../data/users.json');
          let hasFullAccount = false;
          if (fs.existsSync(usersPath)) {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
            hasFullAccount = users.some(user => user.email === email);
          }

          // Check FICA status
          let ficaStatus = 'not_uploaded';
          try {
            const ficaResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/fica/${email}`);
            if (ficaResponse.ok) {
              const ficaData = await ficaResponse.json();
              ficaStatus = ficaData.status || 'not_uploaded';
            }
          } catch (error) {
            console.error(`FICA check failed for ${email}:`, error.message);
          }

          // Check deposit status for this auction
          let depositStatus = 'not_paid';
          if (auction.depositRequired) {
            try {
              const depositResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/deposits/${auction.id}/${email}`);
              if (depositResponse.ok) {
                const depositData = await depositResponse.json();
                depositStatus = depositData.status || 'not_paid';
              }
            } catch (error) {
              console.error(`Deposit check failed for ${email}:`, error.message);
            }
          }

          allRegistrations.push({
            email,
            auctionId: auction.id,
            auctionTitle: auction.title,
            registeredAt: new Date().toISOString(), // We don't track registration time yet
            hasFullAccount,
            ficaStatus,
            depositStatus: auction.depositRequired ? depositStatus : 'not_required',
            depositRequired: auction.depositRequired || false,
            depositAmount: auction.depositAmount || 0,
            canParticipate: auction.depositRequired ? depositStatus === 'approved' : ficaStatus === 'approved'
          });
        }
      }
    }

    res.json(allRegistrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// POST /:id/register - Register a user for an auction with FICA/deposit verification
router.post('/:id/register', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === id);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  // ✅ NEW: Check FICA or Deposit authorization before allowing registration
  if (auction.depositRequired) {
    // Check deposit status
    try {
      const depositResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/deposits/${id}/${email}`);
      if (depositResponse.ok) {
        const depositData = await depositResponse.json();
        if (depositData.status !== 'approved') {
          return res.status(403).json({ 
            error: 'Deposit approval required to register for this auction',
            required: 'deposit',
            depositAmount: auction.depositAmount 
          });
        }
      } else {
        return res.status(403).json({ 
          error: 'Deposit approval required to register for this auction',
          required: 'deposit',
          depositAmount: auction.depositAmount 
        });
      }
    } catch (error) {
      console.error('Deposit verification error:', error);
      return res.status(403).json({ error: 'Unable to verify deposit status' });
    }
  } else {
    // Check FICA status
    try {
      const ficaResponse = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/fica/${email}`);
      if (ficaResponse.ok) {
        const ficaData = await ficaResponse.json();
        if (ficaData.status !== 'approved') {
          return res.status(403).json({ 
            error: 'FICA approval required to register for this auction',
            required: 'fica',
            currentStatus: ficaData.status || 'not_uploaded'
          });
        }
      } else {
        return res.status(403).json({ 
          error: 'FICA approval required to register for this auction',
          required: 'fica',
          currentStatus: 'not_uploaded'
        });
      }
    } catch (error) {
      console.error('FICA verification error:', error);
      return res.status(403).json({ error: 'Unable to verify FICA status' });
    }
  }

  // Only register if verification passed
  if (!auction.registeredUsers) auction.registeredUsers = [];
  if (!auction.registeredUsers.includes(email)) {
    auction.registeredUsers.push(email);
    writeAuctions(auctions);
  }
  res.json({ success: true, message: 'Registration successful - verification passed' });
});

// POST /:id/rerun - Duplicate auction and its lots with new start/end dates (admin only)
router.post('/:id/rerun', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { startTime, endTime } = req.body;
  if (!startTime || !endTime) {
    return res.status(400).json({ error: 'New startTime and endTime required.' });
  }
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === id);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  // Duplicate auction (new id, new dates, reset lots)
  const newAuction = {
    ...auction,
    id: uuidv4(),
    startTime,
    endTime,
    createdAt: new Date().toISOString(),
    lots: [],
  };
  // Duplicate lots (new ids, reset bids/history)
  const origLots = readLotsForAuction(auction);
  newAuction.lots = origLots.map(lot => ({
    ...lot,
    id: uuidv4(),
    bidHistory: [],
    currentBid: lot.startPrice,
    autoBids: [],
    status: undefined,
    endTime: undefined,
    // keep lotNumber, title, description, startPrice, image, sellerEmail, condition
  }));
  auctions.push(newAuction);
  writeAuctions(auctions);
  res.status(201).json(newAuction);
});

module.exports = router;
