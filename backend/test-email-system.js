require('dotenv').config();
const axios = require('axios');

async function testEmailSystem() {
  try {
    console.log('🔍 Testing Email System Configuration...\n');
    
    // Test 1: Check email configuration status
    console.log('1. Checking email configuration...');
    const statusResponse = await axios.get('http://localhost:5000/api/test-email/status');
    console.log('✅ Status Response:', JSON.stringify(statusResponse.data, null, 2));
    
    if (statusResponse.data.configured) {
      console.log('\n2. Sending test email...');
      
      // Test 2: Send a test email
      const testEmailResponse = await axios.post('http://localhost:5000/api/test-email/send-test', {
        to: 'admin@all4youauctions.co.za',
        subject: 'Email System Test - ' + new Date().toLocaleString(),
        text: 'This is a test email to verify that the Gmail SMTP configuration is working correctly!'
      });
      
      console.log('✅ Test Email Response:', JSON.stringify(testEmailResponse.data, null, 2));
      
      if (testEmailResponse.data.success) {
        console.log('\n🎉 EMAIL SYSTEM IS WORKING! ✅');
        console.log('The email verification system is now fully operational.');
      }
    } else {
      console.log('\n❌ Email system is not properly configured.');
      console.log('Configuration details:', statusResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Email System Test Failed:');
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Is the server running on port 5000?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testEmailSystem();
