// Simple build verification script
const fs = require('fs');
const path = require('path');

console.log('🔍 Build Check Script');
console.log('Working Directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next');
console.log('.next directory exists:', fs.existsSync(nextDir));

if (fs.existsSync(nextDir)) {
  const buildId = path.join(nextDir, 'BUILD_ID');
  console.log('BUILD_ID exists:', fs.existsSync(buildId));
  
  if (fs.existsSync(buildId)) {
    const buildIdContent = fs.readFileSync(buildId, 'utf8');
    console.log('BUILD_ID content:', buildIdContent.trim());
  }
}

console.log('✅ Build check complete');
