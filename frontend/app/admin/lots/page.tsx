'use client';


import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

// ...existing code...
type Lot = {
  id: string;
  title: string;
  description: string;
  image?: string;
  startPrice: number;
  currentBid?: number;
  endTime?: string;
  sellerEmail?: string;
  lotNumber?: number;
  condition?: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  suspended: boolean;
};

type Auction = {
  id: string;
  title: string;
  lots: Lot[];
};

export default function AdminLotsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    startPrice: '',
    bidIncrement: '',
    endTime: '',
    image: null as File | null,
    sellerEmail: '',
    sellerSearch: '',
    condition: 'Good',
  });

  useEffect(() => {
    fetchAuctions();
    fetchUsers();
  }, []);

  const fetchAuctions = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`);
    const data = await res.json();
    setAuctions(data);
  };

  const fetchUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
    const data = await res.json();
    setUsers(data.filter((u: User) => u.role !== 'admin' && !u.suspended));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuctionId || !form.title || !form.startPrice) return;

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('startPrice', form.startPrice);
    if (form.endTime) formData.append('endTime', form.endTime);
    if (form.bidIncrement) formData.append('bidIncrement', form.bidIncrement);
    if (form.image) formData.append('image', form.image);

    if (form.sellerEmail) {
      formData.append('sellerEmail', form.sellerEmail);
    }
    if (form.condition) {
      formData.append('condition', form.condition);
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${selectedAuctionId}`, {
      method: 'POST',
      body: formData
    });

    setForm({
      title: '',
      description: '',
      startPrice: '',
      bidIncrement: '',
      endTime: '',
      image: null,
      sellerEmail: '',
      sellerSearch: '',
      condition: 'Good',
    });
            <div>
              <label className="block text-sm font-medium">Condition</label>
              <select
                required
                value={form.condition}
                onChange={e => {
                  setForm({ ...form, condition: e.target.value });
                  e.target.blur(); // auto-close dropdown
                }}
                className="w-full border px-4 py-2 rounded"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
    fetchAuctions();
  };

  const handleDelete = async (auctionId: string, lotId: string, lotNumber?: number, auctionTitle?: string) => {
    const message = `Are you sure you want to delete Lot${lotNumber ? ' ' + lotNumber : ''} from Auction${auctionTitle ? ' \'' + auctionTitle + '\'' : ''}?`;
    if (!confirm(message)) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${auctionId}/${lotId}`, { method: 'DELETE' });
    fetchAuctions();
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8 bg-white">
        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-600">Lot Management</h1>
          {/* Add New Lot Form */}
          <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow space-y-4 mb-10">
            <div>
              <label className="block text-sm font-medium">Assign Seller</label>
              <input
                type="text"
                placeholder="Search seller by name or email"
                value={form.sellerSearch}
                onChange={e => setForm({ ...form, sellerSearch: e.target.value })}
                className="w-full border px-4 py-2 rounded mb-2"
              />
              <select
                value={form.sellerEmail}
                onChange={e => {
                  setForm({ ...form, sellerEmail: e.target.value });
                  e.target.blur();
                }}
                className="w-full border px-4 py-2 rounded"
              >
                <option key="no-seller" value="">No seller (admin-owned)</option>
                {users
                  .filter(u =>
                    u.name.toLowerCase().includes(form.sellerSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(form.sellerSearch.toLowerCase())
                  )
                  .map(u => (
                    <option key={u.email} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Select Auction</label>
              <select
                required
                value={selectedAuctionId}
                onChange={e => {
                  setSelectedAuctionId(e.target.value);
                  e.target.blur();
                }}
                className="w-full border px-4 py-2 rounded"
              >
                <option key="choose-auction" value="">-- Choose --</option>
                {auctions.map(auction => (
                  <option key={auction.id} value={auction.id}>{auction.title}</option>
                ))}
              </select>
            </div>
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
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Start Price (R)</label>
                <input
                  type="number"
                  required
                  value={form.startPrice}
                  onChange={e => setForm({ ...form, startPrice: e.target.value })}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Bid Increment (R)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.bidIncrement}
                  onChange={e => setForm({ ...form, bidIncrement: e.target.value })}
                  className="w-full border px-4 py-2 rounded"
                  placeholder="e.g. 10, 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Time (optional)</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })}
                className="w-full"
              />
            </div>
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              ➕ Add Lot
            </button>
          </form>

          {/* View Lots per Auction */}
          {auctions.map(auction => (
            <div key={auction.id} className="mb-8 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-bold mb-2">{auction.title}</h2>
              {auction.lots?.length === 0 ? (
                <p className="text-sm text-gray-500">No lots yet.</p>
              ) : (
                <ul className="space-y-2">
                  {auction.lots.map(lot => (
                    <li key={lot.id} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{lot.title}</p>
                          <p className="text-xs text-gray-500">Condition: {lot.condition || 'Good'}</p>
                          <p className="text-sm text-gray-600">R{lot.startPrice}</p>
                          {lot.image && (
                            <img src={lot.image} alt={lot.title} className="w-24 h-16 object-cover mt-1 rounded" />
                          )}
                          {lot.sellerEmail && (
                            <p className="text-xs text-gray-500 mt-1">Seller: {lot.sellerEmail}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(auction.id, lot.id, lot.lotNumber, auction.title)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
