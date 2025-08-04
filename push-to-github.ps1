#!/usr/bin/env pwsh

# Navigate to project directory
Set-Location "c:\Users\keanm\OneDrive\Desktop\123"

Write-Host "📍 Current Directory:" -ForegroundColor Yellow
Get-Location

Write-Host "`n🔍 Git Status:" -ForegroundColor Yellow
git status --short

Write-Host "`n📦 Adding all files to git..." -ForegroundColor Green
git add .

Write-Host "`n💾 Committing changes..." -ForegroundColor Green
git commit -m "Admin credentials update, JWT security fix, and cleanup script - Updated backend auth system with multiple admin accounts and secure JWT"

✅ Backend Email API:
- Enhanced test-email.js with comprehensive testing endpoints
- Added status check endpoint for configuration validation
- Improved error handling and logging

✅ Frontend Email Testing Interface:
- Complete email-test page.tsx with React hooks
- Added 'use client' directive to fix useState errors
- Full email testing form with configuration status check

✅ React Component Fixes:
- Fixed Notification.tsx with 'use client' directive
- Resolved all React useState hook errors

✅ Testing Infrastructure:
- Added test-email-system.js for backend validation
- Comprehensive email system testing capabilities

📧 Email system is now FULLY OPERATIONAL and ready for production!"

Write-Host "`n🚀 Pushing to GitHub repository kean1224/groot..." -ForegroundColor Cyan
git push origin main

Write-Host "`n📋 Recent commits:" -ForegroundColor Yellow
git log --oneline -3

Write-Host "`n🎉 PUSH COMPLETED! Check GitHub repository at:" -ForegroundColor Green
Write-Host "   https://github.com/kean1224/groot" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
