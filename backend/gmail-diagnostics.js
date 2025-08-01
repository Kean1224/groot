require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Gmail SMTP Authentication Troubleshooting');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Configuration:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? `${process.env.SMTP_PASS.substring(0, 4)}***${process.env.SMTP_PASS.substring(process.env.SMTP_PASS.length - 4)}` : 'NOT SET');
console.log('SMTP_FROM:', process.env.SMTP_FROM);

// Test different SMTP configurations
const configs = [
  {
    name: 'Standard Gmail SMTP',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  },
  {
    name: 'Gmail SMTP with TLS',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Gmail Secure SMTP',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  }
];

async function testConfiguration(name, config) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log('-'.repeat(30));
  
  try {
    const transporter = nodemailer.createTransport(config);
    
    // Test connection
    console.log('📡 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    // Test sending email
    console.log('📧 Testing email send...');
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: `Test Email - ${name} - ${new Date().toLocaleString()}`,
      text: `This is a test email using configuration: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Email Test Successful!</h2>
          <p><strong>Configuration:</strong> ${name}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you receive this email, your Gmail SMTP configuration is working correctly!</p>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    return true;
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('🔍 Error details:');
    console.log('   Code:', error.code);
    console.log('   Command:', error.command);
    console.log('   Response:', error.response);
    return false;
  }
}

async function runDiagnostics() {
  console.log('\n🚀 Starting Gmail SMTP Diagnostics...\n');
  
  // Check if required environment variables are set
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Missing required environment variables!');
    console.log('Please ensure the following are set in your .env file:');
    console.log('- SMTP_USER (your Gmail address)');
    console.log('- SMTP_PASS (your Gmail App Password)');
    return;
  }
  
  // Test each configuration
  let successfulConfig = null;
  for (const { name, config } of configs) {
    const success = await testConfiguration(name, config);
    if (success && !successfulConfig) {
      successfulConfig = { name, config };
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (successfulConfig) {
    console.log('🎉 SUCCESS! Found working configuration:');
    console.log(`✅ ${successfulConfig.name}`);
    console.log('\nRecommended configuration for your mailer.js:');
    console.log(JSON.stringify(successfulConfig.config, null, 2));
  } else {
    console.log('❌ All configurations failed!');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify your Gmail account has 2-Factor Authentication enabled');
    console.log('2. Generate a new App Password at: https://myaccount.google.com/apppasswords');
    console.log('3. Use the 16-character App Password (no spaces) in SMTP_PASS');
    console.log('4. Ensure "Less secure app access" is disabled (use App Password instead)');
    console.log('5. Check if your account has any security restrictions');
  }
  
  console.log('\n📚 Additional Resources:');
  console.log('- Gmail SMTP Settings: https://support.google.com/mail/answer/7126229');
  console.log('- App Passwords Guide: https://support.google.com/accounts/answer/185833');
}

// Run diagnostics
runDiagnostics().catch(console.error);
