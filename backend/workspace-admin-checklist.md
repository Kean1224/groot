🏢 Google Workspace Admin Checklist

📋 Admin Console Settings to Verify:
https://admin.google.com

1. SECURITY SETTINGS:
   □ Go to Security → Less secure apps
   □ Should be "Allow users to manage their access to less secure apps" = ON
   □ OR better: "Enforce access to less secure apps for all users" = OFF (forces App Passwords)

2. GMAIL SETTINGS:
   □ Go to Apps → Google Workspace → Gmail
   □ Check "IMAP access" = Enabled
   □ Check "POP access" = Enabled (optional but helpful)

3. USER SETTINGS:
   □ Go to Directory → Users → admin@all4youauctions.co.za
   □ Check if account is suspended or has restrictions
   □ Verify 2-Step Verification is enabled

4. DOMAIN SETTINGS:
   □ Go to Domains → Manage domains
   □ Verify all4youauctions.co.za is verified and active

🔧 ALTERNATIVE SMTP SETTINGS:
If Gmail SMTP doesn't work, try:
- Host: aspmx.l.google.com (Google's MX server)
- Port: 25 or 2525
- Security: STARTTLS

📧 TEST WITH REGULAR GMAIL:
Create a test with a regular @gmail.com account to isolate workspace issues.
