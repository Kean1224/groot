// Clear require cache first
const depositsPath = require.resolve('./api/deposits/index.js');
delete require.cache[depositsPath];

const express = require('express');

console.log('Analyzing deposits router export...');
const depositsRouter = require('./api/deposits/index.js');

console.log('Type:', typeof depositsRouter);
console.log('Constructor:', depositsRouter.constructor.name);
console.log('Keys:', Object.keys(depositsRouter));
console.log('Is Express Router?', typeof depositsRouter.use === 'function');

if (typeof depositsRouter.use === 'function') {
  console.log('✓ Has use method');
} else {
  console.log('✗ Missing use method');
}

// Test creating a new router for comparison
const testRouter = express.Router();
console.log('Test router type:', typeof testRouter);
console.log('Test router constructor:', testRouter.constructor.name);
