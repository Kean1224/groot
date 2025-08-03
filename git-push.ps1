Write-Host "=== Git Status Check ===" -ForegroundColor Green
git status

Write-Host "`n=== Adding all changes ===" -ForegroundColor Green
git add .

Write-Host "`n=== Committing changes ===" -ForegroundColor Green
git commit -m "Fix dropdown menu and add password strengthening

- Fixed Invoices dropdown menu in header with proper event handling and click-outside functionality
- Added password strength validation requiring 8+ chars, uppercase, number, and special character
- Added real-time password strength indicators in registration form
- Enhanced dropdown with better styling and animations
- Improved accessibility with ARIA attributes"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Green
git push origin main

Write-Host "`n=== Final Status ===" -ForegroundColor Green
git status

Write-Host "`n=== Recent Commits ===" -ForegroundColor Green
git log --oneline -3
