console.log('Analyzing deposits router export...');

const depositsRouter = require('./api/deposits/index');
console.log('Type:', typeof depositsRouter);
console.log('Constructor:', depositsRouter.constructor.name);
console.log('Keys:', Object.keys(depositsRouter));
console.log('Is Express Router?', depositsRouter.constructor.name === 'router');

if (depositsRouter.use && typeof depositsRouter.use === 'function') {
  console.log('✓ Has use method');
} else {
  console.log('✗ Missing use method');
}

// Check if it's an actual express router
const express = require('express');
const testRouter = express.Router();
console.log('Test router type:', typeof testRouter);
console.log('Test router constructor:', testRouter.constructor.name);
