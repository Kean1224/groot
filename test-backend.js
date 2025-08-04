// Quick test script to check backend connection and admin login
const testBackend = async () => {
  try {
    console.log('Testing admin login...');
    const response = await fetch('http://localhost:5000/api/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin login working:', data);
    } else {
      const error = await response.json();
      console.log('❌ Admin login error:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
};

testBackend();
