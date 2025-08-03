# Cloudflare Setup Guide for Email Verification Fix

## Current Issue
Users registering on `www.all4youauctions.co.za` receive verification emails with `localhost:3000` URLs instead of the proper domain.

## Cloudflare Configuration Steps

### 1. DNS Settings
- Ensure your domain points to your server IP
- Orange cloud (proxied) or Gray cloud (DNS only) - both work

### 2. SSL/TLS Settings
- Set SSL/TLS encryption mode to "Full" or "Full (strict)"
- This ensures HTTPS works properly between Cloudflare and your origin

### 3. Backend Server Requirements

#### Deploy Updated Environment File
1. Upload `.env.production` to your server as `.env`
2. Restart your backend service
3. Verify environment variables are loaded

#### Key Environment Variables for Cloudflare
```bash
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://all4youauctions.co.za
FRONTEND_URL=https://all4youauctions.co.za
TRUST_PROXY=true
HOST=0.0.0.0
PORT=5000
```

### 4. Server Configuration

#### If using PM2:
```bash
pm2 restart all
pm2 logs --lines 20
```

#### If using systemd:
```bash
sudo systemctl restart your-backend-service
sudo systemctl status your-backend-service
```

#### Manual restart:
```bash
cd /path/to/your/backend
node index.js
```

### 5. Testing Steps

1. **Environment Check**: Run diagnostic script on server
   ```bash
   node production-env-check.js
   ```

2. **Test Registration**: Register new user on live site
3. **Check Email**: Verify verification link uses correct domain
4. **Mobile Test**: Test verification link on mobile device

### 6. Common Cloudflare Issues

#### If verification emails still show localhost:
- Server not restarted after environment update
- Environment file not in correct location
- Process still using cached environment variables

#### If emails not sending:
- Check Cloudflare doesn't block SMTP (port 587)
- Verify Google Workspace SMTP settings
- Check server firewall allows outbound SMTP

### 7. Verification Checklist

- [ ] `.env.production` uploaded to server as `.env`
- [ ] Backend service restarted
- [ ] Environment variables showing correct URLs
- [ ] New registration creates proper verification URL
- [ ] Email verification works on mobile
- [ ] Cloudflare SSL/TLS set to "Full"

## Next Steps
1. Deploy the updated `.env.production` file to your server
2. Restart your backend service
3. Test registration and email verification
4. Report back if URLs are still incorrect
