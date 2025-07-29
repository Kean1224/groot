// Quick test script to check backend connection
const testBackend = async () => {
  try {
    const response = await fetch('https://groot-2.onrender.com/api/ping', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is working:', data);
    } else {
      console.log('❌ Backend error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
};

testBackend();
