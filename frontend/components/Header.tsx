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
  const [userEmail, setUserEmail] = useState('');

  const isActive = (path: string) => pathname === path ? 'bg-gray-100 text-blue-600 font-medium' : '';

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    
    if (email && token) {
      setIsLoggedIn(true);
      setUserEmail(email);
      
      // Check if user is admin
      fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setAccountDropdown(false);
      setMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Notification />
      <AddToHomeScreenPrompt />
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-800 hover:text-yellow-600 transition-colors duration-200">
            <img
              src="/logo.png.png"
              alt="All4You Auctioneers Logo"
              className="h-10 w-10 object-contain rounded-lg shadow-sm"
              style={{ maxWidth: 40, maxHeight: 40 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center shadow-sm hidden">
              <span className="text-xl"></span>
            </div>
            <span className="text-gray-800">
              All4You Auctioneers
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Public Links */}
            <Link href="/terms" className={`${isActive('/terms')} px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
              Terms
            </Link>
            <Link href="/contact" className={`${isActive('/contact')} px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
              Contact
            </Link>
            
            {/* Logged-in User Links */}
            {isLoggedIn && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                
                <Link href="/auctions" className={`${isActive('/auctions')} px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 font-medium`}>
                  Auctions
                </Link>
                <Link href="/auctions/past" className={`${isActive('/auctions/past')} px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                  Past Auctions
                </Link>
                <Link href="/watchlist" className={`${isActive('/watchlist')} px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                  Watchlist
                </Link>

                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                <div className="relative" onClick={handleDropdownClick}>
                  <button
                    onClick={() => setAccountDropdown(!accountDropdown)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 font-medium"
                  >
                    Invoices <span className="text-xs"></span>
                  </button>
                  {accountDropdown && (
                    <div className="absolute right-0 bg-white shadow-xl rounded-lg mt-2 py-2 w-56 z-50 border border-gray-200">
                      <Link
                        href="/account/buyer"
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-gray-700 hover:text-blue-600"
                        onClick={() => setAccountDropdown(false)}
                      >
                        Buyer Invoices
                      </Link>
                      <Link
                        href="/account/seller"
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
                        onClick={() => setAccountDropdown(false)}
                      >
                        Seller Invoices
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/sell" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Sell Item
                </Link>
              </>
            )}

            {/* Admin links - only for admins */}
            {isAdmin && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <Link href="/admin/dashboard" className={`${isActive('/admin/dashboard')} px-4 py-2 rounded-lg text-purple-600 hover:text-purple-900 hover:bg-purple-50 transition-all duration-200 font-medium`}>
                  Admin
                </Link>
              </>
            )}

            {/* Authentication links */}
            {!isLoggedIn ? (
              <>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <Link href="/login" className={`${isActive('/login')} px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900`}>
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                  Register
                </Link>
              </>
            ) : (
              <button 
                onClick={() => {
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('token');
                  localStorage.removeItem('isAdmin');
                  setIsLoggedIn(false);
                  setIsAdmin(false);
                  setUserEmail('');
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center">
              <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ${menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
              <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ${menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
            </div>
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-6 py-4 space-y-2">
              {/* Public Links */}
              <Link href="/terms" className={`${isActive('/terms')} block px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                Terms
              </Link>
              <Link href="/contact" className={`${isActive('/contact')} block px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                Contact
              </Link>
              
              {/* Logged-in User Links */}
              {isLoggedIn && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link href="/auctions" className={`${isActive('/auctions')} block px-4 py-3 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 font-medium`}>
                    Auctions
                  </Link>
                  <Link href="/auctions/past" className={`${isActive('/auctions/past')} block px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                    Past Auctions
                  </Link>
                  <Link href="/watchlist" className={`${isActive('/watchlist')} block px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                    Watchlist
                  </Link>
                  <Link href="/account/buyer" className={`${isActive('/account/buyer')} block px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                    Buyer Invoices
                  </Link>
                  <Link href="/account/seller" className={`${isActive('/account/seller')} block px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`}>
                    Seller Invoices
                  </Link>
                  <Link href="/sell" className="block px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 text-white font-medium text-center">
                    Sell Item
                  </Link>
                </>
              )}

              {/* Admin links - only for admins */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link href="/admin/dashboard" className={`${isActive('/admin/dashboard')} block px-4 py-3 rounded-lg text-purple-600 hover:text-purple-900 hover:bg-purple-50 transition-all duration-200 font-medium`}>
                    Admin Dashboard
                  </Link>
                </>
              )}

              {/* Authentication links */}
              <div className="border-t border-gray-200 my-2"></div>
              {!isLoggedIn ? (
                <>
                  <Link href="/login" className={`${isActive('/login')} block px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900 text-center`}>
                    Login
                  </Link>
                  <Link href="/register" className="block px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-200 font-medium text-center">
                    Register
                  </Link>
                </>
              ) : (
                <button 
                  onClick={() => {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('token');
                    localStorage.removeItem('isAdmin');
                    setIsLoggedIn(false);
                    setIsAdmin(false);
                    setUserEmail('');
                    window.location.href = '/';
                  }}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 text-white font-medium"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
