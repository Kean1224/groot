// Production Server Environment Check
// Deploy this file to your production server and run it

require('dotenv').config();

console.log('🌐 PRODUCTION SERVER ENVIRONMENT CHECK');
console.log('=' .repeat(60));

console.log('Current Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('SMTP_USER:', process.env.SMTP_USER);

// Test verification URL generation
const testToken = 'production-test-' + Date.now();
const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${testToken}`;

console.log('\n📧 Verification URL being generated:');
console.log(verificationUrl);

if (verificationUrl.includes('localhost')) {
  console.log('\n❌ PROBLEM FOUND!');
  console.log('Production server is using localhost URLs');
  console.log('NEXT_PUBLIC_BASE_URL is not set correctly in production');
  
  console.log('\n🔧 REQUIRED FIXES:');
  console.log('1. Set NEXT_PUBLIC_BASE_URL=https://all4youauctions.co.za in production .env');
  console.log('2. Restart your production server');
  console.log('3. Deploy updated .env file to production server');
  
} else if (verificationUrl.includes('all4youauctions.co.za')) {
  console.log('\n✅ CORRECT CONFIGURATION!');
  console.log('Production server will generate proper verification URLs');
  
} else {
  console.log('\n⚠️ UNEXPECTED URL FORMAT');
  console.log('Check your environment configuration');
}

console.log('\n📋 Next Steps:');
console.log('1. Deploy this updated .env to your production server');
console.log('2. Restart production backend server');
console.log('3. Test new user registration');

// Show what the .env should contain
console.log('\n📄 Production .env should contain:');
console.log('NEXT_PUBLIC_BASE_URL=https://all4youauctions.co.za');
console.log('SMTP_HOST=smtp.gmail.com');
console.log('SMTP_PORT=587');
console.log('SMTP_USER=admin@all4youauctions.co.za');
console.log('SMTP_PASS=ammlhjaflqqadnrv');
console.log('SMTP_FROM=admin@all4youauctions.co.za');
