require('dotenv').config();
const nodemailer = require('nodemailer');

async function quickTest() {
  console.log('🔧 Quick Gmail SMTP Test');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true
  });

  try {
    console.log('Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
  }
}

quickTest();
