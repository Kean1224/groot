const depositsRouter = require('./api/deposits/index');
app.use('/api/deposits', depositsRouter);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔌 Import API routes
const auctionsRouter = require('./api/auctions/index');
const authRouter = require('./api/auth/index'); // <-- ADDED

// 🔗 Connect routes
app.use('/api/auctions', auctionsRouter);
app.use('/api/auth', authRouter); // <-- ADDED

// Example route
app.get('/', (req, res) => {
  res.send('All4You Backend API is running...');
});


const invoiceRouter = require('./api/invoices/index');
app.use('/api/invoices', invoiceRouter);
const lotsRouter = require('./api/lots/index');
app.use('/api/lots', lotsRouter);
const sellItemRouter = require('./api/sell-item/index');
app.use('/api/sell-item', sellItemRouter);
const usersRouter = require('./api/users/index');
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
