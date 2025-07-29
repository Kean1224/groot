// Debug script to test frontend-backend connection
const fetch = require('node-fetch');

async function testConnection() {
  console.log('Testing backend connection...');
  
  try {
    // Test 1: Direct backend ping
    const response = await fetch('https://groot-2.onrender.com/api/ping', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://groot-cvb5.onrender.com'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    // Test 2: Check CORS headers
    const corsResponse = await fetch('https://groot-2.onrender.com/api/ping', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://groot-cvb5.onrender.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('CORS preflight status:', corsResponse.status);
    console.log('CORS headers:', Object.fromEntries(corsResponse.headers));
    
  } catch (error) {
    console.error('Connection test failed:', error.message);
  }
}

testConnection();
