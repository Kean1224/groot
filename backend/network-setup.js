require('dotenv').config();

console.log('🔧 Local Development Network Setup');
console.log('=' .repeat(50));

// Get your local IP address
const os = require('os');
const interfaces = os.networkInterfaces();
let localIP = 'localhost';

Object.keys(interfaces).forEach((ifname) => {
  interfaces[ifname].forEach((iface) => {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    localIP = iface.address;
  });
});

console.log('Your local IP address:', localIP);
console.log('Frontend should be accessible at:', `http://${localIP}:3000`);
console.log('Backend should be accessible at:', `http://${localIP}:5000`);

// Show what the verification URL would be with local IP
const testToken = 'test-123';
const localUrl = `http://${localIP}:3000/verify-email?token=${testToken}`;
console.log('\nLocal network verification URL would be:');
console.log(localUrl);

console.log('\n📱 For phone testing:');
console.log('1. Connect phone to same WiFi network');
console.log(`2. Access website at: http://${localIP}:3000`);
console.log('3. Register user and check verification email');

console.log('\n🌐 For production testing:');
console.log('1. Go to: https://all4youauctions.co.za');
console.log('2. Register user there (not on localhost)');
console.log('3. Verification email will use correct domain');
