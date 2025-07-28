'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);

  const isActive = (href: string) =>
    pathname === href ? 'underline underline-offset-4 text-black' : 'hover:text-black';

  return (
    <header className="bg-yellow-600 text-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:text-black transition">
          All4You Auctioneers
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-6 text-sm font-semibold items-center">
          <Link href="/auctions" className={isActive('/auctions')}>Auctions</Link>
          <Link href="/terms" className={isActive('/terms')}>Terms</Link>

          <div className="relative">
            <button
              onClick={() => setAccountDropdown(!accountDropdown)}
              className="hover:text-black transition focus:outline-none"
            >
              My Account ▾
            </button>
            {accountDropdown && (
              <div className="absolute right-0 bg-white text-black shadow-lg rounded-md mt-2 py-2 w-48 z-50">
                <Link href="/account/buyer" className="block px-4 py-2 hover:bg-gray-100">Buyer Invoices</Link>
                <Link href="/account/seller" className="block px-4 py-2 hover:bg-gray-100">Seller Invoices</Link>
              </div>
            )}
          </div>

          <Link href="/contact" className={isActive('/contact')}>Contact</Link>
          <Link href="/login" className={isActive('/login')}>Login</Link>
          <Link href="/register" className={isActive('/register')}>Register</Link>
          <Link href="/sell" className={isActive('/sell')}>Sell</Link>
        </nav>

        {/* HAMBURGER */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE NAV */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-6 bg-yellow-500 text-white text-base font-semibold transition-all rounded-b-2xl shadow-xl">
          <div className="flex flex-col gap-2 divide-y divide-yellow-200">
            <Link href="/auctions" className={isActive('/auctions') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'}>Auctions</Link>
            <Link href="/terms" className={isActive('/terms') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'}>Terms</Link>
            <div className="pt-3 pb-1">
              <p className="font-bold text-white mb-1 pl-1">My Account</p>
              <div className="flex flex-col gap-1 pl-3">
                <Link href="/account/buyer" className="py-2 px-2 rounded hover:bg-yellow-600 transition">Buyer Invoices</Link>
                <Link href="/account/seller" className="py-2 px-2 rounded hover:bg-yellow-600 transition">Seller Invoices</Link>
              </div>
            </div>
            <Link href="/contact" className={isActive('/contact') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'}>Contact</Link>
            <Link href="/login" className={isActive('/login') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'}>Login</Link>
            <Link href="/register" className={isActive('/register') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'}>Register</Link>
            <Link href="/sell" className={isActive('/sell') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'}>Sell</Link>
          </div>
        </div>
      )}
    </header>
  );
}
