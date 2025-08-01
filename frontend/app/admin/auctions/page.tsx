'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    location: '',
    startTime: '',
    endTime: '',
    increment: 1,
    depositRequired: false,
    depositAmount: 0
  });

  // Fetch auctions
  // Helper function to check if auction is completed
  const isAuctionCompleted = (auction: any): boolean => {
    if (!auction.lots || auction.lots.length === 0) {
      return false; // No lots means auction is not completed
    }
    return auction.lots.every((lot: any) => lot.status === 'ended');
  };

  const fetchAuctions = async () => {
    try {
      // For admin, we want to see ALL auctions (including completed ones)
      // So we'll call both endpoints and merge them
      const [activeResponse, pastResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/past`)
      ]);
      
      if (activeResponse.ok && pastResponse.ok) {
        const activeAuctions = await activeResponse.json();
        const pastAuctions = await pastResponse.json();
        // Combine and sort by creation date (newest first)
        const allAuctions = [...activeAuctions, ...pastAuctions];
        allAuctions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAuctions(allAuctions);
      } else {
        console.error('Failed to fetch auctions');
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
    }
  };

  // Helper to get admin auth headers
  const getAdminHeaders = () => {
    const token = localStorage.getItem('admin_jwt');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create auction:', errorData);
        alert(`Failed to create auction: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      setForm({ title: '', location: '', startTime: '', endTime: '', increment: 1, depositRequired: false, depositAmount: 0 });
      fetchAuctions();
    } catch (error) {
      console.error('Error creating auction:', error);
      alert('Network error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${id}`, { 
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete auction:', errorData);
        alert(`Failed to delete auction: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      fetchAuctions();
    } catch (error) {
      console.error('Error deleting auction:', error);
      alert('Network error occurred');
    }
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
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.depositRequired}
                  onChange={e => setForm({ ...form, depositRequired: e.target.checked })}
                  className="form-checkbox"
                />
                Deposit Required
              </label>
              {form.depositRequired && (
                <input
                  type="number"
                  min={0}
                  value={form.depositAmount}
                  onChange={e => setForm({ ...form, depositAmount: Number(e.target.value) })}
                  placeholder="Deposit Amount (R)"
                  className="border px-2 py-1 rounded w-40"
                  required
                />
              )}
            </div>
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2">
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
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {auction.title}
                          {isAuctionCompleted(auction) && (
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                              ✅ COMPLETED
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">Location: {auction.location}</p>
                        <p className="text-sm text-gray-600">From: {new Date(auction.startTime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">To: {new Date(auction.endTime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Increment: R{auction.increment}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Lots:</span> {auction.lots?.length || 0} 
                          {auction.lots?.length > 0 && (
                            <span className="ml-2">
                              ({auction.lots.filter((lot: any) => lot.status === 'ended').length} ended)
                            </span>
                          )}
                        </p>
                        {auction.depositRequired && (
                          <p className="text-sm text-red-600 font-semibold">Deposit Required: R{auction.depositAmount}</p>
                        )}
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
                              const res = await fetch(`/api/lots/${auction.id}/end`, { method: 'POST' });
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
                        <button
                          onClick={async () => {
                            // Prompt for new start/end date
                            const startTime = prompt('Enter new start date/time (YYYY-MM-DDTHH:mm):');
                            if (!startTime) return;
                            const endTime = prompt('Enter new end date/time (YYYY-MM-DDTHH:mm):');
                            if (!endTime) return;
                            try {
                              const res = await fetch(`/api/auctions/${auction.id}/rerun`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ startTime, endTime })
                              });
                              if (res.ok) {
                                alert('Auction rerun created!');
                                fetchAuctions();
                              } else {
                                const data = await res.json();
                                alert('Failed to rerun auction: ' + (data.error || 'Unknown error'));
                              }
                            } catch (e) {
                              alert('Failed to rerun auction.');
                            }
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Rerun
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
