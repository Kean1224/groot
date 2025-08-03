require('dotenv').config();

console.log('🚀 Starting Production Backend Server');
console.log('=' .repeat(50));

// Set production environment
process.env.NODE_ENV = 'production';

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('PORT:', process.env.PORT || 5000);

// Verify the URL that will be used for verification emails
const testToken = 'sample-token';
const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${testToken}`;
console.log('\n📧 Verification URL Pattern:');
console.log(verificationUrl);

if (verificationUrl.includes('localhost')) {
  console.log('⚠️  WARNING: Still using localhost URL!');
  console.log('✅ Expected: https://all4youauctions.co.za/verify-email?token=...');
} else {
  console.log('✅ Using production URL - CORRECT!');
}

console.log('\n🔄 Starting server...');

// Start the main server
require('./index.js');
