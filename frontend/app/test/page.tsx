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
      
      const testUrl = process.env.NEXT_PUBLIC_API_URL + '/api/ping';
      console.log('Environment API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Full testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        signal: controller.signal,
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ SUCCESS: ${JSON.stringify(data)}`);
      } else {
        setResult(`❌ ERROR: Status ${response.status} - ${response.statusText}`);
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
