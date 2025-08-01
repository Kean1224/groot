# Custom Domain Setup Guide: all4youauctions.co.za

## 🌐 Complete Setup Instructions

### Step 1: Render Dashboard Configuration
**For Frontend Service:**
1. Go to Render Dashboard → Your Frontend Service
2. Settings → Custom Domains
3. Add these domains:
   - `all4youauctions.co.za`
   - `www.all4youauctions.co.za`
4. Copy the CNAME target (e.g., `your-frontend-app.onrender.com`)

**For Backend Service:**
1. Go to Render Dashboard → Your Backend Service
2. Settings → Custom Domains  
3. Add this domain:
   - `all4youauctions.co.za` (same domain, different service)
4. Copy the CNAME target (e.g., `your-backend-app.onrender.com`)

### Step 2: Cloudflare DNS Configuration
**Log into Cloudflare → all4youauctions.co.za → DNS Records**

Add these DNS records:
```
Type: CNAME
Name: @
Target: [your-frontend-app].onrender.com
Proxy: ✅ Proxied (Orange Cloud)

Type: CNAME
Name: www
Target: [your-frontend-app].onrender.com
Proxy: ✅ Proxied (Orange Cloud)

Type: CNAME
Name: api
Target: [your-backend-app].onrender.com
Proxy: ✅ Proxied (Orange Cloud)
```

### Step 3: Render Environment Variables
**Frontend Service Environment:**
```
NEXT_PUBLIC_API_URL=https://all4youauctions.co.za/api
NEXT_PUBLIC_BACKEND_URL=https://all4youauctions.co.za
NEXT_PUBLIC_WS_URL=wss://all4youauctions.co.za
NEXT_PUBLIC_BASE_URL=https://all4youauctions.co.za
NODE_ENV=production
```

**Backend Service Environment:**
```
FRONTEND_URL=https://all4youauctions.co.za
NODE_ENV=production
JWT_SECRET=your-production-secret
```

### Step 4: SSL Certificate
- **Cloudflare**: Enable "Full (strict)" SSL mode
- **Render**: Will automatically provision SSL for custom domains

### Step 5: Verification Steps
1. **DNS Propagation**: Wait 5-15 minutes for DNS to propagate
2. **SSL Provisioning**: Render takes 5-10 minutes to provision SSL
3. **Test URL**: Visit https://www.all4youauctions.co.za

### Step 6: Testing Checklist
- [ ] Homepage loads at www.all4youauctions.co.za
- [ ] Login functionality works
- [ ] API calls succeed (check browser console)
- [ ] Background images display correctly
- [ ] Navigation works properly
- [ ] SSL certificate is valid (green padlock)

### Troubleshooting
**If site doesn't load:**
1. Check DNS propagation: `nslookup www.all4youauctions.co.za`
2. Verify Render custom domain shows "Active"
3. Check Cloudflare SSL is "Full (strict)"
4. Wait up to 24 hours for full DNS propagation

**If API calls fail:**
1. Check browser console for CORS errors
2. Verify environment variables in Render
3. Ensure backend CORS includes your domain

### Security Considerations
- Update JWT_SECRET in production
- Configure proper email settings for verification
- Enable Cloudflare security features (Bot Fight Mode, etc.)
- Set up proper SSL/TLS encryption

## 🎉 Expected Result
Your auction website will be available at:
- https://www.all4youauctions.co.za
- https://all4youauctions.co.za (redirects to www)

Both with full SSL encryption and Cloudflare CDN benefits!
