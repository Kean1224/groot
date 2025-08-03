#!/bin/bash
echo "=== Git Status Check ==="
git status

echo "=== Adding all changes ==="
git add .

echo "=== Committing changes ==="
git commit -m "Fix dropdown menu and add password strengthening

- Fixed Invoices dropdown menu in header with proper event handling and click-outside functionality
- Added password strength validation requiring 8+ chars, uppercase, number, and special character
- Added real-time password strength indicators in registration form
- Enhanced dropdown with better styling and animations
- Improved accessibility with ARIA attributes"

echo "=== Pushing to GitHub ==="
git push origin main

echo "=== Final Status ==="
git status
