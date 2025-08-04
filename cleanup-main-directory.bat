@echo off
echo Starting cleanup of main directory...

echo Deleting documentation files...
del /f /q "ADMIN_SECURITY_IMPLEMENTATION.md" 2>nul
del /f /q "AUCTION_COMPLETION_FEATURES.md" 2>nul
del /f /q "CUSTOM_DOMAIN_SETUP.md" 2>nul
del /f /q "DEPLOYMENT.md" 2>nul
del /f /q "DOMAIN_SETUP_SUMMARY.md" 2>nul
del /f /q "EMAIL_SETUP_GUIDE.md" 2>nul
del /f /q "EMAIL_VERIFICATION_SYSTEM.md" 2>nul
del /f /q "GMAIL_SETUP_GUIDE.md" 2>nul
del /f /q "IMAGE_IMPLEMENTATION_GUIDE.md" 2>nul
del /f /q "NAVIGATION_ENHANCEMENT_COMPLETED.md" 2>nul
del /f /q "PROFESSIONAL_EMAIL_INTEGRATION.md" 2>nul
del /f /q "QUICK_BID_DROPDOWN_IMPLEMENTATION.md" 2>nul
del /f /q "RENDER_DEPLOYMENT.md" 2>nul
del /f /q "SMTP_EMAIL_SETUP_GUIDE.md" 2>nul
del /f /q "SMTP_SETUP_GUIDE.md" 2>nul
del /f /q "URGENT_RENDER_FIX.md" 2>nul
del /f /q "WATCHLIST_AUTO_ADD_FEATURE.md" 2>nul
del /f /q "WEBSITE_IMPROVEMENTS_SUMMARY.md" 2>nul
del /f /q "github-sync-test.md" 2>nul

echo Deleting test and debug files...
del /f /q "debug-connection.js" 2>nul
del /f /q "test-admin-login.js" 2>nul
del /f /q "test-backend.js" 2>nul
del /f /q "test-cors.js" 2>nul

echo Deleting script files...
del /f /q "cleanup-all.bat" 2>nul
del /f /q "cleanup-markdown.ps1" 2>nul
del /f /q "final-cleanup.ps1" 2>nul
del /f /q "deploy-to-render.bat" 2>nul
del /f /q "deploy-to-render.sh" 2>nul
del /f /q "git-push.cmd" 2>nul
del /f /q "git-push.ps1" 2>nul
del /f /q "push-to-github.bat" 2>nul
del /f /q "push-to-github.ps1" 2>nul
del /f /q "push-to-github.sh" 2>nul

echo Removing .next directory...
rmdir /s /q ".next" 2>nul

echo Cleanup completed!
pause
