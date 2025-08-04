// Manual FICA Management Tool
// Run this script to manually approve users for FICA
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data/users.json');
const FICA_FILE = path.join(__dirname, 'data/fica.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readFica() {
  if (!fs.existsSync(FICA_FILE)) return [];
  return JSON.parse(fs.readFileSync(FICA_FILE, 'utf8'));
}

function writeFica(fica) {
  fs.writeFileSync(FICA_FILE, JSON.stringify(fica, null, 2));
}

// Function to approve a user's FICA
function approveFica(email) {
  console.log(`\n📋 Approving FICA for: ${email}`);
  
  // 1. Update users.json
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log(`❌ User ${email} not found in users.json`);
    return false;
  }
  
  user.ficaApproved = true;
  writeUsers(users);
  console.log(`✅ Updated ficaApproved=true in users.json`);
  
  // 2. Update fica.json
  const fica = readFica();
  let ficaEntry = fica.find(f => f.email === email);
  if (!ficaEntry) {
    ficaEntry = { 
      email, 
      status: 'approved', 
      fileUrl: '/manual-approval',
      approvedAt: new Date().toISOString(),
      note: 'Manually approved by admin'
    };
    fica.push(ficaEntry);
  } else {
    ficaEntry.status = 'approved';
    ficaEntry.approvedAt = new Date().toISOString();
  }
  writeFica(fica);
  console.log(`✅ Updated FICA status=approved in fica.json`);
  
  return true;
}

// Function to list all users and their FICA status
function listUsers() {
  console.log('\n👥 USER FICA STATUS REPORT:');
  console.log('=' .repeat(60));
  
  const users = readUsers();
  const fica = readFica();
  
  console.log(`Found ${users.length} users in system:`);
  
  users.forEach((user, index) => {
    const ficaEntry = fica.find(f => f.email === user.email);
    const ficaStatus = ficaEntry ? ficaEntry.status : 'not_uploaded';
    
    console.log(`\n${index + 1}. 📧 ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Users.json ficaApproved: ${user.ficaApproved}`);
    console.log(`   FICA system status: ${ficaStatus}`);
    console.log(`   Can bid: ${user.ficaApproved && ficaStatus === 'approved' ? '✅ YES' : '❌ NO'}`);
    console.log('   ' + '-'.repeat(40));
  });
}

// Main execution
console.log('🔧 FICA Management Tool');
console.log('========================');

// Show current status
listUsers();

// Get command line argument
const command = process.argv[2];
const email = process.argv[3];

if (command === 'approve' && email) {
  approveFica(email);
  console.log('\n📊 Updated status:');
  listUsers();
} else if (command === 'list') {
  // Already shown above
} else {
  console.log('\n💡 USAGE:');
  console.log('  node fica-manager.js list                    - Show all users');
  console.log('  node fica-manager.js approve <email>        - Approve user FICA');
  console.log('\n📝 EXAMPLES:');
  console.log('  node fica-manager.js approve user@example.com');
  console.log('  node fica-manager.js list');
}
