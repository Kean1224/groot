require('dotenv').config();

console.log('🔍 Gmail Configuration Verification');
console.log('=' .repeat(50));

console.log('\n📧 Email Configuration:');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_FROM:', process.env.SMTP_FROM);

// Check if the email looks like a Gmail address
const email = process.env.SMTP_USER;
const isGmailAddress = email && email.toLowerCase().includes('@gmail.com');

console.log('\n🔍 Account Verification:');
if (isGmailAddress) {
  console.log('✅ Email appears to be a Gmail address');
} else {
  console.log('⚠️  Email does not appear to be a Gmail address');
  console.log('   For Gmail SMTP, you typically need a @gmail.com address');
  console.log('   Custom domains may require different SMTP settings');
}

console.log('\n📋 App Password Format Check:');
const appPassword = process.env.SMTP_PASS;
if (appPassword) {
  console.log('Length:', appPassword.length, 'characters');
  console.log('Format:', appPassword.replace(/./g, '*'));
  
  if (appPassword.length === 16) {
    console.log('✅ App Password length looks correct (16 characters)');
  } else {
    console.log('⚠️  App Password should be exactly 16 characters');
  }
  
  if (!/\s/.test(appPassword)) {
    console.log('✅ No spaces found in App Password');
  } else {
    console.log('⚠️  App Password contains spaces (remove them)');
  }
} else {
  console.log('❌ No App Password found');
}

console.log('\n🔧 Recommendations:');
if (!isGmailAddress) {
  console.log('1. If using a custom domain (@all4youauctions.co.za):');
  console.log('   - Check if your domain provider supports SMTP');
  console.log('   - You may need different SMTP settings');
  console.log('   - Consider using a Gmail address for testing');
}

console.log('2. If using Gmail:');
console.log('   - Ensure 2FA is enabled on your Google account');
console.log('   - Generate a fresh App Password');
console.log('   - Use the exact Gmail address (e.g., yourname@gmail.com)');

console.log('\n🔗 Useful Links:');
console.log('• Generate App Password: https://myaccount.google.com/apppasswords');
console.log('• Gmail SMTP Settings: https://support.google.com/mail/answer/7126229');
