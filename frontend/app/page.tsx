"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Check for logged-in user from localStorage
    const storedEmail = localStorage.getItem('userEmail');
    const storedToken = localStorage.getItem('token');
    
    if (storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      // Extract name from email (part before @)
      setUserName(storedEmail.split('@')[0]);
    }

    // Verify with session API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, { 
      headers,
      credentials: 'include' 
    })
      .then(res => res.json())
      .then(data => {
        if (data.email) {
          setIsLoggedIn(true);
          setUserEmail(data.email);
          setUserName(data.email.split('@')[0]);
        } else if (!storedEmail) {
          setIsLoggedIn(false);
          setUserEmail('');
          setUserName('');
        }
      })
      .catch(() => {
        // If session check fails but we have stored email, assume logged in
        if (storedEmail) {
          setIsLoggedIn(true);
          setUserEmail(storedEmail);
          setUserName(storedEmail.split('@')[0]);
        }
      });
  }, []);

  return (
    <main className="min-h-screen relative bg-gradient-to-br from-yellow-50 via-white to-blue-50">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('/img/auction-background.jpg.png')",
          backgroundBlendMode: 'soft-light'
        }}
      />
      {/* Additional overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-100 to-blue-200 flex items-center justify-center shadow-xl border-4 border-white">
            <span className="text-6xl">🏛️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-blue-600 mb-4">
            All4You Auctioneers
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your trusted online auction platform - bid with confidence, sell with ease
          </p>

          {/* Welcome Message for Logged In Users */}
          {isLoggedIn && (
            <div className="bg-gradient-to-r from-green-100/90 to-blue-100/90 backdrop-blur-sm border border-green-200/50 rounded-xl p-6 mb-8 max-w-md mx-auto shadow-lg">
              <p className="text-green-800 font-semibold">
                Welcome back, <span className="font-bold">{userName}</span>! 👋
              </p>
              <p className="text-green-600 text-sm">Ready to bid on some amazing items?</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {!isLoggedIn ? (
              // Buttons for non-logged in users (keeping your preferred style)
              <>
                <Link href="/login" className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                  🔐 Login
                </Link>
                <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                  ✨ Register
                </Link>
              </>
            ) : (
              // Buttons for logged in users
              <>
                <Link href="/auctions" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                  🏛️ View Auctions
                </Link>
                <Link href="/sell" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                  💎 Sell Items
                </Link>
                <Link href="/watchlist" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                  ❤️ My Watchlist
                </Link>
              </>
            )}
          </div>

          {/* Guest View Auctions Button */}
          {!isLoggedIn && (
            <div className="mb-8">
              <Link href="/auctions" className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                👀 Browse Auctions
              </Link>
              <p className="text-sm text-gray-500 mt-2">View auctions as a guest (registration required to bid)</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow duration-200">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Live Bidding</h3>
            <p className="text-gray-600 text-center">Real-time bidding with instant updates and notifications</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow duration-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">🛡️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Secure Platform</h3>
            <p className="text-gray-600 text-center">Trusted and secure transactions with buyer protection</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Great Deals</h3>
            <p className="text-gray-600 text-center">Find amazing items at competitive prices</p>
          </div>
        </div>

        {/* Call to Action */}
        {!isLoggedIn && (
          <div className="text-center mt-12 bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">Join thousands of satisfied buyers and sellers on our platform</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                Create Account
              </Link>
              <Link href="/contact" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105">
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}