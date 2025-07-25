'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setStatus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate sending (replace with real backend/email handler later)
    setTimeout(() => {
      setStatus('✅ Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Contact Us</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            name="name"
            id="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            name="email"
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 font-semibold rounded"
        >
          Send Message
        </button>
        {status && <p className="mt-2 text-green-600 text-sm">{status}</p>}
      </form>

      {/* Optional Static Contact Info */}
      <div className="mt-6 text-sm text-gray-700">
        <p><strong>Email:</strong> support@all4you.co.za</p>
        <p><strong>Phone:</strong> +27 82 123 4567</p>
        <p><strong>Location:</strong> Pretoria, South Africa</p>
      </div>
    </div>
  );
}
