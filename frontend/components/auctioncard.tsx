'use client';

import React from 'react';
import Link from 'next/link';

export type Auction = {
  id: string;
  title: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  endedAt?: string;
};

export default function AuctionCard({ auction }: { auction: Auction }) {
  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString() : '';

  return (
    <Link href={`/auctions/${auction.id}`}>
      <div className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-white cursor-pointer">
        <h3 className="text-xl font-semibold text-yellow-700 mb-1">{auction.title}</h3>
        <p className="text-sm text-gray-700 mb-1">Status: {auction.status}</p>
        {auction.startsAt && (
          <p className="text-sm text-gray-500">Starts: {formatDate(auction.startsAt)}</p>
        )}
        {auction.endsAt && (
          <p className="text-sm text-gray-500">Ends: {formatDate(auction.endsAt)}</p>
        )}
        {auction.endedAt && (
          <p className="text-sm text-gray-500">Ended: {formatDate(auction.endedAt)}</p>
        )}
      </div>
    </Link>
  );
}
