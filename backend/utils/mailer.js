const nodemailer = require('nodemailer');

console.log('🔧 Configuring Email Transporter...');
console.log('SMTP Host:', process.env.SMTP_HOST);
console.log('SMTP User:', process.env.SMTP_USER);
console.log('SMTP Password Set:', !!process.env.SMTP_PASS);

// Configure your SMTP transport with enhanced Gmail settings
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service shortcut
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection on startup
async function testConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

async function sendMail({ to, subject, text, html, attachments }) {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'admin@all4youauctions.co.za',
      to,
      subject,
      text,
      html,
      attachments,
    });
    
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    throw error;
  }
}

// Alternative function name for consistency
async function sendEmail(to, subject, text, html, attachments) {
  return sendMail({ to, subject, text, html, attachments });
}

// Initialize connection test
testConnection();

module.exports = { sendMail, sendEmail, testConnection };
