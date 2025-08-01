'use client';

import React from 'react';
import Link from 'next/link';

export type Lot = {
  id: string;
  title: string;
  imageUrl: string;
  currentBid: number;
  auctionId: string;
};

export default function LotCard({ lot }: { lot: Lot }) {
  // Construct proper image URL - handle both old 'imageUrl' and new 'image' fields
  const imageSource = lot.imageUrl || (lot as any).image;
  const imageUrl = imageSource?.startsWith('http') 
    ? imageSource 
    : imageSource?.startsWith('/uploads')
    ? `${process.env.NEXT_PUBLIC_API_URL}${imageSource}`
    : imageSource || '/placeholder-lot.svg';

  console.log('LotCard - imageSource:', imageSource, 'final imageUrl:', imageUrl);

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
        <div className="absolute top-2 right-2">
          <div className="relative group">
            <button className="bg-green-500/90 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105">
              💨 Quick Bid
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border-2 border-green-400 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
              <div className="p-2 space-y-1">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    // Add quick bid functionality here
                    console.log('Quick bid +R100 for lot:', lot.id);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  +R100
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Quick bid +R250 for lot:', lot.id);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  +R250
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Quick bid +R500 for lot:', lot.id);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  +R500
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Quick bid +R1000 for lot:', lot.id);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  +R1000
                </button>
              </div>
            </div>
          </div>
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
