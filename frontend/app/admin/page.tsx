'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    auctions: 0,
    lots: 0,
    offers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [users, auctions, offers] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/sell-item`).then(res => res.json())
    ]);

    const lots = auctions.reduce((acc: number, auction: any) => acc + (auction.lots?.length || 0), 0);

    setStats({
      users: users.length,
      auctions: auctions.length,
      lots,
      offers: offers.length
    });
  };

  const tiles = [
    { label: 'Users', value: stats.users, link: '/admin/users' },
    { label: 'Auctions', value: stats.auctions, link: '/admin/auctions' },
    { label: 'Lots', value: stats.lots, link: '/admin/lots' },
    { label: 'Sell Offers', value: stats.offers, link: '/admin/offers' },
    { label: 'Invoices', value: '-', link: '/admin/invoices' }
  ];

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-yellow-600 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tiles.map(tile => (
          <Link key={tile.label} href={tile.link}>
            <div className="bg-white border shadow hover:shadow-lg p-6 rounded-lg transition-all cursor-pointer">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{tile.label}</h2>
              <p className="text-3xl font-bold text-yellow-600">{tile.value}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
