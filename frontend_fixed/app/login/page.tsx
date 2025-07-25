'use client';

import React, { useState } from 'react';
import { setToken } from '../../utils/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    if (!email || !password) {
      setStatus('❌ Please fill in all fields.');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`❌ ${data.error || 'Login failed.'}`);
        return;
      }
      setToken(data.token);
      setStatus('✅ Login successful! Redirecting...');
      // Optionally redirect or update global user state here
    } catch (err) {
      setStatus('❌ Server error. Please try again.');
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
        >
          Log In
        </button>

        {status && (
          <p
            className={`text-center mt-2 font-medium ${
              status.includes('✅') || status.includes('Active')
                ? 'text-green-600'
                : status.includes('⏳')
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {status}
          </p>
        )}
      </form>
    </main>
  );
}
