require('dotenv').config();

const express = require('express');
const cors = require('./cors-config'); // Use dedicated CORS config
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const depositsRouter = require('./api/deposits/index');
const PORT = process.env.PORT || 5000;

// Apply CORS middleware FIRST (before any routes)
app.use(cors);
app.use(bodyParser.json());

// Health check endpoint for frontend-backend communication
app.get('/api/ping', (req, res) => {
  console.log('Ping request from:', req.get('origin'));
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    version: '1.3-cors-fixed' // CORS middleware moved before this endpoint
  });
});

// Health check for Render.com
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start WebSocket server for notifications
try {
  const { server: wsServer } = require('./ws-server');
  const wsPort = process.env.WS_PORT || 5051;
  wsServer.listen(wsPort, () => {
    console.log(`WebSocket server running on port ${wsPort}`);
  });
} catch (e) {
  console.error('WebSocket server failed to start:', e);
}

// Middleware - Static file serving with CORS headers
app.use('/uploads', (req, res, next) => {
  console.log(`Static file request: ${req.method} ${req.path}`);
  // Add CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Add a test endpoint to check if files exist
app.get('/test-upload/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'fica', req.params.filename);
  console.log(`Testing file: ${filePath}`);
  if (fs.existsSync(filePath)) {
    res.json({ exists: true, path: filePath, absolutePath: path.resolve(filePath) });
  } else {
    res.json({ exists: false, path: filePath, absolutePath: path.resolve(filePath) });
  }
});

app.use('/api/deposits', depositsRouter);

// 🔌 Import API routes
const auctionsRouter = require('./api/auctions/index');
const authRouter = require('./api/auth/index'); // <-- ADDED
const ficaRouter = require('./api/fica');
const pendingItemsRouter = require('./api/pending-items');
const pendingUsersRouter = require('./api/pending-users');

// 🔗 Connect routes
app.use('/api/auctions', auctionsRouter);
app.use('/api/auth', authRouter); // <-- ADDED
app.use('/api/fica', ficaRouter);
app.use('/api/pending-items', pendingItemsRouter);
app.use('/api/pending-users', pendingUsersRouter);

// Example route
app.get('/', (req, res) => {
  res.send('All4You Backend API is running...');
});


const contactRouter = require('./api/contact');
app.use('/api/contact', contactRouter);

const invoiceRouter = require('./api/invoices/index');
app.use('/api/invoices', invoiceRouter);

const lotsRouter = require('./api/lots/index');
app.use('/api/lots', lotsRouter);
const sellItemRouter = require('./api/sell-item/index');
app.use('/api/sell-item', sellItemRouter);
const usersRouter = require('./api/users/index');
app.use('/api/users', usersRouter);

// Auction Management API
const auctionManagementRouter = require('./api/auction-management/index');
app.use('/api/auction-management', auctionManagementRouter);

// Refunds API
const refundsRouter = require('./api/refunds/index');
app.use('/api/refunds', refundsRouter);

// Start the main Express server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
