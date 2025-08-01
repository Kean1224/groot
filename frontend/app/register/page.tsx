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
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      
      // Handle new email verification flow
      if (data.status === 'verification_required') {
        setStatus(`✅ ${data.message}`);
        setVerificationPending(true);
        setRegisteredEmail(data.email);
      } else {
        // Fallback for old registration flow (shouldn't happen)
        setToken(data.token);
        setStatus('✅ Account created! You are now logged in.');
      }
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

  // Resend verification email
  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('✅ New verification email sent! Please check your inbox.');
      } else {
        setStatus(`❌ ${data.error || 'Failed to resend verification email'}`);
      }
    } catch (error) {
      setStatus('❌ Network error. Please try again.');
    }
  };

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
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          disabled={!!passwordError || !password || !confirmPassword || verificationPending}
        >
          {verificationPending ? 'Registration Complete' : 'Register'}
        </button>

        {verificationPending && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-4">
            <div className="text-center">
              <div className="text-4xl mb-2">📧</div>
              <h3 className="font-bold text-blue-800 mb-2">Check Your Email!</h3>
              <p className="text-blue-700 text-sm mb-3">
                We've sent a verification link to <strong>{registeredEmail}</strong>
              </p>
              <p className="text-blue-600 text-xs mb-4">
                Click the link in the email to complete your registration and automatically log in.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded text-sm"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        )}

        {status && (
          <p className={`text-center mt-2 ${status.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>
            {status}
          </p>
        )}
      </form>
    </main>
  );
}
