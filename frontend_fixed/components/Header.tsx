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
        <div className="md:hidden px-4 pb-4 space-y-2 bg-yellow-500 text-white text-sm font-semibold transition-all">
          <Link href="/auctions" className={isActive('/auctions')}>Auctions</Link>
          <Link href="/terms" className={isActive('/terms')}>Terms</Link>
          <div>
            <p className="py-2">My Account</p>
            <Link href="/account/buyer" className="block pl-4 hover:text-black">Buyer Invoices</Link>
            <Link href="/account/seller" className="block pl-4 hover:text-black">Seller Invoices</Link>
          </div>
          <Link href="/contact" className={isActive('/contact')}>Contact</Link>
          <Link href="/login" className={isActive('/login')}>Login</Link>
          <Link href="/register" className={isActive('/register')}>Register</Link>
          <Link href="/sell" className={isActive('/sell')}>Sell</Link>
        </div>
      )}
    </header>
  );
}
