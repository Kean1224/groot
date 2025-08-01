require('dotenv').config();
const { sendMail } = require('./utils/mailer');

async function testNewVerificationEmail() {
  console.log('🧪 Testing New Verification Email with Updated URL');
  console.log('=' .repeat(60));
  
  // Show current configuration
  console.log('Current NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
  
  const testToken = 'test-' + Date.now();
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${testToken}`;
  
  console.log('Generated URL:', verificationUrl);
  
  try {
    await sendMail({
      to: 'admin@all4youauctions.co.za', // Send to yourself for testing
      subject: 'TEST: Updated Verification Email',
      text: `This is a test of the updated verification system. Click here: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🧪 TEST: Updated Verification System</h2>
          <p>This is a test email to verify the new verification URL is working.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <strong>New Verification URL:</strong><br>
            <code style="word-break: break-all;">${verificationUrl}</code>
          </div>
          <a href="${verificationUrl}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 0;">
            🔗 Test Verification Link
          </a>
          <p><strong>Expected behavior:</strong> Should take you to <code>https://all4youauctions.co.za</code></p>
          <p><small>Sent at: ${new Date().toISOString()}</small></p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your email and click the verification link');
    console.log('🎯 It should now go to: https://all4youauctions.co.za');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

testNewVerificationEmail();
