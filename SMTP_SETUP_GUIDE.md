# SMTP Configuration Guide for All4You Auctions

## Current Status
The SMTP settings are properly configured on the backend in:
- `backend/.env` (environment variables)
- `backend/utils/mailer.js` (NodeMailer configuration)

## Configuration Options

### Option 1: Gmail SMTP (Recommended for testing)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@all4youauctions.co.za
SMTP_PASS=your_gmail_app_password
SMTP_FROM=admin@all4youauctions.co.za
```

**Setup Steps:**
1. Create Gmail account with admin@all4youauctions.co.za or use existing
2. Enable 2-Factor Authentication
3. Generate App Password: https://support.google.com/accounts/answer/185833
4. Use app password in SMTP_PASS

### Option 2: Domain Email Hosting
```
SMTP_HOST=smtp.your-hosting-provider.com
SMTP_PORT=587 (or 465 for SSL)
SMTP_USER=admin@all4youauctions.co.za
SMTP_PASS=your_hosting_email_password
SMTP_FROM=admin@all4youauctions.co.za
```

**Common Hosting Providers:**
- **cPanel/WHM**: smtp.yourdomain.com or mail.yourdomain.com
- **Siteground**: smtp.siteground.co.za
- **Hetzner**: smtp.hetzner.co.za
- **AXXESS**: smtp.axxess.co.za

### Option 3: Professional Email Services
- **SendGrid**: smtp.sendgrid.net
- **Mailgun**: smtp.mailgun.org
- **AWS SES**: email-smtp.region.amazonaws.com

## Testing
1. Update backend/.env with correct credentials
2. Restart backend: `npm start`
3. Visit: http://localhost:3001/email-test
4. Check backend console for detailed logs

## Current Error
The system shows "Failed to send verification email" because:
1. SMTP credentials are not set up
2. Email server connection is not configured

## Next Steps
1. Choose your email option above
2. Update backend/.env with real credentials
3. Test using the /email-test endpoint
