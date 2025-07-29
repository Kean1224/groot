// Start WebSocket server for notifications
try {
  const { server: wsServer } = require('./ws-server');
  wsServer.listen(5050, () => {
    console.log('WebSocket server running on port 5050');
  });
} catch (e) {
  console.error('WebSocket server failed to start:', e);
}
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const depositsRouter = require('./api/deposits/index');
const PORT = 5000;
app.use('/api/deposits', depositsRouter);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Contact form/inbox
app.use('/api/contact', contactRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
