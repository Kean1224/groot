'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-2 py-10">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-200 p-8 sm:p-14 flex flex-col items-center text-center relative">
        {/* Hero Image */}
        <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-100 to-blue-200 flex items-center justify-center shadow-lg border-4 border-white mx-auto">
          <span className="text-6xl">🔨</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-yellow-600 drop-shadow-lg tracking-tight">
          Welcome to <span className="text-blue-700">All4You Auctioneers</span>
        </h1>
        <p className="max-w-xl mb-10 text-gray-600 text-lg font-medium">
          Your trusted online auction house for <span className="text-yellow-700 font-semibold">vehicles</span>, <span className="text-blue-700 font-semibold">tools</span>, <span className="text-yellow-700 font-semibold">machinery</span>, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/auctions" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 font-bold rounded-xl shadow-xl transition-all duration-200 text-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none">
              🔨 View Auctions
            </button>
          </Link>
          <Link href="/terms" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto border-2 border-yellow-500 text-yellow-700 px-8 py-3 font-bold rounded-xl hover:bg-yellow-100 transition-all duration-200 text-lg focus:ring-2 focus:ring-yellow-200 focus:outline-none">
              📜 Terms & Conditions
            </button>
          </Link>
        </div>

        {/* Decorative bottom accent */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-4 bg-gradient-to-r from-yellow-300 via-yellow-100 to-blue-200 rounded-full blur-sm opacity-60"></div>
      </div>
    </main>
  );
}

