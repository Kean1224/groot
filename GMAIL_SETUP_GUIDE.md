# Gmail SMTP Setup Guide for All4You Auctions

## ✅ Current Configuration
Your backend is properly configured for Gmail SMTP. The system is ready to send emails once you add the App Password.

## 🔧 Gmail Account Setup Steps

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA

### Step 2: Generate App Password
1. Still in **Security** settings
2. Under "Signing in to Google", click **App passwords**
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Type: **All4You Auctions**
6. Click **Generate**
7. **COPY THE 16-CHARACTER PASSWORD** (it looks like: `abcd efgh ijkl mnop`)

### Step 3: Update Backend Configuration
1. Open: `backend/.env`
2. Replace `your_gmail_app_password_here` with your 16-character app password
3. Save the file
4. Restart the backend server

## 📧 Email Account Requirements
- **Gmail Account**: admin@all4youauctions.co.za
- **2FA**: Must be enabled
- **App Password**: Required (not your regular Gmail password)

## 🧪 Testing
1. Update the password in `backend/.env`
2. Restart backend: The console will show "✅ SMTP Server ready to send emails"
3. Test at: http://localhost:3001/email-test
4. Try registering a new user - verification emails will work!

## 🔍 Current Status
- ✅ SMTP Host: smtp.gmail.com
- ✅ SMTP Port: 587
- ✅ SMTP User: admin@all4youauctions.co.za
- ❌ SMTP Pass: **NEEDS REAL APP PASSWORD**

## ⚠️ Important Notes
- Never use your regular Gmail password for SMTP
- Always use the 16-character App Password
- Keep the App Password secure and private
- The App Password only works with this specific application

## 🚀 After Setup
Once configured, your auction platform will:
- ✅ Send verification emails for new registrations
- ✅ Send password reset emails
- ✅ Send auction notifications
- ✅ Send invoice notifications

The "❌ Failed to send verification email" error will be completely resolved!
