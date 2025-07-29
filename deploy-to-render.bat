@echo off
REM Render Deployment Helper Script for Windows
REM This script helps prepare and deploy your auction platform to Render

echo.
echo 🚀 Groot Auction Platform - Render Deployment Helper
echo ==================================================
echo.

REM Check if we're in the right directory
if not exist "backend\" (
    echo ❌ Error: Please run this script from the project root directory
    echo Backend directory not found
    pause
    exit /b 1
)

if not exist "frontend\" (
    echo ❌ Error: Please run this script from the project root directory  
    echo Frontend directory not found
    pause
    exit /b 1
)

echo ✅ Project structure looks good!
echo.

REM Test backend
echo 🧪 Testing Backend...
cd backend

if not exist "node_modules\" (
    echo 📦 Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Backend npm install failed
        cd ..
        pause
        exit /b 1
    )
)

echo ✅ Backend dependencies ready
cd ..

REM Test frontend
echo.
echo 🧪 Testing Frontend...
cd frontend

if not exist "node_modules\" (
    echo 📦 Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Frontend npm install failed
        cd ..
        pause
        exit /b 1
    )
)

echo 🏗️ Testing frontend build...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    cd ..
    pause
    exit /b 1
)

echo ✅ Frontend build successful
cd ..

echo.
echo 🎯 Ready for Render Deployment!
echo ================================
echo.
echo Next steps:
echo 1. 🌐 Go to https://render.com and sign in with GitHub
echo 2. 🔗 Connect your repository: kean1224/groot
echo.
echo Backend Service Configuration:
echo   Name: groot-backend
echo   Environment: Node
echo   Build Command: cd backend ^&^& npm install
echo   Start Command: cd backend ^&^& npm start
echo   Environment Variables:
echo     NODE_ENV=production
echo     PORT=10000
echo     FRONTEND_URL=https://groot-frontend.onrender.com
echo.
echo Frontend Service Configuration:
echo   Name: groot-frontend
echo   Environment: Node
echo   Build Command: cd frontend ^&^& npm install ^&^& npm run build
echo   Start Command: cd frontend ^&^& npm start
echo   Environment Variables:
echo     NODE_ENV=production
echo     NEXT_PUBLIC_API_URL=https://groot-backend.onrender.com
echo.
echo 📖 See RENDER_DEPLOYMENT.md for detailed instructions
echo.
echo 🎉 All checks passed! You're ready to deploy to Render.
echo 📝 Don't forget to update environment variables in Render dashboard
echo.
pause
