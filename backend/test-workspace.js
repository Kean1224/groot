require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🏢 Google Workspace SMTP Test');
console.log('=' .repeat(50));

console.log('\n📧 Workspace Configuration:');
console.log('Domain:', 'all4youauctions.co.za');
console.log('Email:', process.env.SMTP_USER);
console.log('SMTP Host:', process.env.SMTP_HOST);
console.log('App Password Length:', process.env.SMTP_PASS?.length, 'characters');

async function testWorkspaceConnection() {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Works for Google Workspace too
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true
  });

  try {
    console.log('\n🔍 Testing connection to Google Workspace...');
    await transporter.verify();
    console.log('✅ Google Workspace connection successful!');
    
    console.log('\n📧 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to self
      subject: `Google Workspace Test - ${new Date().toLocaleString()}`,
      text: 'This is a test email from your Google Workspace SMTP configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4285f4;">✅ Google Workspace SMTP Working!</h2>
          <p><strong>Domain:</strong> all4youauctions.co.za</p>
          <p><strong>Email:</strong> ${process.env.SMTP_USER}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>Your Google Workspace email system is now fully operational! 🎉</p>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\n🎉 Google Workspace SMTP is working perfectly!');
    
  } catch (error) {
    console.log('\n❌ Google Workspace SMTP failed:');
    console.log('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error Solutions:');
      console.log('1. Generate a NEW App Password for admin@all4youauctions.co.za');
      console.log('2. Ensure 2FA is enabled on your workspace account');
      console.log('3. Check Google Admin Console security settings');
      console.log('4. Verify your workspace subscription includes SMTP');
    }
    
    console.log('\nError Details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
  }
}

testWorkspaceConnection();
