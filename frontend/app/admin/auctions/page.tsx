'use client';


import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', location: '', startTime: '', endTime: '', increment: 1 });

  // Fetch auctions
  const fetchAuctions = async () => {
    const res = await fetch('/api/auctions');
    const data = await res.json();
    setAuctions(data);
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', location: '', startTime: '', endTime: '', increment: 1 });
    fetchAuctions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;
    await fetch(`/api/auctions/${id}`, { method: 'DELETE' });
    fetchAuctions();
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8 bg-white">
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-600">Auction Manager</h1>

          {/* ➕ Create New Auction */}
          <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Bid Increment (R)</label>
              <input
                type="number"
                required
                value={form.increment}
                onChange={e => setForm({ ...form, increment: Number(e.target.value) })}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              ➕ Create Auction
            </button>
          </form>

          {/* 📋 Existing Auctions */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Existing Auctions</h2>
            {auctions.length === 0 ? (
              <p>No auctions found.</p>
            ) : (
              <ul className="space-y-4">
                {auctions.map(auction => (
                  <li key={auction.id} className="border-b pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{auction.title}</h3>
                        <p className="text-sm text-gray-600">Location: {auction.location}</p>
                        <p className="text-sm text-gray-600">From: {new Date(auction.startTime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">To: {new Date(auction.endTime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Increment: R{auction.increment}</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <button
                          onClick={() => handleDelete(auction.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('End this auction? This will notify winners and sellers and cannot be undone.')) return;
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lots/${auction.id}/end`, { method: 'POST' });
                              const data = await res.json();
                              if (res.ok) {
                                alert('Auction ended. Notifications sent.');
                              } else {
                                alert('Failed to end auction: ' + (data.error || 'Unknown error'));
                              }
                            } catch (e) {
                              alert('Failed to end auction.');
                            }
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          End Auction
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
