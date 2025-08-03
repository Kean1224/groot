
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Check for logged-in user from localStorage first
    const storedEmail = localStorage.getItem('userEmail');
    const storedToken = localStorage.getItem('token');
    
    console.log('Header: Checking login state', { storedEmail, hasToken: !!storedToken });
    
    if (storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      console.log('Header: User logged in from localStorage', storedEmail);
    }

    // Then verify with session API
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
        console.log('Header: Session API response', data);
        if (data.email) {
          setIsLoggedIn(true);
          setUserEmail(data.email);
          setIsAdmin(!!data.isAdmin);
        } else {
          // If no session and no stored email, user is logged out
          if (!storedEmail) {
            setIsLoggedIn(false);
            setUserEmail('');
          }
        }
      })
      .catch((error) => {
        console.log('Header: Session API error', error);
        // If session check fails but we have stored email, assume logged in
        if (storedEmail) {
          setIsLoggedIn(true);
          setUserEmail(storedEmail);
        }
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setAccountDropdown(false);
      }
    };

    if (accountDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [accountDropdown]);

  const isActive = (href: string) =>
    pathname === href ? 'bg-white/30 text-white font-bold' : 'text-white/90 hover:text-white';

  return (
    <>
      <Notification />
      <AddToHomeScreenPrompt />
      <header className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 text-white shadow-lg border-b-2 border-yellow-400 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tight hover:text-white transition-all duration-300 hover:scale-105">
            <img
              src="/logo.png.png"
              alt="All4You Auctioneers Logo"
              className="h-12 w-12 object-contain rounded-full bg-white/10 backdrop-blur-sm shadow-lg ring-2 ring-white/30 hover:ring-white/50 transition-all duration-300"
              style={{ maxWidth: 48, maxHeight: 48 }}
              onError={(e) => {
                // Fallback to emoji if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30 hidden">
              <span className="text-2xl">🏛️</span>
            </div>
            <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent drop-shadow-lg">
              All4You Auctioneers
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex gap-8 text-sm font-semibold items-center">
            <Link href="/terms" className={`${isActive('/terms')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
              📋 Terms
            </Link>
            <Link href="/contact" className={`${isActive('/contact')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
              📞 Contact
            </Link>
            
            {/* Show these only for logged-in users */}
            {isLoggedIn && (
              <>
                <Link href="/auctions" className={`${isActive('/auctions')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
                  🏛️ Auctions
                </Link>
                <Link href="/auctions/past" className={`${isActive('/auctions/past')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
                  📜 Past Auctions
                </Link>
                <Link href="/watchlist" className={`${isActive('/watchlist')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
                  ❤️ Watchlist
                </Link>

                <div className="relative dropdown-container">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAccountDropdown(!accountDropdown);
                    }}
                    className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600 rounded-full transition-all duration-200 hover:scale-105 font-bold shadow-md text-white focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center gap-2"
                    type="button"
                    aria-expanded={accountDropdown}
                    aria-haspopup="true"
                  >
                    📄 Invoices <span className={`text-xs transform transition-transform duration-200 ${accountDropdown ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {accountDropdown && (
                    <div className="absolute right-0 bg-white text-gray-800 shadow-xl rounded-lg mt-2 py-2 w-56 z-[60] border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-200">
                      <Link
                        href="/account/buyer"
                        className="block px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 text-sm"
                        onClick={() => setAccountDropdown(false)}
                      >
                        🛒 Buyer Invoices
                      </Link>
                      <Link
                        href="/account/seller"
                        className="block px-4 py-3 hover:bg-blue-50 transition-colors text-sm"
                        onClick={() => setAccountDropdown(false)}
                      >
                        💰 Seller Invoices
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/my-auctions/invoices" className={`${isActive('/my-auctions/invoices')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
                  📊 My Auctions
                </Link>
                <Link href="/sell" className={`${isActive('/sell')} px-4 py-2 bg-green-500/80 hover:bg-green-600 rounded-full transition-all duration-200 hover:scale-105 font-bold shadow-md text-white`}>
                  💎 Sell Item
                </Link>
              </>
            )}

            {/* Admin links - only for admins */}
            {isAdmin && (
              <>
                <Link href="/admin/inbox" className={`${isActive('/admin/inbox')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
                  🔧 Admin Inbox
                </Link>
                <Link href="/admin/refunds" className={`${isActive('/admin/refunds')} px-3 py-2 rounded-full transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-sm`}>
                  💸 Refunds
                </Link>
              </>
            )}

            {/* Authentication links */}
            {!isLoggedIn ? (
              <>
                <Link href="/login" className={`${isActive('/login')} px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-white/30 hover:scale-105`}>
                  🔐 Login
                </Link>
                <Link href="/register" className={`${isActive('/register')} px-4 py-2 bg-white text-yellow-600 rounded-full transition-all duration-200 hover:bg-yellow-50 hover:scale-105 font-bold shadow-md`}>
                  ✨ Register
                </Link>
              </>
            ) : (
              <button 
                onClick={() => {
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                  setUserEmail('');
                  setIsAdmin(false);
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-red-500/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-red-600 hover:scale-105 font-semibold shadow-md"
              >
                🚪 Logout
              </button>
            )}
          </nav>

          {/* HAMBURGER */}
          <button
            className="md:hidden text-white text-2xl focus:outline-none transition-all duration-200 hover:scale-110 hover:bg-white/20 rounded-full p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* MOBILE NAV */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-6 bg-gradient-to-b from-yellow-500 to-orange-500 text-white text-base font-semibold transition-all rounded-b-2xl shadow-2xl border-t border-yellow-400/50">
            
            <div className="flex flex-col gap-1 pt-4">
              <Link href="/terms" className={`${isActive('/terms')} py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-3`} onClick={() => setMenuOpen(false)}>
                📋 <span>Terms</span>
              </Link>
              <Link href="/contact" className={`${isActive('/contact')} py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-3`} onClick={() => setMenuOpen(false)}>
                📞 <span>Contact</span>
              </Link>
              
              {/* Show these only for logged-in users */}
              {isLoggedIn && (
                <>
                  <Link href="/auctions" className={`${isActive('/auctions')} py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-3`} onClick={() => setMenuOpen(false)}>
                    🏛️ <span>Auctions</span>
                  </Link>
                  <Link href="/auctions/past" className={`${isActive('/auctions/past')} py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-3`} onClick={() => setMenuOpen(false)}>
                    📜 <span>Past Auctions</span>
                  </Link>
                  <Link href="/watchlist" className={`${isActive('/watchlist')} py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-3`} onClick={() => setMenuOpen(false)}>
                    ❤️ <span>Watchlist</span>
                  </Link>
                  
                  <div className="bg-blue-500/20 rounded-xl p-3 my-2 border border-blue-400/30">
                    <p className="font-bold text-white mb-2 text-center">� My Invoices</p>
                    <div className="flex flex-col gap-1">
                      <Link href="/account/buyer" className="py-2 px-3 rounded-lg hover:bg-blue-400/30 transition-all duration-200 flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                        🛒 <span>Buyer Invoices</span>
                      </Link>
                      <Link href="/account/seller" className="py-2 px-3 rounded-lg hover:bg-blue-400/30 transition-all duration-200 flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                        💰 <span>Seller Invoices</span>
                      </Link>
                    </div>
                  </div>
                  
                  <Link href="/my-auctions/invoices" className={`${isActive('/my-auctions/invoices')} py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-3`} onClick={() => setMenuOpen(false)}>
                    📊 <span>My Auctions</span>
                  </Link>
                  
                  {/* Sell Item Button - Enhanced prominence */}
                  <Link href="/sell" className={`${isActive('/sell')} py-3 px-4 bg-green-500/90 hover:bg-green-600 rounded-xl transition-all duration-200 hover:scale-105 font-bold shadow-lg text-white flex items-center gap-3 border-2 border-green-400`} onClick={() => setMenuOpen(false)}>
                    💎 <span>Sell Item</span>
                  </Link>
                </>
              )}

              {/* Admin links - only for admins */}
              {isAdmin && (
                <Link href="/admin/inbox" className={`${isActive('/admin/inbox')} py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-3`} onClick={() => setMenuOpen(false)}>
                  🔧 <span>Admin Inbox</span>
                </Link>
              )}

              {/* Authentication links */}
              {!isLoggedIn ? (
                <div className="border-t border-white/20 pt-4 mt-4 flex flex-col gap-2">
                  <Link href="/login" className={`${isActive('/login')} py-3 px-4 bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 hover:bg-white/30 flex items-center gap-3 justify-center`} onClick={() => setMenuOpen(false)}>
                    🔐 <span>Login</span>
                  </Link>
                  <Link href="/register" className={`${isActive('/register')} py-3 px-4 bg-white text-yellow-600 rounded-xl transition-all duration-200 hover:bg-yellow-50 font-bold shadow-md flex items-center gap-3 justify-center`} onClick={() => setMenuOpen(false)}>
                    ✨ <span>Register</span>
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                    setUserEmail('');
                    setIsAdmin(false);
                    setMenuOpen(false);
                    window.location.href = '/';
                  }}
                  className="mt-4 py-3 px-4 bg-red-500/80 backdrop-blur-sm rounded-xl transition-all duration-200 hover:bg-red-600 font-semibold shadow-md flex items-center gap-3 justify-center border-t border-white/20 pt-4"
                >
                  🚪 <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
