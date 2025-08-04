@echo off
cd /d "c:\Users\keanm\OneDrive\Desktop\123"
echo Resolving file conflicts and adding all files to git...
git add . --force
echo Committing changes...
git commit -m "Admin credentials update, JWT security fix, and cleanup script - Updated backend auth system with multiple admin accounts and secure JWT"
echo Pushing to GitHub repository kean1224/groot...
git push origin main
echo Push completed!
git log --oneline -3
pause
