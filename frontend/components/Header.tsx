
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Notification from './Notification';
// Custom Add to Home Screen prompt for PWA
function AddToHomeScreenPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAdd = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowPrompt(false);
    }
  };

  // Only show on mobile
  if (!showPrompt || typeof window === 'undefined' || window.innerWidth > 768) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-4 animate-bounce">
      <span>Install All4You Auctioneers on your device!</span>
      <button className="bg-white text-yellow-700 font-bold px-4 py-2 rounded shadow hover:bg-yellow-100" onClick={handleAdd}>
        Add to Home Screen
      </button>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setIsAdmin(!!data.isAdmin));
  }, []);

  const isActive = (href: string) =>
    pathname === href ? 'underline underline-offset-4 text-black' : 'hover:text-black';

  return (
    <>
      <Notification />
      <AddToHomeScreenPrompt />
      <header className="bg-yellow-600 text-white shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight hover:text-black transition">
            <img
              src="/img/ChatGPT%20Image%20Jul%2028,%202025,%2011_14_52%20PM.png"
              alt="Logo"
              className="h-10 w-10 object-contain rounded-full bg-white shadow"
              style={{ maxWidth: 40, maxHeight: 40 }}
            />
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
                  <Link
                    href="/account/buyer"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setAccountDropdown(false)}
                  >
                    Buyer Invoices
                  </Link>
                  <Link
                    href="/account/seller"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setAccountDropdown(false)}
                  >
                    Seller Invoices
                  </Link>
                </div>
              )}
            </div>

            <Link href="/contact" className={isActive('/contact')}>Contact</Link>
            <Link href="/my-auctions/invoices" className={isActive('/my-auctions/invoices')}>My Auctions</Link>
            {isAdmin && (
              <>
                <Link href="/admin/inbox" className={isActive('/admin/inbox')}>Admin Inbox</Link>
                <Link href="/admin/refunds" className={isActive('/admin/refunds')}>Refunds</Link>
              </>
            )}
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
              <Link href="/auctions" className={isActive('/auctions') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>Auctions</Link>
              <Link href="/terms" className={isActive('/terms') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>Terms</Link>
              <div className="pt-3 pb-1">
                <p className="font-bold text-white mb-1 pl-1">My Account</p>
                <div className="flex flex-col gap-1 pl-3">
                  <Link href="/account/buyer" className="py-2 px-2 rounded hover:bg-yellow-600 transition" onClick={() => setMenuOpen(false)}>Buyer Invoices</Link>
                  <Link href="/account/seller" className="py-2 px-2 rounded hover:bg-yellow-600 transition" onClick={() => setMenuOpen(false)}>Seller Invoices</Link>
                </div>
              </div>
              <Link href="/contact" className={isActive('/contact') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>Contact</Link>
              <Link href="/my-auctions/invoices" className={isActive('/my-auctions/invoices') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>My Auctions</Link>
              {isAdmin && (
                <Link href="/admin/inbox" className={isActive('/admin/inbox') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>Admin Inbox</Link>
              )}
              <Link href="/login" className={isActive('/login') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className={isActive('/register') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>Register</Link>
              <Link href="/sell" className={isActive('/sell') + ' py-3 px-2 rounded-lg hover:bg-yellow-600 transition'} onClick={() => setMenuOpen(false)}>Sell</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
