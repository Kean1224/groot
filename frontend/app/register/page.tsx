'use client';

import React, { useState } from 'react';
import { setToken } from '../../utils/auth';


export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [idCopy, setIdCopy] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    if (!name || !username || !email || !password || !confirmPassword) {
      setStatus('❌ Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setStatus('❌ Passwords do not match.');
      return;
    }
    // Username validation: only a-zA-Z0-9
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setStatus('❌ Username must contain only letters and numbers.');
      return;
    }
    if (!proofOfAddress || !idCopy) {
      setStatus('❌ Please upload both proof of address and ID copy.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('proofOfAddress', proofOfAddress);
      formData.append('idCopy', idCopy);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`❌ ${data.error || 'Registration failed.'}`);
        return;
      }
      setToken(data.token);
      setStatus('✅ Account created! You are now logged in.');
      // Optionally redirect or update global user state here
    } catch (err) {
      setStatus('❌ Server error. Please try again.');
    }
  };

  // Real-time password match validation
  React.useEffect(() => {
    if (!confirmPassword) {
      setPasswordError('');
    } else if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">Create Account</h1>

      <form onSubmit={handleRegister} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium">Proof of Address (PDF/JPG/PNG)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            onChange={e => setProofOfAddress(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">ID Copy (PDF/JPG/PNG)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            onChange={e => setIdCopy(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-2 border rounded shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Username (letters and numbers only)</label>
          <input
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded shadow-sm"
            pattern="[a-zA-Z0-9]+"
            title="Username must contain only letters and numbers."
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded shadow-sm"
          />
        </div>

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
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded shadow-sm"
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="text-red-600 text-xs mt-1">{passwordError}</p>
          )}
        </div>


        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
          disabled={!!passwordError || !password || !confirmPassword}
        >
          Register
        </button>

        {status && <p className="text-center mt-2 text-green-600">{status}</p>}
      </form>
    </main>
  );
}
