'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-4 py-10 mt-20">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        <p className="text-sm md:text-base">
          © {new Date().getFullYear()} <span className="font-semibold">All4You Auctioneers</span>. All rights reserved.
        </p>

        {/* Optional Quick Links */}
        <div className="flex justify-center gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
          <Link href="/sell" className="hover:text-white transition">Sell With Us</Link>
        </div>

        <p className="text-xs text-gray-400">
          Built with <span className="text-pink-500">❤️</span> in South Africa
        </p>

        <p className="text-xs text-gray-500">
          Powered by Next.js, Tailwind CSS, and your hustle 💪
        </p>
      </div>
    </footer>
  );
}

