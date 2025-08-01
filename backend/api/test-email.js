const express = require('express');
const router = express.Router();
const { sendMail } = require('../utils/mailer');

// Test email endpoint
router.post('/test-email', async (req, res) => {
  const { to } = req.body;
  
  if (!to) {
    return res.status(400).json({ error: 'Email address required' });
  }
  
  try {
    console.log('Testing email to:', to);
    
    await sendMail({
      to: to,
      subject: 'Test Email - All4You Auctions',
      text: 'This is a test email from All4You Auctions system.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Test Email - All4You Auctions</h2>
          <p>This is a test email from the All4You Auctions system.</p>
          <p>If you receive this, the email configuration is working correctly!</p>
          <p>Best regards,<br>All4You Auctions Team</p>
        </div>
      `
    });
    
    res.json({ success: true, message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
});

module.exports = router;
