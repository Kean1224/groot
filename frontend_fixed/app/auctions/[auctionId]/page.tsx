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
import { useState } from 'react';

export default function AuctionDetailPage() {
  // --- State placeholders ---
  const [auctionTitle] = useState('Auction Title');
  const [auctionEnd] = useState(Date.now() + 1000 * 60 * 60); // 1 hour from now
  const [now] = useState(Date.now());
  const [depositStatus] = useState('not_paid');
  const [depositLoading] = useState(false);
  const [isAdmin] = useState(false);
  const [lots] = useState<Lot[]>([]); // Fill with real data
  const [userEmail] = useState('user@example.com');
  const [buyerEmails] = useState<string[]>([]);
  const [sellerEmails] = useState<string[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [lotsPerPage, setLotsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const currentLots = lots;

  // --- Handlers (placeholders) ---
  const handleDepositRequest = () => {};
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
            {depositStatus === 'not_paid' && (
              <button
                onClick={handleDepositRequest}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                disabled={depositLoading}
              >
                {depositLoading ? 'Processing...' : 'Pay Deposit (R0)'}
              </button>
            )}
            {depositStatus === 'paid' && (
              <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl shadow font-bold border border-blue-200">Deposit Paid</span>
            )}
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
              {/* ...map lots here... */}
              {/* Example card styling: */}
              {/* <div className="bg-white/90 rounded-2xl shadow-lg border border-yellow-100 p-6 hover:shadow-2xl transition-all duration-150 flex flex-col items-center text-center">
                <img src="..." alt="Lot" className="w-full h-40 object-cover rounded-xl mb-4" />
                <h2 className="text-xl font-bold text-yellow-700 mb-2">Lot Title</h2>
                <p className="text-gray-600 mb-2">Description...</p>
                <span className="text-lg font-semibold text-blue-700 mb-2">Current Bid: R0</span>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all duration-150">Place Bid</button>
              </div> */}
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
