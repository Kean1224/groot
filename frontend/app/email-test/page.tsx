import { useState } from 'react';

export default function EmailTest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testEmail = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: email }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('✅ Test email sent successfully! Check your inbox.');
      } else {
        setMessage(`❌ Failed to send email: ${result.error}`);
        if (result.details) {
          console.error('Email error details:', result.details);
        }
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
      console.error('Email test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Test</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
          
          <button
            onClick={testEmail}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
          
          {message && (
            <div className={`p-3 rounded-md ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Purpose:</strong> Test the email verification system</p>
          <p><strong>Status:</strong> Check backend console for detailed logs</p>
        </div>
      </div>
    </div>
  );
}
