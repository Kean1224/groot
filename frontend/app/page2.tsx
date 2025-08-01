"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to All4You Auctioneers
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your trusted auction platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg">
              Login
            </Link>
            <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
