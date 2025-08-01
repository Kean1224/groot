# 📧 SMTP Email Configuration Guide
## Setup Professional Email for All4You Auctions

### 🎯 **What This Does:**
- Verification emails come from: `admin@all4youauctions.co.za`
- Password reset emails from: `admin@all4youauctions.co.za`
- Contact form notifications to: `admin@all4youauctions.co.za`
- Professional brand consistency

---

## 🔧 **OPTION 1: Google Workspace (Recommended)**

### **Step 1: Get Google Workspace**
1. Go to **workspace.google.com**
2. Set up `admin@all4youauctions.co.za`
3. Cost: ~$6/month

### **Step 2: Create App Password**
1. Go to **Google Admin Console**
2. **Security** → **2-Step Verification**
3. **App passwords** → **Generate password**
4. Copy the 16-character password

### **Step 3: Add to Render Environment Variables**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@all4youauctions.co.za
SMTP_PASS=your-16-character-app-password
SMTP_FROM=admin@all4youauctions.co.za
```

---

## 🆓 **OPTION 2: Cloudflare Email + Gmail SMTP**

### **Step 1: Use Cloudflare Email Routing**
- You already have `admin@all4youauctions.co.za` forwarding
- This receives emails to your Gmail

### **Step 2: Send Through Gmail SMTP**
1. **Gmail Settings** → **Accounts and Import**
2. **Send mail as** → **Add another email address**
3. Add: `admin@all4youauctions.co.za`
4. **SMTP Server**: `smtp.gmail.com`
5. **Port**: `587`
6. **Username**: `keanmartin75@gmail.com`
7. **Password**: Your Gmail app password

### **Step 3: Environment Variables**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=keanmartin75@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=admin@all4youauctions.co.za
```

---

## 📱 **OPTION 3: Other Email Providers**

### **Outlook/Hotmail:**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=admin@all4youauctions.co.za
```

### **Custom Domain Email Provider:**
```bash
SMTP_HOST=mail.your-provider.com
SMTP_PORT=587
SMTP_USER=admin@all4youauctions.co.za
SMTP_PASS=your-password
SMTP_FROM=admin@all4youauctions.co.za
```

---

## 🚀 **How to Add Environment Variables in Render:**

### **For Backend Service:**
1. **Render Dashboard** → **Your Backend Service**
2. **Environment** tab
3. **Add Environment Variable**
4. Add each variable:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `admin@all4youauctions.co.za`
   - `SMTP_PASS` = `your-app-password`
   - `SMTP_FROM` = `admin@all4youauctions.co.za`

5. **Save Changes** (service will restart automatically)

---

## ✅ **Test Your Configuration:**

### **After Setup, Test:**
1. **Register a new user** on your site
2. **Check if verification email arrives**
3. **Verify sender shows**: `admin@all4youauctions.co.za`
4. **Test password reset** functionality

### **Email Subject Lines Will Be:**
- `"Verify Your Email - All4You Auctions"`
- `"Password Reset - All4You Auctions"`
- `"Contact Form Submission from [Name]"`

---

## 🎯 **Quick Setup Recommendation:**

### **For Immediate Setup (5 minutes):**
1. **Use Option 2** (Cloudflare + Gmail)
2. **Enable Gmail 2FA** if not already done
3. **Create Gmail App Password**
4. **Add environment variables to Render**
5. **Test with new user registration**

### **For Professional Setup (30 minutes):**
1. **Get Google Workspace** ($6/month)
2. **Set up admin@all4youauctions.co.za**
3. **Use Option 1 configuration**
4. **Professional email account with full features**

---

## 🔒 **Security Notes:**
- **Never commit passwords** to GitHub
- **Use App Passwords**, not regular passwords
- **Enable 2FA** on email accounts
- **Environment variables** keep credentials secure

---

## 📞 **Need Help?**
If you need assistance with any step:
1. **Gmail App Password**: Google "Gmail App Password setup"
2. **Google Workspace**: Contact Google Workspace support
3. **Render Environment Variables**: Check Render documentation

**Once configured, all your professional emails will come from `admin@all4youauctions.co.za`!** ✨
