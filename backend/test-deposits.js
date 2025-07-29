const express = require('express');

console.log('Testing deposits router isolation...');

try {
  const verifyAdmin = require('./api/auth/verify-admin');
  console.log('✓ verifyAdmin imported:', typeof verifyAdmin);
  
  const depositsRouter = require('./api/deposits/index');
  console.log('✓ depositsRouter imported:', typeof depositsRouter);
  
  const app = express();
  app.use('/api/deposits', depositsRouter);
  console.log('✓ Router successfully mounted');
  
} catch (error) {
  console.log('✗ Error:', error.message);
  console.log('Stack:', error.stack);
}
