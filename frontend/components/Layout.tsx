'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gray-900">
        {children}
      </main>
      <Footer />
    </>
  );
}
