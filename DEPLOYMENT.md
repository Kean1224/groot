# 🚀 All4You Auctioneers - Render.com Deployment Guide

## Prerequisites
- GitHub account
- Render.com account (free tier available)
- Your project pushed to GitHub

## 📋 Deployment Steps

### 1. Push Your Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - All4You Auctioneers"
git branch -M main
git remote add origin https://github.com/yourusername/all4you-auctioneers.git
git push -u origin main
```

### 2. Deploy Backend on Render.com

1. **Go to Render.com Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure Backend Service:**
   - **Name:** `all4you-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (for testing)

5. **Add Environment Variables:**
   ```
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-now
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

6. **Deploy and wait for completion**

### 3. Deploy Frontend on Render.com

1. **Click "New +" → "Static Site"**
2. **Connect same GitHub repository**
3. **Configure Frontend Service:**
   - **Name:** `all4you-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/out` (or `frontend/.next` for server-side)

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://all4you-backend.onrender.com/api
   NEXT_PUBLIC_BACKEND_URL=https://all4you-backend.onrender.com
   NEXT_PUBLIC_WS_URL=wss://all4you-backend.onrender.com
   ```

### 4. Update URLs After Deployment

After both services are deployed, update the URLs:

1. **Update backend CORS** with your actual frontend URL
2. **Update frontend environment variables** with actual backend URL
3. **Redeploy both services**

### 5. Admin Access
- **Admin Email:** Keanmartin75@gmail.com
- **Admin Password:** Tristan@89
- **Admin Panel:** https://your-frontend.onrender.com/admin/login

## 🔧 Production Considerations

### For Better Performance:
1. **Upgrade to Render paid plans** for:
   - No cold starts
   - Better performance
   - Custom domains

2. **Database:** Consider upgrading from JSON files to:
   - PostgreSQL (Render provides free tier)
   - MongoDB Atlas

3. **File Storage:** Consider cloud storage for uploads:
   - AWS S3
   - Cloudinary

### Security Updates:
1. **Change JWT_SECRET** to a strong random value
2. **Set up email service** (SMTP credentials)
3. **Configure custom domain** with SSL
4. **Set up monitoring** and backups

## 📞 Support
If you encounter issues:
1. Check Render logs in dashboard
2. Verify environment variables
3. Ensure GitHub repository is up to date
4. Check CORS settings

Your auction platform will be live at:
- **Frontend:** https://your-frontend.onrender.com
- **Backend:** https://your-backend.onrender.com
- **Admin Panel:** https://your-frontend.onrender.com/admin/login

🎉 **Your All4You Auctioneers platform will be live!**
