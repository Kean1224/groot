'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white/90 p-8 rounded-2xl shadow-xl flex flex-col gap-4 border border-yellow-200">
      <h2 className="text-2xl font-bold text-yellow-700 mb-2">Contact Us</h2>
      {success && <div className="bg-green-100 text-green-700 p-2 rounded">Message sent! We'll get back to you soon.</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      <label className="font-semibold">Name
        <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label className="font-semibold">Email
        <input type="email" className="mt-1 w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label className="font-semibold">Message
        <textarea className="mt-1 w-full border rounded px-3 py-2" value={message} onChange={e => setMessage(e.target.value)} required rows={5} />
      </label>
      <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
