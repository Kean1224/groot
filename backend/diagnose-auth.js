require('dotenv').config();
const nodemailer = require('nodemailer');

async function diagnoseProblem() {
  console.log('🔍 Email Authentication Diagnostic Tool');
  console.log('=' .repeat(60));
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  console.log('SMTP_PASS length:', process.env.SMTP_PASS?.length);
  console.log('SMTP_PASS format:', process.env.SMTP_PASS?.replace(/./g, '*'));
  
  // Check if App Password format is correct
  const appPassword = process.env.SMTP_PASS;
  console.log('\n🔍 App Password Analysis:');
  console.log('Length:', appPassword?.length, '(should be 16)');
  console.log('Contains spaces:', /\s/.test(appPassword || ''));
  console.log('All lowercase:', appPassword === appPassword?.toLowerCase());
  
  // Test different authentication methods
  const configs = [
    {
      name: 'Current Configuration (Explicit)',
      config: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        debug: true
      }
    },
    {
      name: 'Gmail Service Shortcut',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        debug: true
      }
    },
    {
      name: 'Alternative Port 465 (SSL)',
      config: {
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        debug: true
      }
    }
  ];
  
  for (const { name, config } of configs) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log('-'.repeat(40));
    
    try {
      const transporter = nodemailer.createTransport(config);
      await transporter.verify();
      console.log('✅ SUCCESS: Authentication worked!');
      
      // If successful, try sending a test email
      console.log('📧 Attempting to send test email...');
      const result = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER,
        subject: `Test Success - ${name}`,
        text: `This configuration worked: ${name}`
      });
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
      break; // Stop testing if one works
      
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      console.log('Error code:', error.code);
      
      if (error.code === 'EAUTH') {
        console.log('🔧 Authentication Error - Possible causes:');
        console.log('  1. Invalid App Password');
        console.log('  2. 2FA not enabled on Google account');
        console.log('  3. App Password not generated for this email');
        console.log('  4. Google Workspace admin restrictions');
      }
    }
  }
  
  console.log('\n📞 Next Steps if All Failed:');
  console.log('1. Generate a NEW App Password at: https://myaccount.google.com/apppasswords');
  console.log('2. Make sure you\'re signed in as admin@all4youauctions.co.za');
  console.log('3. Ensure 2-Factor Authentication is enabled');
  console.log('4. Check Google Workspace Admin Console settings');
  console.log('5. Try using a regular @gmail.com account for testing');
}

diagnoseProblem().catch(console.error);
