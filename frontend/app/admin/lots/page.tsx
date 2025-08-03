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
  status?: string;
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
    try {
      // Fetch all auctions (both active and completed for admin view)
      const [activeResponse, pastResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/past`)
      ]);
      
      let allAuctions: Auction[] = [];
      
      if (activeResponse.ok) {
        const activeAuctions = await activeResponse.json();
        allAuctions = [...allAuctions, ...activeAuctions];
      }
      
      if (pastResponse.ok) {
        const pastAuctions = await pastResponse.json();
        allAuctions = [...allAuctions, ...pastAuctions];
      }
      
      // Sort by creation date (newest first)
      allAuctions.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      
      setAuctions(allAuctions);
      console.log('Fetched auctions with lots:', allAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      alert('Failed to fetch auctions');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
      const data = await res.json();
      // Show ALL users for admin (including suspended users, but exclude other admins)
      setUsers(data.filter((u: User) => u.role !== 'admin'));
      console.log('Fetched all registered users:', data.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuctionId || !form.title || !form.startPrice || !form.bidIncrement) {
      alert('Please fill in all required fields (Auction, Title, Start Price, Bid Increment)');
      return;
    }

    if (parseFloat(form.startPrice) <= 0) {
      alert('Start price must be greater than 0');
      return;
    }

    if (parseFloat(form.bidIncrement) <= 0) {
      alert('Bid increment must be greater than 0');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('startPrice', form.startPrice);
      formData.append('bidIncrement', form.bidIncrement);
      if (form.endTime) formData.append('endTime', form.endTime);
      if (form.image) formData.append('image', form.image);

      if (form.sellerEmail) {
        formData.append('sellerEmail', form.sellerEmail);
      }
      if (form.condition) {
        formData.append('condition', form.condition);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${selectedAuctionId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to create lot: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const newLot = await response.json();
      const endTimeMessage = newLot.endTime ? `\nEnd Time: ${new Date(newLot.endTime).toLocaleString()}` : '';
      alert(`✅ Lot "${form.title}" successfully added to auction!\n\nLot Number: ${newLot.lotNumber}\nStart Price: R${newLot.startPrice}\nBid Increment: R${newLot.bidIncrement || 10}${endTimeMessage}`);

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
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await fetchAuctions();
    } catch (error) {
      console.error('Error creating lot:', error);
      alert('Network error occurred while creating lot');
    }
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
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">📅 Lot Timing Information</h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Automatic timing:</strong> Lots end 1 minute apart automatically</li>
              <li>• <strong>First lot:</strong> Ends 5 minutes after creation</li>
              <li>• <strong>Subsequent lots:</strong> Each ends 1 minute after the previous lot</li>
              <li>• <strong>Custom timing:</strong> You can override by setting a specific end time</li>
            </ul>
          </div>
          
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
                      {u.name} ({u.email}) {u.suspended ? '🚫 SUSPENDED' : '✅ ACTIVE'}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Shows all registered users. Suspended users are marked with 🚫
              </p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>
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
            </div>
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              ➕ Add Lot
            </button>
          </form>

          {/* View Lots per Auction */}
          <div className="space-y-6">
            {auctions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No auctions found. Create an auction first.</p>
            ) : (
              auctions.map(auction => (
                <div key={auction.id} className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{auction.title}</h2>
                      <p className="text-sm text-gray-600">Auction ID: {auction.id}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {auction.lots?.length || 0} lots
                    </span>
                  </div>
                  
                  {!auction.lots || auction.lots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 mb-2">No lots in this auction yet.</p>
                      <p className="text-sm text-gray-400">Add lots using the form above.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {auction.lots.map((lot, index) => (
                        <div key={lot.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  LOT {lot.lotNumber || index + 1}
                                </span>
                                <h3 className="font-semibold text-lg">{lot.title}</h3>
                              </div>
                              
                              {lot.description && (
                                <p className="text-gray-600 mb-2">{lot.description}</p>
                              )}
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Start Price:</span>
                                  <p className="text-green-600 font-bold">R{lot.startPrice.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Current Bid:</span>
                                  <p className="text-blue-600 font-bold">R{(lot.currentBid || lot.startPrice).toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Condition:</span>
                                  <p className="text-gray-800">{lot.condition || 'Good'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Status:</span>
                                  <p className={`font-medium ${lot.status === 'ended' ? 'text-red-600' : 'text-green-600'}`}>
                                    {lot.status === 'ended' ? '🔚 Ended' : '🟢 Active'}
                                  </p>
                                </div>
                              </div>
                              
                              {lot.sellerEmail && (
                                <p className="text-xs text-gray-500 mt-2">
                                  <span className="font-medium">Seller:</span> {lot.sellerEmail}
                                </p>
                              )}
                              
                              {lot.endTime && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">End Time:</span> {new Date(lot.endTime).toLocaleString()}
                                  {index > 0 && (
                                    <span className="ml-2 text-blue-600">
                                      📅 +{index} min from first lot
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 ml-4">
                              {lot.image && (
                                <img 
                                  src={`${process.env.NEXT_PUBLIC_API_URL}${lot.image}`} 
                                  alt={lot.title} 
                                  className="w-20 h-16 object-cover rounded border"
                                />
                              )}
                              <button
                                onClick={() => handleDelete(auction.id, lot.id, lot.lotNumber, auction.title)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
