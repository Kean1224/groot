// Quick test to verify the current configuration
require('dotenv').config();

console.log('🧪 VERIFICATION EMAIL URL TEST');
console.log('=' .repeat(50));

const testToken = 'test-' + Date.now();
const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${testToken}`;

console.log('Current Settings:');
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('Generated URL:', verificationUrl);

if (verificationUrl.includes('all4youauctions.co.za')) {
  console.log('\n✅ SUCCESS: Verification emails will now use the correct domain!');
  console.log('✅ New registrations will get: https://all4youauctions.co.za/verify-email?token=...');
} else {
  console.log('\n❌ PROBLEM: Still using localhost URLs');
  console.log('❌ Check if server was restarted with new environment variables');
}

console.log('\n📋 Next Steps:');
console.log('1. Register a NEW user account on your website');
console.log('2. Check the verification email - it should now use the correct domain');
console.log('3. If still localhost, clear browser cache and restart frontend too');
