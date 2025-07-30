const express = require('express');
const cors = require('./cors-config'); // Use dedicated CORS config
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const depositsRouter = require('./api/deposits/index');
const PORT = process.env.PORT || 5000;

// CRITICAL: Apply CORS middleware FIRST (before any routes)
app.use(cors);
app.use(bodyParser.json());

// Health check endpoint for frontend-backend communication
app.get('/api/ping', (req, res) => {
  console.log('Ping request from:', req.get('origin'));
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    version: '1.4-cors-fixed-forced' // CORS middleware moved before this endpoint
  });
});

// Health check for Render.com
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start WebSocket server for notifications
try {
  const { server: wsServer } = require('./ws-server');
  const wsPort = process.env.WS_PORT || 5050;
  wsServer.listen(wsPort, () => {
    console.log(`WebSocket server running on port ${wsPort}`);
  });
} catch (e) {
  console.error('WebSocket server failed to start:', e);
}

// Middleware - Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add CORS test endpoint
const corsTestRouter = require('./cors-test-endpoint');
app.use('/api', corsTestRouter);

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
const invoiceRouter = require('./api/invoices/index');
app.use('/api/invoices', invoiceRouter);

const lotsRouter = require('./api/lots/index');
app.use('/api/lots', lotsRouter);
const sellItemRouter = require('./api/sell-item/index');
app.use('/api/sell-item', sellItemRouter);
const usersRouter = require('./api/users/index');
app.use('/api/users', usersRouter);

// Refunds API
const refundsRouter = require('./api/refunds/index');
app.use('/api/refunds', refundsRouter);

app.listen(PORT, () => {
  console.log(`All4You Backend API is running on port ${PORT}`);
});
