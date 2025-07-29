const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test each router one by one
try {
  console.log('Testing auctions router...');
  const auctionsRouter = require('./api/auctions/index');
  app.use('/api/auctions', auctionsRouter);
  console.log('✓ Auctions router OK');
} catch (e) {
  console.log('✗ Auctions router failed:', e.message);
}

try {
  console.log('Testing auth router...');
  const authRouter = require('./api/auth/index');
  app.use('/api/auth', authRouter);
  console.log('✓ Auth router OK');
} catch (e) {
  console.log('✗ Auth router failed:', e.message);
}

try {
  console.log('Testing contact router...');
  const contactRouter = require('./api/contact');
  app.use('/api/contact', contactRouter);
  console.log('✓ Contact router OK');
} catch (e) {
  console.log('✗ Contact router failed:', e.message);
}

try {
  console.log('Testing deposits router...');
  const depositsRouter = require('./api/deposits/index');
  app.use('/api/deposits', depositsRouter);
  console.log('✓ Deposits router OK');
} catch (e) {
  console.log('✗ Deposits router failed:', e.message);
}

app.get('/', (req, res) => {
  res.send('All4You Backend API Test is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running at http://localhost:${PORT}`);
});
