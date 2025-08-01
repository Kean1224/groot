echo "=== PUSHING CHANGES TO GITHUB ==="
echo "Repository: kean1224/groot"
echo "Branch: main"
echo ""

echo "Step 1: Navigate to project directory"
cd /d "c:\Users\keanm\OneDrive\Desktop\123"

echo "Step 2: Check git status"
git status

echo "Step 3: Add all changes"
git add .

echo "Step 4: Commit changes"
git commit -m "Complete email system implementation with Gmail SMTP configuration - Production ready with comprehensive testing infrastructure"

echo "Step 5: Push to GitHub"
git push origin main

echo "Step 6: Verify push"
git log --oneline -2

echo ""
echo "=== PUSH COMPLETED ==="
echo "Check your GitHub repository at: https://github.com/kean1224/groot"
pause
