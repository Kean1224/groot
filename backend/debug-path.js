const express = require('express');
const path = require('path');

console.log('Current directory:', __dirname);
console.log('Looking for deposits router at:', path.join(__dirname, 'api/deposits/index.js'));

// Try different ways of requiring
try {
  const depositsRouter1 = require('./api/deposits');
  console.log('Method 1 (directory):', typeof depositsRouter1);
} catch (e) {
  console.log('Method 1 failed:', e.message);
}

try {
  const depositsRouter2 = require('./api/deposits/index.js');
  console.log('Method 2 (full path):', typeof depositsRouter2);
} catch (e) {
  console.log('Method 2 failed:', e.message);
}

try {
  const fullPath = path.join(__dirname, 'api/deposits/index.js');
  const depositsRouter3 = require(fullPath);
  console.log('Method 3 (absolute):', typeof depositsRouter3);
} catch (e) {
  console.log('Method 3 failed:', e.message);
}
