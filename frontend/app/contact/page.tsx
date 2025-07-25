'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate successful form submission
    setTimeout(() => {
      setStatus('✅ Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold text-yellow-700 mb-6">Contact Us</h1>

      <div className="mb-6">
        <p className="text-lg text-gray-700 mb-1">📞 Phone: <strong>+27 82 123 4567</strong></p>
        <p className="text-lg text-gray-700 mb-1">📧 Email: <strong>info@all4youauctions.co.za</strong></p>
        <p className="text-lg text-gray-700">📍 Location: Pretoria, South Africa</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Your Name</label>
          <input
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Your Email</label>
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Your Message</label>
          <textarea
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-500 text-white font-semibold px-6 py-2 rounded hover:bg-yellow-600"
        >
          Send Message
        </button>

        {status && <p className="text-green-600 mt-2">{status}</p>}
      </form>
    </main>
  );
}
