#!/bin/bash

# Render Deployment Helper Script
# This script helps prepare and deploy your auction platform to Render

echo "🚀 Groot Auction Platform - Render Deployment Helper"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure looks good!"

# Function to check if git is clean
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  Warning: You have uncommitted changes"
        echo "📝 Commit your changes before deploying to Render"
        git status --short
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled"
            exit 1
        fi
    else
        echo "✅ Git working tree is clean"
    fi
}

# Function to test backend
test_backend() {
    echo "🧪 Testing Backend..."
    cd backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Test if the server starts
    echo "🔍 Testing backend startup..."
    timeout 10 npm start &
    SERVER_PID=$!
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Backend health check passed"
        kill $SERVER_PID 2>/dev/null
    else
        echo "❌ Backend health check failed"
        kill $SERVER_PID 2>/dev/null
        cd ..
        exit 1
    fi
    
    cd ..
}

# Function to test frontend
test_frontend() {
    echo "🧪 Testing Frontend..."
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Test build
    echo "🏗️  Testing frontend build..."
    if npm run build; then
        echo "✅ Frontend build successful"
    else
        echo "❌ Frontend build failed"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Function to show deployment instructions
show_instructions() {
    echo ""
    echo "🎯 Ready for Render Deployment!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. 🌐 Go to https://render.com and sign in with GitHub"
    echo "2. 🔗 Connect your repository: kean1224/groot"
    echo ""
    echo "Backend Service Configuration:"
    echo "  Name: groot-backend"
    echo "  Environment: Node"
    echo "  Build Command: cd backend && npm install"
    echo "  Start Command: cd backend && npm start"
    echo "  Environment Variables:"
    echo "    NODE_ENV=production"
    echo "    PORT=10000"
    echo "    FRONTEND_URL=https://groot-frontend.onrender.com"
    echo ""
    echo "Frontend Service Configuration:"
    echo "  Name: groot-frontend"
    echo "  Environment: Node"
    echo "  Build Command: cd frontend && npm install && npm run build"
    echo "  Start Command: cd frontend && npm start"
    echo "  Environment Variables:"
    echo "    NODE_ENV=production"
    echo "    NEXT_PUBLIC_API_URL=https://groot-backend.onrender.com"
    echo ""
    echo "📖 See RENDER_DEPLOYMENT.md for detailed instructions"
    echo ""
}

# Main execution
echo "🔍 Checking git status..."
check_git_status

echo ""
echo "🧪 Running pre-deployment tests..."

test_backend
test_frontend

show_instructions

echo "🎉 All checks passed! You're ready to deploy to Render."
echo "📝 Don't forget to update environment variables in Render dashboard"
