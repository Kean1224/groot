const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Health check endpoint for frontend-backend communication
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://your-frontend-app.onrender.com', // Update this with your actual Render frontend URL
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import API routes
const auctionsRouter = require('./api/auctions/index');
const authRouter = require('./api/auth/index');
const contactRouter = require('./api/contact');
const depositsRouter = require('./api/deposits/index');
const ficaRouter = require('./api/fica');
const invoiceRouter = require('./api/invoices/index');
const lotsRouter = require('./api/lots/index');
const pendingItemsRouter = require('./api/pending-items');
const pendingUsersRouter = require('./api/pending-users');
const refundsRouter = require('./api/refunds/index');
const sellItemRouter = require('./api/sell-item/index');
const usersRouter = require('./api/users/index');

// Connect routes
app.use('/api/auctions', auctionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/deposits', depositsRouter);
app.use('/api/fica', ficaRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/lots', lotsRouter);
app.use('/api/pending-items', pendingItemsRouter);
app.use('/api/pending-users', pendingUsersRouter);
app.use('/api/refunds', refundsRouter);
app.use('/api/sell-item', sellItemRouter);
app.use('/api/users', usersRouter);

// Default route
app.get('/', (req, res) => {
  res.send('All4You Backend API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
