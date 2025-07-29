# Render Deployment Guide for Groot Auction Platform

## Overview
This guide walks you through deploying your auction platform to Render with separate backend and frontend services.

## Prerequisites
- ✅ GitHub repository: `kean1224/groot` 
- ✅ Clean project structure with `backend/` and `frontend/` directories
- ✅ All environment variables properly organized

## Deployment Strategy

### Two-Service Architecture
1. **Backend Service** - Express.js API server
2. **Frontend Service** - Next.js application

## Step-by-Step Deployment

### 1. Backend Service Deployment

1. **Go to Render Dashboard**
   - Visit: https://render.com/
   - Sign in with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your `kean1224/groot` repository
   - Select the repository

3. **Backend Configuration**
   ```
   Name: groot-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables** (Add these in Render dashboard)
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://groot-frontend.onrender.com
   ```

5. **Deploy Backend**
   - Click "Create Web Service"
   - Wait for deployment to complete (~5-10 minutes)
   - Note your backend URL: `https://groot-backend.onrender.com`

### 2. Frontend Service Deployment

1. **Create Second Web Service**
   - Click "New +" → "Web Service" again
   - Select same `kean1224/groot` repository

2. **Frontend Configuration**
   ```
   Name: groot-frontend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://groot-backend.onrender.com
   ```

4. **Deploy Frontend**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your frontend will be available at: `https://groot-frontend.onrender.com`

## Important Configuration Notes

### Backend Considerations
- **Free Tier Limitations**: Service spins down after 15 minutes of inactivity
- **Cold Start**: First request after idle period takes ~30 seconds
- **Persistent Storage**: Render's filesystem is ephemeral - files reset on restart

### Frontend Considerations
- **API Calls**: All frontend API calls will use the environment variable `NEXT_PUBLIC_API_URL`
- **Static Assets**: Next.js optimizes and serves static files automatically
- **SEO**: Server-side rendering works out of the box

## Data Persistence Solutions

### Current Setup (File-based)
Your app currently uses JSON files for data storage in `backend/data/`. This works for development but has limitations on Render:

**Limitations:**
- Files are lost when service restarts
- No data sharing between multiple instances

**Recommended Upgrades:**
1. **PostgreSQL Database** (Render provides free tier)
2. **MongoDB Atlas** (free tier available)
3. **Redis** for caching and sessions

### Quick Database Migration (Optional)
If you want to upgrade to PostgreSQL:
1. Add PostgreSQL service in Render
2. Update your backend to use database instead of JSON files
3. Migrate existing JSON data to database tables

## File Upload Considerations

### Current Setup
Your app uploads files to `backend/uploads/`. On Render:

**Issues:**
- Uploaded files are lost on service restart
- No persistent file storage

**Solutions:**
1. **Cloudinary** - Image and file hosting (recommended)
2. **AWS S3** - Object storage
3. **Render Static Sites** - For static assets

## Environment Variables Reference

### Backend (.env.production)
```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://groot-frontend.onrender.com

# Add these when you set up persistent storage:
# DATABASE_URL=your_postgres_connection_string
# CLOUDINARY_URL=your_cloudinary_url
```

### Frontend
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://groot-backend.onrender.com
```

## Monitoring and Logs

### Render Dashboard Features
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and request metrics
- **Events**: Deployment and service events
- **Health Checks**: Automatic service monitoring

### Accessing Logs
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. View real-time application output

## Quick Fix for Common Deployment Error

### Error: "cd: frontend: No such file or directory"

If you see this error, it means the Root Directory is not set correctly. Here's how to fix it:

**For Frontend Service:**
1. Go to your frontend service in Render dashboard
2. Click "Settings" 
3. Scroll to "Build & Deploy"
4. Set **Root Directory** to: `frontend`
5. Set **Build Command** to: `npm install && npm run build`
6. Set **Start Command** to: `npm start`
7. Click "Save Changes"

**For Backend Service:**
1. Go to your backend service in Render dashboard
2. Click "Settings"
3. Scroll to "Build & Deploy" 
4. Set **Root Directory** to: `backend`
5. Set **Build Command** to: `npm install`
6. Set **Start Command** to: `npm start`
7. Click "Save Changes"

After making these changes, redeploy both services.

## Troubleshooting Common Issues

### Backend Not Starting
```bash
# Check logs for:
Error: Cannot find module 'xyz'
# Solution: Ensure all dependencies are in package.json

Error: ENOENT: no such file or directory
# Solution: Check file paths are relative to backend directory
```

### Frontend Build Errors
```bash
# Check for:
Module not found: Can't resolve 'xyz'
# Solution: Install missing dependencies

API calls failing
# Solution: Verify NEXT_PUBLIC_API_URL is set correctly
```

### CORS Issues
Ensure your backend allows requests from your frontend domain:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
```

## Performance Optimization

### Backend Optimizations
1. **Keep-Alive**: Implement health check endpoint to prevent cold starts
2. **Compression**: Enable gzip compression
3. **Caching**: Add Redis for session and data caching

### Frontend Optimizations
1. **Image Optimization**: Next.js automatic image optimization
2. **Code Splitting**: Automatic with Next.js
3. **Static Generation**: Use ISR for better performance

## Security Checklist

- ✅ Environment variables for sensitive data
- ✅ CORS properly configured
- ✅ HTTPS enabled by default on Render
- ✅ No hardcoded secrets in code
- ⚠️ Add rate limiting for production
- ⚠️ Implement proper authentication

## Cost Considerations

### Free Tier Limits
- **Backend**: 750 hours/month (unlimited for personal projects)
- **Frontend**: 100GB bandwidth/month
- **Database**: 1GB storage (if using PostgreSQL)

### Upgrade Recommendations
For production use, consider:
- **Starter Plan** ($7/month) - No sleep, better performance
- **PostgreSQL** ($7/month) - Persistent database
- **Custom Domain** - Professional appearance

## Next Steps After Deployment

1. **Test All Features**
   - User registration/login
   - Auction creation and bidding
   - File uploads
   - Admin panel functionality

2. **Set Up Monitoring**
   - Configure alerts for service downtime
   - Monitor error rates and performance

3. **Domain Setup** (Optional)
   - Purchase custom domain
   - Configure DNS in Render dashboard

4. **Database Migration** (Recommended)
   - Set up PostgreSQL service
   - Migrate from JSON files to database

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Discord**: Active community support
- **GitHub Issues**: Report bugs in your repository

## Backup Strategy

### Code Backup
- ✅ Code is in GitHub repository
- ✅ Automatic deployments from Git

### Data Backup
- ⚠️ JSON files are not backed up (upgrade to database recommended)
- Consider implementing data export functionality

---

**Ready to Deploy?** Follow the step-by-step instructions above, and your auction platform will be live on Render!
