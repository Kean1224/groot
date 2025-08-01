📋 Google Workspace SMTP Checklist

✅ REQUIRED WORKSPACE ADMIN SETTINGS:

1. SMTP Authentication:
   - Go to Google Admin Console (admin.google.com)
   - Security → API Controls → Domain-wide Delegation
   - Ensure SMTP is allowed for your domain

2. Less Secure Apps:
   - In Admin Console: Security → Less secure apps
   - Should be "Enforce access to less secure apps for all users" = DISABLED
   - This forces the use of App Passwords (which is more secure)

3. IMAP/SMTP Access:
   - Gmail Settings for your workspace
   - Ensure IMAP and SMTP are enabled

4. 2-Factor Authentication:
   - Must be enabled for the admin@all4youauctions.co.za account
   - Required for App Password generation

🔧 TROUBLESHOOTING:
If still getting authentication errors:

1. Check if your Google Workspace subscription includes SMTP access
2. Verify domain ownership in Google Admin Console
3. Check for any IP restrictions or security policies
4. Try generating a fresh App Password

📞 GOOGLE WORKSPACE SUPPORT:
- Admin Console Help: support.google.com/a
- App Passwords Guide: support.google.com/accounts/answer/185833
