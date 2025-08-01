const nodemailer = require('nodemailer');

// Ensure dotenv is loaded
require('dotenv').config();

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service for better compatibility
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'admin@all4youauctions.co.za',
    pass: process.env.SMTP_PASS || 'your_gmail_app_password_here',
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.error('🚨 Gmail SMTP Connection failed:', error.message);
    console.log('📧 Gmail Setup Required:');
    console.log('1. Enable 2-Factor Authentication on Gmail');
    console.log('2. Generate App Password: Google Account → Security → App Passwords');
    console.log('3. Update SMTP_PASS in backend/.env with 16-character app password');
    console.log('4. Restart the backend server');
    console.log('📋 Current Gmail config:', {
      user: process.env.SMTP_USER?.substring(0, 10) + '***',
      pass: process.env.SMTP_PASS?.substring(0, 4) + '***' || 'NOT_SET'
    });
  } else {
    console.log('✅ Gmail SMTP Server ready to send emails');
    console.log('📧 Using Gmail with:', process.env.SMTP_USER);
    console.log('🎉 Email verification system is fully operational!');
  }
});

async function sendMail({ to, subject, text, html, attachments }) {
  try {
    console.log('Attempting to send email to:', to);
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM
    });
    
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'admin@all4youauctions.co.za',
      to,
      subject,
      text,
      html,
      attachments,
    });
    
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

module.exports = { sendMail };
