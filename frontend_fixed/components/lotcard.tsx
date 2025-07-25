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
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <img
        src={lot.imageUrl}
        alt={lot.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{lot.title}</h3>
        <p className="text-gray-600 mb-4">Current Bid: R{lot.currentBid.toLocaleString()}</p>
        <Link href={`/auctions/${lot.auctionId}/lot/${lot.id}`}>
          <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded">
            🔨 Place Bid
          </button>
        </Link>
      </div>
    </div>
  );
}
