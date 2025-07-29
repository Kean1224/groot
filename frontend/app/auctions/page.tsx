'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Auction = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
};

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    // Simulated fetch
    const fetchedAuctions: Auction[] = [
      {
        id: '1',
        title: 'Loose Asset Auction',
        description: 'Generators, grinders, lawnmowers, tools and more.',
        imageUrl: '/auctions/assets.jpg',
      },
      {
        id: '2',
        title: 'Vehicle Auction',
        description: 'Double cabs, bakkies, cars, and non-runners available.',
        imageUrl: '/auctions/vehicles.jpg',
      },
    ];
    setAuctions(fetchedAuctions);
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-yellow-600 mb-10 text-center drop-shadow">
        Available Auctions
      </h1>

      {auctions.length === 0 ? (
        <p className="text-center text-gray-500">No auctions available right now. Please check back later.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <Link
              key={auction.id}
              href={`/auctions/${auction.id}`}
              className="card hover:shadow-xl transition rounded-xl overflow-hidden"
            >
              {auction.imageUrl && (
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <h2 className="text-xl font-bold text-yellow-700 mb-2">{auction.title}</h2>
                <p className="text-gray-600 text-sm">{auction.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
