# Render + Cloudflare Email Verification Fix

## Current Issue
Your Render-hosted backend is still using development environment variables, causing verification emails to contain `localhost:3000` URLs instead of `https://all4youauctions.co.za`.

## Solution Steps

### 1. Render Dashboard Environment Variables
You need to set these environment variables in your Render service dashboard:

**Go to:** Render Dashboard → Your Backend Service → Environment

**Add these exact variables:**

```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://all4youauctions.co.za
FRONTEND_URL=https://all4youauctions.co.za

# Google Workspace SMTP (Working)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@all4youauctions.co.za
SMTP_PASS=ammlhjaflqqadnrv
SMTP_FROM=admin@all4youauctions.co.za

# Alternative names for compatibility
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=admin@all4youauctions.co.za
EMAIL_PASS=ammlhjaflqqadnrv

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-now
JWT_EXPIRES_IN=7d

# Debug
EMAIL_DEBUG=false
```

### 2. Render Service Settings
- **Port:** Render automatically handles this (usually 10000)
- **Build Command:** `npm install` (if applicable)
- **Start Command:** `node index.js`

### 3. Cloudflare DNS Settings
Since you're using Cloudflare for DNS:
- Point your domain to Render's servers
- Can use either Orange Cloud (proxied) or Gray Cloud (DNS only)
- SSL/TLS mode should be "Full" for HTTPS

### 4. Deploy Process
1. **Set Environment Variables** in Render Dashboard
2. **Redeploy** your Render service (or it auto-deploys)
3. **Test** verification emails

## Quick Test Commands

After updating Render environment variables, test with:

```bash
# Test endpoint to check environment
curl https://all4youauctions.co.za/api/ping

# Check if backend is using correct URLs
curl https://all4youauctions.co.za/health
```

## Common Render Issues

### If emails still show localhost:
1. Environment variables not saved in Render dashboard
2. Service not redeployed after environment change
3. Code still has hardcoded localhost URLs

### If service won't start:
1. Check Render logs for environment variable errors
2. Verify all required variables are set
3. Make sure JWT_SECRET is updated from default

## Render-Specific Notes

- Render automatically restarts services when environment variables change
- No need to upload .env files - use Render dashboard
- Render handles HTTPS automatically
- PORT is managed by Render (usually 10000)

## Next Steps
1. Go to Render Dashboard
2. Add the environment variables above
3. Redeploy if needed
4. Test registration on your live site
5. Verify email links use correct domain
