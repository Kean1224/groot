
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const offersPath = path.join(__dirname, '../../data/item_offers.json');


// Load & Save
function readOffers() {
  if (!fs.existsSync(offersPath)) return [];
  return JSON.parse(fs.readFileSync(offersPath, 'utf-8'));
}

function writeOffers(data) {
  fs.writeFileSync(offersPath, JSON.stringify(data, null, 2), 'utf-8');
}


// ✅ POST: User submits item offer
router.post('/', (req, res) => {
  const { name, email, phone, itemTitle, itemDescription } = req.body;

  if (!name || !email || !itemTitle || !itemDescription) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const offers = readOffers();

  const newOffer = {
    id: uuidv4(),
    name,
    email,
    phone,
    itemTitle,
    itemDescription,
    submittedAt: new Date().toISOString(),
    responded: false,
    adminResponse: ''
  };

  offers.push(newOffer);
  writeOffers(offers);

  res.status(201).json({ message: 'Item submitted successfully', offer: newOffer });
});

// ✅ GET: Admin views all item offers
router.get('/', (req, res) => {
  const offers = readOffers();
  res.json(offers);
});

// ✅ PUT: Admin responds to offer
router.put('/:id', (req, res) => {
  const offers = readOffers();
  const offer = offers.find(o => o.id === req.params.id);

  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  offer.adminResponse = req.body.response || '';
  offer.responded = true;
  writeOffers(offers);

  res.json({ message: 'Offer updated', offer });
});

module.exports = router;
