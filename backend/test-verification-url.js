require('dotenv').config();

console.log('🔍 Verification URL Configuration Test');
console.log('=' .repeat(50));
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

const verificationToken = 'test-token-123';
const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

console.log('Generated Verification URL:', verificationUrl);

// Test what URL would be generated in different scenarios
console.log('\n📋 URL Generation Tests:');
console.log('1. With env variable:', `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=ABC123`);
console.log('2. Without env variable:', `${'http://localhost:3000'}/verify-email?token=ABC123`);

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';
console.log('\n🏗️ Environment Info:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Is Production:', isProduction);

if (isProduction) {
  console.log('✅ Using production URL for verification emails');
} else {
  console.log('🏠 Using localhost URL for verification emails');
}
