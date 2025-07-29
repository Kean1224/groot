'use client';

import { useState } from 'react';

export default function TestConnection() {
  const [result, setResult] = useState('Click test to check connection');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Test both regular ping and CORS test endpoint
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const pingUrl = baseUrl + '/api/ping';
      const corsTestUrl = baseUrl + '/api/ping-cors-test';
      
      console.log('Environment API URL:', baseUrl);
      console.log('Testing ping URL:', pingUrl);
      console.log('Testing CORS URL:', corsTestUrl);
      
      // Try the CORS test endpoint first
      const corsResponse = await fetch(corsTestUrl, {
        signal: controller.signal,
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (corsResponse.ok) {
        const corsData = await corsResponse.json();
        
        // Now test the original ping endpoint
        const pingResponse = await fetch(pingUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (pingResponse.ok) {
          const pingData = await pingResponse.json();
          setResult(`✅ BOTH ENDPOINTS SUCCESS!\n\nCORS Test: ${JSON.stringify(corsData)}\n\nOriginal Ping: ${JSON.stringify(pingData)}`);
        } else {
          setResult(`✅ CORS TEST SUCCESS: ${JSON.stringify(corsData)}\n\n❌ ORIGINAL PING FAILED: Status ${pingResponse.status}`);
        }
      } else {
        setResult(`❌ CORS TEST ERROR: Status ${corsResponse.status} - ${corsResponse.statusText}`);
      }
    } catch (error) {
      setResult(`❌ FAILED: ${error.message}`);
      console.error('Connection test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Backend Connection Test</h1>
        
        <div className="mb-4">
          <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
          <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'}</p>
        </div>
        
        <button 
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        
        <div className="bg-gray-100 p-4 rounded border">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      </div>
    </div>
  );
}
