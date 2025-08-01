const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Old Pending Registration Data');
console.log('=' .repeat(50));

const PENDING_USERS_FILE = path.join(__dirname, 'data/pending-registrations.json');

try {
  if (fs.existsSync(PENDING_USERS_FILE)) {
    const oldData = JSON.parse(fs.readFileSync(PENDING_USERS_FILE, 'utf-8'));
    console.log(`Found ${oldData.length} pending registrations`);
    
    // Clear the old data
    fs.writeFileSync(PENDING_USERS_FILE, JSON.stringify([], null, 2));
    console.log('✅ Cleared all old pending registrations');
    console.log('📧 All old verification emails with localhost URLs are now invalid');
    console.log('🎯 New registrations will use the correct domain URL');
  } else {
    console.log('No pending registrations file found');
  }
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n📋 Next Steps:');
console.log('1. Register a new user account');  
console.log('2. Check that the verification email uses https://all4youauctions.co.za');
console.log('3. Click the link to verify it works correctly');
