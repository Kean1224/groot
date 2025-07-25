'use client';

import React, { useEffect, useState } from 'react';

type Lot = {
  id: string;
  title: string;
  description: string;
  image?: string;
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [userEmail, setUserEmail] = useState('');

  // ✅ Simulate login context (replace with real logic later)
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) setUserEmail(email);
  }, []);

  // ✅ Load watchlist
  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://localhost:5000/api/users/${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data.watchlist) setWatchlist(data.watchlist);
      });
  }, [userEmail]);

  // ✅ Load all lots
  useEffect(() => {
    fetch('http://localhost:5000/api/lots')
      .then(res => res.json())
      .then(data => setLots(data));
  }, []);

  const watchedLots = lots.filter(lot => watchlist.includes(lot.id));

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">🕵️ Your Watchlist</h1>

      {watchedLots.length === 0 ? (
        <p className="text-center text-gray-500">You have no items in your watchlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {watchedLots.map(lot => (
            <div key={lot.id} className="bg-white rounded shadow p-4">
              {lot.image && (
                <img
                  src={`http://localhost:5000/uploads/${lot.image}`}
                  alt={lot.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <h2 className="text-xl font-bold">{lot.title}</h2>
              <p className="text-sm text-gray-600 line-clamp-3">{lot.description}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
