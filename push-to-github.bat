@echo off
cd /d "c:\Users\keanm\OneDrive\Desktop\123"
echo Adding all files to git...
git add .
echo Committing changes...
git commit -m "Complete email system implementation with Gmail SMTP - Final push to GitHub"
echo Pushing to GitHub repository kean1224/groot...
git push origin main
echo Push completed!
git log --oneline -3
pause
