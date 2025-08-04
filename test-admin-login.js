const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch('http://localhost:5000/api/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@all4youauctions.co.za',
        password: 'SecureAdminPass123!'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok && data.token) {
      console.log('✅ Admin login successful!');
      console.log('Token received:', data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.error('Error testing admin login:', error.message);
  }
}

testAdminLogin();
