'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Auction = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
};

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`);
        if (response.ok) {
          const data = await response.json();
          setAuctions(data);
        } else {
          console.error('Failed to fetch auctions:', response.status);
        }
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-yellow-600 mb-10 text-center drop-shadow">
        Available Auctions
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading auctions...</p>
      ) : auctions.length === 0 ? (
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
                <p className="text-gray-600 text-sm mb-2">{auction.description || 'No description available'}</p>
                {auction.location && (
                  <p className="text-gray-500 text-xs mb-1">📍 {auction.location}</p>
                )}
                {auction.startTime && auction.endTime && (
                  <div className="text-gray-500 text-xs">
                    <p>🕒 Starts: {new Date(auction.startTime).toLocaleDateString()}</p>
                    <p>🏁 Ends: {new Date(auction.endTime).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
