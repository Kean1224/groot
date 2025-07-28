// --- Imports ---
'use client';
import React from 'react';

// --- Types (add more as needed) ---
type BidEntry = {
  bidderEmail: string;
  amount: number;
  time: string;
};

type Lot = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  currentBid: number;
  status: string;
  bidHistory?: BidEntry[];
  bidIncrement?: number;
  sellerEmail?: string;
  endTime?: string;
  lotNumber?: number;
};

// --- Main Component ---
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = params?.auctionId;
  // --- State ---
  const [auction, setAuction] = useState<any>(null);
  const [auctionTitle, setAuctionTitle] = useState('Auction Title');
  const [auctionEnd, setAuctionEnd] = useState(Date.now() + 1000 * 60 * 60);
  const [now] = useState(Date.now());
  const [depositStatus, setDepositStatus] = useState('not_paid');
  const [depositLoading, setDepositLoading] = useState(false);
  const [isAdmin] = useState(false);
  // Admin FICA review state
  const [ficaList, setFicaList] = useState<any[]>([]);
  const [ficaListLoading, setFicaListLoading] = useState(false);
  // Fetch all FICA uploads for admin
  const fetchFicaList = () => {
    setFicaListLoading(true);
    fetch('/api/fica')
      .then(res => res.json())
      .then(data => setFicaList(data || []))
      .finally(() => setFicaListLoading(false));
  };
  useEffect(() => {
    if (!isAdmin) return;
    fetchFicaList();
  }, [isAdmin]);

  // Admin approve/reject handlers
  const handleApproveFica = async (email: string) => {
    await fetch(`/api/fica/${email}/approve`, { method: 'POST' });
    setFicaList(list => list.map(f => f.email === email ? { ...f, status: 'approved' } : f));
  };
  const handleRejectFica = async (email: string) => {
    await fetch(`/api/fica/${email}/reject`, { method: 'POST' });
    setFicaList(list => list.map(f => f.email === email ? { ...f, status: 'rejected' } : f));
  };
  const [lots, setLots] = useState<Lot[]>([]);
  const [userEmail] = useState('user@example.com');
  // FICA logic
  const [ficaStatus, setFicaStatus] = useState<'not_uploaded' | 'pending' | 'approved' | 'rejected'>('not_uploaded');
  const [ficaLoading, setFicaLoading] = useState(false);
  // Fetch FICA status if no deposit required
  useEffect(() => {
    if (!auctionId || !userEmail || auction?.depositRequired) return;
    fetch(`/api/fica/${userEmail}`)
      .then(res => res.json())
      .then(data => setFicaStatus(data.status || 'not_uploaded'));
  }, [auctionId, userEmail, auction]);

  // FICA upload handler
  const handleFicaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setFicaLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    await fetch(`/api/fica/${userEmail}`, {
      method: 'POST',
      body: formData,
    });
    setFicaLoading(false);
    setFicaStatus('pending');
    alert('FICA document uploaded. Awaiting admin approval.');
  };
  const [buyerEmails] = useState<string[]>([]);
  const [sellerEmails] = useState<string[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [lotsPerPage, setLotsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch auction details
  useEffect(() => {
    if (!auctionId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((a: any) => a.id === auctionId);
        if (found) {
          setAuction(found);
          setAuctionTitle(found.title);
          setAuctionEnd(new Date(found.endTime).getTime());
        }
      });
  }, [auctionId]);

  // Fetch deposit status
  useEffect(() => {
    if (!auctionId || !userEmail) return;
    fetch(`/api/deposits/${auctionId}/${userEmail}`)
      .then(res => res.json())
      .then(data => setDepositStatus(data.status || 'not_paid'));
  }, [auctionId, userEmail]);
  const totalPages = 1;
  const currentLots = lots;

  // --- Poll lots every 3 seconds ---
  useEffect(() => {
    if (!auctionId) return;
    const fetchLots = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions/${auctionId}/lots`);
        if (res.ok) {
          const data = await res.json();
          setLots(data.lots || []);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchLots();
    const interval = setInterval(fetchLots, 3000);
    return () => clearInterval(interval);
  }, [auctionId]);

  // --- Handlers ---
  const handleDepositRequest = async () => {
    if (!auctionId || !userEmail) return;
    setDepositLoading(true);
    await fetch(`/api/deposits/${auctionId}/${userEmail}`, { method: 'POST' });
    setDepositLoading(false);
    setDepositStatus('pending');
    alert('Please pay the deposit to the provided banking details. Your payment will be reviewed by admin.');
  };
  const handleDownloadInvoice = (email?: string, type: 'buyer' | 'seller' = 'buyer') => {};
  const handlePageChange = (dir: 'next' | 'prev') => {};
  const toggleDescription = (lotId: string) => {};
  const toggleWatchlist = (lotId: string) => {};
  const handlePlaceBid = (lotId: string, currentBid: number, increment: number) => {};
  const handleSetAutoBid = (lotId: string) => {};
  const autoBidInputs: { [lotId: string]: string } = {};
  const autoBidLoading: { [lotId: string]: boolean } = {};
  const autoBidStatus: { [lotId: string]: number | null } = {};
  const expandedDescriptions: { [lotId: string]: boolean } = {};
  const watchlist: string[] = [];

  // --- Helper ---
  function formatTimeLeft(ms: number) {
    if (ms <= 0) return 'Ended';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // --- Render ---
  return (
    <main className="min-h-screen px-2 py-10 sm:px-6 bg-gradient-to-br from-yellow-200 via-white to-blue-200 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-200 p-0 sm:p-0 flex flex-col items-center relative overflow-hidden">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-yellow-300/60 via-white/80 to-blue-200/60 py-8 px-6 flex flex-col items-center border-b border-yellow-100 relative">
          <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-100 to-blue-200 flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-5xl">🏆</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-yellow-600 mb-2 text-center drop-shadow-lg tracking-tight">
            {auctionTitle}
          </h1>
          <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mt-2">
            <div className="bg-blue-100 text-blue-800 font-mono px-6 py-2 rounded-xl shadow border border-blue-200 text-lg">
              Auction ends in: {formatTimeLeft(auctionEnd - now)}
            </div>
            {/* Deposit logic */}
            {auction?.depositRequired && (
              <div className="flex flex-col items-center">
                <span className="text-red-600 font-semibold mb-1">Deposit Required: R{auction.depositAmount}</span>
                {depositStatus === 'not_paid' && (
                  <button
                    onClick={handleDepositRequest}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                    disabled={depositLoading}
                  >
                    {depositLoading ? 'Processing...' : 'Pay Deposit'}
                  </button>
                )}
                {depositStatus === 'pending' && (
                  <span className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-xl shadow font-bold border border-yellow-200">Deposit Pending Approval</span>
                )}
                {depositStatus === 'approved' && (
                  <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl shadow font-bold border border-blue-200">Deposit Approved</span>
                )}
                {/* Show banking details if deposit required and not paid */}
                {depositStatus !== 'approved' && (
                  <div className="mt-2 text-xs text-gray-700 bg-white/80 p-2 rounded border border-yellow-200">
                    <div className="font-bold mb-1">Banking Details:</div>
                    <div>Bank: [Your Bank Name]</div>
                    <div>Account: [Your Account Number]</div>
                    <div>Reference: {userEmail} / {auctionTitle}</div>
                  </div>
                )}
              </div>
            )}
            {/* If no deposit required, show FICA logic here if needed */}
          </div>
        </div>

        {/* Download Invoice Buttons */}
        <div className="w-full flex flex-col sm:flex-row justify-end items-center gap-4 px-6 py-6 border-b border-yellow-100 bg-white/70">
          <button
            onClick={() => handleDownloadInvoice(undefined, 'buyer')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            Download My Buyer Invoice (PDF)
          </button>
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-sm">Buyer:</label>
                <select
                  className="border rounded-xl px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200"
                  value={selectedBuyer}
                  onChange={e => setSelectedBuyer(e.target.value)}
                >
                  <option value="">Select buyer...</option>
                  {buyerEmails.map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
                <button
                  onClick={() => selectedBuyer && handleDownloadInvoice(selectedBuyer, 'buyer')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow disabled:opacity-50 transition-all duration-150"
                  disabled={!selectedBuyer}
                >
                  Download Buyer Invoice
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-sm">Seller:</label>
                <select
                  className="border rounded-xl px-2 py-1 text-sm focus:ring-2 focus:ring-green-200"
                  value={selectedSeller}
                  onChange={e => setSelectedSeller(e.target.value)}
                >
                  <option value="">Select seller...</option>
                  {sellerEmails.map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
                <button
                  onClick={() => selectedSeller && handleDownloadInvoice(selectedSeller, 'seller')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl shadow disabled:opacity-50 transition-all duration-150"
                  disabled={!selectedSeller}
                >
                  Download Seller Invoice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-dashed border-yellow-200 my-8"></div>

        {/* Admin FICA approval UI */}
        {isAdmin && (
          <div className="w-full px-6 py-6 bg-white/80 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yellow-700">FICA Approvals</h2>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={fetchFicaList}
                disabled={ficaListLoading}
              >
                {ficaListLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {ficaListLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : ficaList.length === 0 ? (
              <div className="text-gray-400 italic">No FICA uploads found.</div>
            ) : (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="p-2 border">User Email</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Document</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ficaList.map(fica => (
                    <tr key={fica.email} className="border-b">
                      <td className="p-2 border">{fica.email}</td>
                      <td className="p-2 border">{fica.status}</td>
                      <td className="p-2 border">
                        <a href={fica.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                      </td>
                      <td className="p-2 border flex gap-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          onClick={() => handleApproveFica(fica.email)}
                          disabled={fica.status === 'approved'}
                        >Approve</button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          onClick={() => handleRejectFica(fica.email)}
                          disabled={fica.status === 'rejected'}
                        >Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Lots per page selector */}
        <div className="w-full flex justify-end mb-6 items-center gap-2 px-6">
          <label className="text-sm">Lots per page:</label>
          <select
            className="border rounded-xl px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-200"
            value={lotsPerPage}
            onChange={e => setLotsPerPage(Number(e.target.value))}
          >
            <option value={9}>9</option>
            <option value={18}>18</option>
            <option value={36}>36</option>
          </select>
        </div>

        {/* Lot list */}
        <div className="w-full px-6 pb-8">
          {currentLots.length === 0 ? (
            <p className="text-center text-gray-400 italic">No lots found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentLots.map(lot => (
                <div key={lot.id} className="bg-white/90 rounded-2xl shadow-lg border border-yellow-100 p-6 hover:shadow-2xl transition-all duration-150 flex flex-col items-center text-center">
                  <img src={lot.imageUrl || '/placeholder.jpg'} alt={lot.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                  <h2 className="text-xl font-bold text-yellow-700 mb-2">{lot.title}</h2>
                  <p className="text-gray-600 mb-2">{lot.description}</p>
                  <span className="text-lg font-semibold text-blue-700 mb-2">Current Bid: R{lot.currentBid}</span>
                  {/* Restrict bidding based on deposit or FICA */}
                  {auction?.depositRequired ? (
                    depositStatus === 'approved' ? (
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all duration-150"
                        onClick={() => handlePlaceBid(lot.id, lot.currentBid, lot.bidIncrement || 0)}
                      >
                        Place Bid
                      </button>
                    ) : (
                      <span className="text-xs text-red-500 font-semibold">You must pay and have your deposit approved to bid.</span>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-blue-600 font-semibold">FICA required to bid.</span>
                      {ficaStatus === 'not_uploaded' && (
                        <>
                          <input type="file" accept="image/*,.pdf" onChange={handleFicaUpload} disabled={ficaLoading} className="text-xs" />
                          <span className="text-xs text-gray-500">Upload ID/Proof of Address</span>
                        </>
                      )}
                      {ficaStatus === 'pending' && (
                        <span className="text-xs text-yellow-600">FICA pending admin approval.</span>
                      )}
                      {ficaStatus === 'approved' && (
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all duration-150"
                          onClick={() => handlePlaceBid(lot.id, lot.currentBid, lot.bidIncrement || 0)}
                        >
                          Place Bid
                        </button>
                      )}
                      {ficaStatus === 'rejected' && (
                        <span className="text-xs text-red-600">FICA rejected. Please re-upload.</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="w-full mt-4 flex justify-center items-center gap-6 pb-8">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-yellow-100 text-gray-700 font-semibold shadow disabled:opacity-50 transition-all duration-150"
          >
            ← Prev
          </button>
          <span className="text-base font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage === totalPages}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-yellow-100 text-gray-700 font-semibold shadow disabled:opacity-50 transition-all duration-150"
          >
            Next →
          </button>
        </div>

        {/* Decorative bottom accent */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-6 bg-gradient-to-r from-yellow-300 via-yellow-100 to-blue-200 rounded-full blur-md opacity-60"></div>
      </div>
    </main>
  );
}
