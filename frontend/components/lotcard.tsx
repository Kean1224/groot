'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export type Lot = {
  id: string;
  title: string;
  imageUrl: string;
  currentBid: number;
  auctionId: string;
};

export default function LotCard({ lot }: { lot: Lot }) {
  const [isQuickBidOpen, setIsQuickBidOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickBidOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Construct proper image URL - handle both old 'imageUrl' and new 'image' fields
  const imageSource = lot.imageUrl || (lot as any).image;
  const imageUrl = imageSource?.startsWith('http') 
    ? imageSource 
    : imageSource?.startsWith('/uploads')
    ? `${process.env.NEXT_PUBLIC_API_URL}${imageSource}`
    : imageSource || '/placeholder-lot.svg';

  console.log('LotCard - imageSource:', imageSource, 'final imageUrl:', imageUrl);

  const handleQuickBid = (increment: number) => {
    // Add quick bid functionality here
    console.log(`Quick bid +R${increment} for lot:`, lot.id);
    setIsQuickBidOpen(false);
    // TODO: Implement actual quick bid API call
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <div className="relative w-full h-48">
        <img
          src={imageUrl}
          alt={lot.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            console.log('Image load failed, using placeholder:', imageUrl);
            (e.target as HTMLImageElement).src = '/placeholder-lot.svg';
          }}
        />
        {/* Quick Bid Dropdown */}
        <div className="absolute top-2 right-2" ref={dropdownRef}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsQuickBidOpen(!isQuickBidOpen);
            }}
            className={`bg-green-500/90 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 ${isQuickBidOpen ? 'scale-105 bg-green-600' : ''}`}
          >
            💨 <span className="hidden sm:inline">Quick Bid</span>
            <svg 
              className={`w-3 h-3 inline ml-1 transition-transform duration-200 ${isQuickBidOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isQuickBidOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border-2 border-green-400 z-20 min-w-[140px] transform transition-all duration-200 ease-out">
              <div className="p-2 space-y-1">
                <div className="text-xs text-gray-500 text-center mb-1 font-semibold px-2">Quick bid options:</div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickBid(100);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex justify-between"
                >
                  <span>+R100</span>
                  <span className="text-xs text-gray-500">R{(lot.currentBid + 100).toLocaleString()}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickBid(250);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex justify-between"
                >
                  <span>+R250</span>
                  <span className="text-xs text-gray-500">R{(lot.currentBid + 250).toLocaleString()}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickBid(500);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex justify-between"
                >
                  <span>+R500</span>
                  <span className="text-xs text-gray-500">R{(lot.currentBid + 500).toLocaleString()}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickBid(1000);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex justify-between"
                >
                  <span>+R1000</span>
                  <span className="text-xs text-gray-500">R{(lot.currentBid + 1000).toLocaleString()}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{lot.title}</h3>
        <p className="text-gray-600 mb-4">Current Bid: R{lot.currentBid.toLocaleString()}</p>
        <Link href={`/auctions/${lot.auctionId}/lot/${lot.id}`}>
          <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            🔨 View & Bid
          </button>
        </Link>
      </div>
    </div>
  );
}
