'use client';

import { useState } from 'react';

export default function EmailTest() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Test Email');
  const [message, setMessage] = useState('This is a test email from the email verification system.');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);

  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/test-email/status');
      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      console.error('Failed to check email config:', error);
      setStatus('Failed to check email configuration');
    }
  };

  const sendTestEmail = async () => {
    if (!email) {
      setStatus('Please enter an email address');
      return;
    }

    setLoading(true);
    setStatus('Sending test email...');

    try {
      const response = await fetch('http://localhost:5000/api/test-email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: subject,
          text: message
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('✅ Test email sent successfully!');
      } else {
        setStatus('❌ Failed to send test email: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      setStatus('❌ Error sending test email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email System Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Email Configuration Status</h2>
        <button
          onClick={checkEmailConfig}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          Check Configuration
        </button>
        
        {configStatus && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-sm">{JSON.stringify(configStatus, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Send Test Email</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Email Address:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={sendTestEmail}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>

        {status && (
          <div className={`mt-4 p-4 rounded ${
            status.includes('✅') 
              ? 'bg-green-100 text-green-800' 
              : status.includes('❌') 
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
