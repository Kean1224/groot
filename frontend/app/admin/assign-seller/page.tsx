'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AssignSellerPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/api/auctions')
      .then(res => res.json())
      .then(setAuctions);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data.filter((u: any) => u.role !== 'admin' && !u.suspended)));
  }, []);

  useEffect(() => {
    if (selectedAuctionId) {
      fetch(`/api/lots/${selectedAuctionId}`)
        .then(res => res.json())
        .then(setLots);
    } else {
      setLots([]);
    }
  }, [selectedAuctionId]);

  const handleAssign = async () => {
    if (!selectedAuctionId || !selectedLotId || !selectedSeller) return;
    setStatus('');
    const res = await fetch(`/api/lots/${selectedAuctionId}/${selectedLotId}/assign-seller`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerEmail: selectedSeller })
    });
    if (res.ok) {
      setStatus('✅ Seller assigned!');
      setLots(lots => lots.map(lot => lot.id === selectedLotId ? { ...lot, sellerEmail: selectedSeller } : lot));
    } else {
      setStatus('❌ Failed to assign seller');
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-600">Assign Seller to Lot</h1>
          <div className="space-y-4 bg-white p-4 rounded shadow mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Auction</label>
              <select value={selectedAuctionId} onChange={e => { setSelectedAuctionId(e.target.value); setSelectedLotId(''); }} className="w-full border px-3 py-2 rounded">
                <option value="">-- Select Auction --</option>
                {auctions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lot</label>
              <select value={selectedLotId} onChange={e => setSelectedLotId(e.target.value)} className="w-full border px-3 py-2 rounded" disabled={!selectedAuctionId}>
                <option value="">-- Select Lot --</option>
                {lots.map(lot => <option key={lot.id} value={lot.id}>Lot {lot.lotNumber || '?'}: {lot.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seller</label>
              <select value={selectedSeller} onChange={e => setSelectedSeller(e.target.value)} className="w-full border px-3 py-2 rounded" disabled={!selectedLotId}>
                <option value="">-- Select Seller --</option>
                {users.map(u => <option key={u.id} value={u.email}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <button onClick={handleAssign} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2" disabled={!selectedAuctionId || !selectedLotId || !selectedSeller}>Assign Seller</button>
            {status && <div className="mt-2 text-sm">{status}</div>}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">Current Assignments</h2>
            {lots.length === 0 ? <p className="text-gray-500">No lots found.</p> : (
              <ul className="space-y-2">
                {lots.map(lot => (
                  <li key={lot.id} className="border-b pb-2 flex justify-between items-center">
                    <span>Lot {lot.lotNumber || '?'}: {lot.title}</span>
                    <span className="text-xs text-gray-500">Seller: {lot.sellerEmail || <span className="text-red-500">Unassigned</span>}</span>
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
