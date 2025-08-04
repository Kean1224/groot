// --- Imports ---
'use client';
import React from 'react';

// --- Timer Component ---
function LotTimer({ endTime, lotNumber }: { endTime: string; lotNumber: number }) {
  const [timeLeft, setTimeLeft] = React.useState<string>('');
  const [isExpired, setIsExpired] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft('ENDED');
        setIsExpired(true);
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const getTimerStyle = () => {
    if (isExpired) return 'bg-red-500 text-white';
    
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;
    const minutes = Math.floor(difference / (1000 * 60));
    
    if (minutes <= 5) return 'bg-red-100 text-red-800 animate-pulse border-2 border-red-300';
    if (minutes <= 30) return 'bg-orange-100 text-orange-800';
    if (minutes <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className={`px-3 py-2 rounded-lg font-mono text-sm font-bold ${getTimerStyle()}`}>
      <div className="text-xs opacity-75 mb-1">LOT #{lotNumber} ENDS IN:</div>
      <div className="text-base">
        {isExpired ? '⏰ AUCTION ENDED' : `🕒 ${timeLeft}`}
      </div>
    </div>
  );
}

// --- Image Modal Component ---
function ImageModal({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  lotTitle, 
  onNavigate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  images: string[]; 
  currentIndex: number; 
  lotTitle: string;
  onNavigate: (direction: 'prev' | 'next') => void;
}) {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [zoomPosition, setZoomPosition] = React.useState({ x: 50, y: 50 });

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (images.length > 1) onNavigate('prev');
          break;
        case 'ArrowRight':
          if (images.length > 1) onNavigate('next');
          break;
        case 'z':
        case 'Z':
          setIsZoomed(!isZoomed);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onNavigate, images.length, isZoomed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-60 transition-all"
        title="Close (ESC)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => onNavigate('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-60 transition-all"
            title="Previous image (←)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-60 transition-all"
            title="Next image (→)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Zoom Toggle */}
      <button
        onClick={() => setIsZoomed(!isZoomed)}
        className={`absolute top-4 left-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-60 transition-all ${isZoomed ? 'bg-blue-600' : ''}`}
        title={isZoomed ? "Zoom out (Z)" : "Zoom in (Z)"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>

      {/* Image Container */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg shadow-2xl">
          <img
            src={images[currentIndex]}
            alt={`${lotTitle} - Image ${currentIndex + 1}`}
            className={`max-w-full max-h-[80vh] object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-200 cursor-move' : 'cursor-zoom-in'
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(2)',
                  }
                : undefined
            }
            onMouseMove={handleMouseMove}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>

        {/* Image Info */}
        <div className="mt-4 text-center text-white">
          <h3 className="text-xl font-bold mb-2">{lotTitle}</h3>
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm opacity-75">
                Image {currentIndex + 1} of {images.length}
              </span>
              <div className="flex gap-1">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-white/60 text-sm">
          <div className="flex flex-wrap justify-center gap-4">
            <span>ESC: Close</span>
            {images.length > 1 && <span>← →: Navigate</span>}
            <span>Z: Toggle Zoom</span>
            <span>Click: {isZoomed ? 'Zoom Out' : 'Zoom In'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Types (add more as needed) ---
type BidEntry = {
  bidderEmail: string;
  amount: number;
  time: string;
};

type Lot = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  image?: string; // Backend stores single image as 'image'
  images?: string[]; // Support for multiple images
  currentBid: number;
  status: string;
  bidHistory?: BidEntry[];
  bidIncrement?: number;
  sellerEmail?: string;
  endTime?: string;
  lotNumber?: number;
};

// --- Main Component ---
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BidNotifications from '../../components/BidNotifications';
import QuickBidButtons from '../../components/QuickBidButtons';
import FloatingActionButton from '../../components/FloatingActionButton';
import { LotCardSkeleton, AuctionHeaderSkeleton } from '../../components/SkeletonLoaders';

interface BidNotification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'outbid' | 'win';
  timestamp: number;
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = params?.auctionId as string;
  // --- State ---
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [auctionTitle, setAuctionTitle] = useState('Auction Title');
  const [auctionEnd, setAuctionEnd] = useState(Date.now() + 1000 * 60 * 60);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [depositStatus, setDepositStatus] = useState('not_paid');
  const [depositLoading, setDepositLoading] = useState(false);
  const [isAdmin] = useState(false);
  // Admin FICA review state
  const [ficaList, setFicaList] = useState<any[]>([]);
  const [ficaListLoading, setFicaListLoading] = useState(false);
  // Admin pending user registration state
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingUsersLoading, setPendingUsersLoading] = useState(false);

  // Fetch auction data
  useEffect(() => {
    if (!auctionId) return;
    
    const fetchAuction = async () => {
      setPageLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`);
        if (response.ok) {
          const auctions = await response.json();
          const foundAuction = auctions.find((a: any) => a.id === auctionId);
          if (foundAuction) {
            setAuction(foundAuction);
            setAuctionTitle(foundAuction.title);
            if (foundAuction.endTime) {
              setAuctionEnd(new Date(foundAuction.endTime).getTime());
            }
            // Initialize lots from auction data
            if (foundAuction.lots) {
              setLots(foundAuction.lots);
            }
          } else {
            console.error('Auction not found:', auctionId);
            addNotification(`Auction with ID ${auctionId} not found. Available auctions: ${auctions.map((a: any) => a.id).join(', ')}`, 'warning');
            // Redirect to auctions list after 3 seconds
            setTimeout(() => {
              router.push('/auctions');
            }, 3000);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching auction:', error);
        addNotification('Failed to load auction details', 'warning');
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId]);

  // Fetch all FICA uploads for admin
  const fetchFicaList = () => {
    setFicaListLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fica`)
      .then(res => res.json())
      .then(data => setFicaList(data || []))
      .finally(() => setFicaListLoading(false));
  };
  // Fetch all pending user registrations for admin
  const fetchPendingUsers = () => {
    setPendingUsersLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pending-users`)
      .then(res => res.json())
      .then(data => setPendingUsers(data || []))
      .finally(() => setPendingUsersLoading(false));
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchFicaList();
    fetchPendingUsers();
  }, [isAdmin]);

  // Admin approve/reject handlers for FICA
  const handleApproveFica = async (email: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fica/${email}/approve`, { method: 'POST' });
    setFicaList(list => list.map(f => f.email === email ? { ...f, status: 'approved' } : f));
  };
  const handleRejectFica = async (email: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fica/${email}/reject`, { method: 'POST' });
    setFicaList(list => list.map(f => f.email === email ? { ...f, status: 'rejected' } : f));
  };
  // Admin approve/reject handlers for pending users
  const handleApproveUser = async (email: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pending-users/${email}/approve`, { method: 'POST' });
    setPendingUsers(list => list.filter(u => u.email !== email));
  };
  const handleRejectUser = async (email: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pending-users/${email}/reject`, { method: 'POST' });
    setPendingUsers(list => list.filter(u => u.email !== email));
  };
  const [lots, setLots] = useState<Lot[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [biddingLoading, setBiddingLoading] = useState<string | null>(null);
  // Auto-bidding state
  const [autoBidInputs, setAutoBidInputs] = useState<{ [lotId: string]: string }>({});
  const [autoBidLoading, setAutoBidLoading] = useState<{ [lotId: string]: boolean }>({});
  const [autoBidStatus, setAutoBidStatus] = useState<{ [lotId: string]: number | null }>({});
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [lotId: string]: number }>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [lotId: string]: boolean }>({});
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  // Image modal state
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    lotTitle: string;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    lotTitle: ''
  });
  
  // Notification system
  const [notifications, setNotifications] = useState<BidNotification[]>([]);
  
  // Enhanced loading states
  const [pageLoading, setPageLoading] = useState(true);
  
  const addNotification = (message: string, type: 'success' | 'warning' | 'outbid' | 'win') => {
    const notification: BidNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, notification]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // FICA logic
  const [ficaStatus, setFicaStatus] = useState<'not_uploaded' | 'pending' | 'approved' | 'rejected'>('not_uploaded');

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Get current user session
  useEffect(() => {
    // First try to get email from localStorage as fallback
    const storedEmail = localStorage.getItem('userEmail');
    const storedToken = localStorage.getItem('token');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
    
    // Then try to get from session API with token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add Authorization header if token exists
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
          setUserEmail(data.email);
          localStorage.setItem('userEmail', data.email);
        }
      })
      .catch((error) => {
        // Session fetch failed - use stored email if available
      });
  }, []);
  // Fetch FICA status for current user
  useEffect(() => {
    if (!userEmail) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fica/${userEmail}`)
      .then(res => res.json())
      .then(data => setFicaStatus(data.status || 'not_uploaded'))
      .catch(() => setFicaStatus('not_uploaded'));
  }, [userEmail]);

  // Timer useEffect - only runs on client to prevent hydration mismatch
  useEffect(() => {
    // Set initial time on client
    setCurrentTime(Date.now());
    
    // Update timer every second
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const [buyerEmails] = useState<string[]>([]);
  const [sellerEmails] = useState<string[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [lotsPerPage, setLotsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil((lots?.length || 0) / lotsPerPage);
  const startIndex = (currentPage - 1) * lotsPerPage;
  const currentLots = lots?.slice(startIndex, startIndex + lotsPerPage) || [];

  // Fetch auction details
  useEffect(() => {
    if (!auctionId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((a: any) => a.id === auctionId);
        if (found) {
          setAuction(found);
          setAuctionTitle(found.title);
          setAuctionEnd(new Date(found.endTime).getTime());
        }
      });
  }, [auctionId]);

  // Check registration status
  useEffect(() => {
    if (!auctionId || !userEmail) return;
    fetch(`/api/auctions/${auctionId}/is-registered?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => setIsRegistered(!!data.registered))
      .catch(() => setIsRegistered(false));
  }, [auctionId, userEmail]);

  const handleRegister = async () => {
    setRegisterLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${auctionId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) {
        setIsRegistered(true);
        alert('You have successfully registered!');
      } else {
        alert('Registration failed.');
      }
    } catch {
      alert('Registration failed.');
    }
    setRegisterLoading(false);
  };

  // Fetch deposit status
  useEffect(() => {
    if (!auctionId || !userEmail) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deposits/${auctionId}/${userEmail}`)
      .then(res => res.json())
      .then(data => setDepositStatus(data.status || 'not_paid'));
  }, [auctionId, userEmail]);

  // --- Poll lots every 3 seconds ---
  useEffect(() => {
    if (!auctionId) return;
    const fetchLots = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${auctionId}/lots`);
        if (res.ok) {
          const data = await res.json();
          setLots(data.lots || []);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchLots();
    const interval = setInterval(fetchLots, 3000);
    return () => clearInterval(interval);
  }, [auctionId]);

  // Fetch auto-bid status for all lots when user email is available
  useEffect(() => {
    if (!auctionId || !userEmail || lots.length === 0) return;
    
    const fetchAutoBidStatus = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch auto-bid status for each lot
      for (const lot of lots) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${auctionId}/${lot.id}/autobid/${encodeURIComponent(userEmail)}`, {
            headers
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.maxBid) {
              setAutoBidStatus(prev => ({ ...prev, [lot.id]: data.maxBid }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch auto-bid status for lot:', lot.id, error);
        }
      }
    };

    fetchAutoBidStatus();
  }, [auctionId, userEmail, lots.length]);

  // Load existing auto-bid status for user
  useEffect(() => {
    if (!auctionId || !userEmail || lots.length === 0) return;
    
    const loadAutoBidStatus = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      for (const lot of lots) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/lots/${auctionId}/${lot.id}/autobid/${encodeURIComponent(userEmail)}`,
            { headers }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.maxBid) {
              setAutoBidStatus(prev => ({ ...prev, [lot.id]: data.maxBid }));
            }
          }
        } catch (error) {
          console.error('Failed to load auto-bid status:', error);
        }
      }
    };

    loadAutoBidStatus();
  }, [auctionId, userEmail, lots.length]);

  // --- Handlers ---
  const handleDepositRequest = async () => {
    if (!auctionId || !userEmail) {
      alert(`Missing auction ID or user email. AuctionID: ${auctionId}, UserEmail: ${userEmail}. Please refresh and try again.`);
      return;
    }
    setDepositLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deposits/${auctionId}/${encodeURIComponent(userEmail)}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setDepositStatus('pending');
      alert('Please pay the deposit to the provided banking details. Your payment will be reviewed by admin.');
    } catch (error) {
      alert(`Failed to submit deposit request: ${error.message}`);
    } finally {
      setDepositLoading(false);
    }
  };
  const handleDownloadInvoice = (email?: string, type: 'buyer' | 'seller' = 'buyer') => {};
  const handlePageChange = (dir: 'next' | 'prev') => {
    if (dir === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (dir === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const toggleDescription = (lotId: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [lotId]: !prev[lotId] }));
  };
  
  const toggleWatchlist = (lotId: string) => {
    setWatchlist(prev => 
      prev.includes(lotId) 
        ? prev.filter(id => id !== lotId)
        : [...prev, lotId]
    );
  };

  // Image modal functions
  const openImageModal = (images: string[], currentIndex: number, lotTitle: string) => {
    setImageModal({
      isOpen: true,
      images,
      currentIndex,
      lotTitle
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      images: [],
      currentIndex: 0,
      lotTitle: ''
    });
  };

  const navigateModalImage = (direction: 'prev' | 'next') => {
    setImageModal(prev => {
      const newIndex = direction === 'next' 
        ? (prev.currentIndex + 1) % prev.images.length
        : (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      
      return { ...prev, currentIndex: newIndex };
    });
  };
  
  const handlePlaceBid = async (lotId: string, currentBid: number, increment: number) => {
    if (!userEmail) {
      addNotification('Please log in to place a bid', 'warning');
      return;
    }
    
    if (!auctionId) {
      addNotification('Auction ID not found', 'warning');
      return;
    }
    
    setBiddingLoading(lotId);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${auctionId}/${lotId}/bid`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          bidderEmail: userEmail 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'You are already the highest bidder') {
          addNotification('You are already the highest bidder on this lot', 'warning');
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      
      // Automatically add to watchlist when bid is placed
      const wasAlreadyWatchlisted = watchlist.includes(lotId);
      if (!wasAlreadyWatchlisted) {
        setWatchlist(prev => [...prev, lotId]);
      }
      
      // Add success notification
      const watchlistMessage = !wasAlreadyWatchlisted ? ' Added to watchlist!' : '';
      addNotification(`Bid placed successfully! New bid: R${data.currentBid || currentBid + increment}${watchlistMessage}`, 'success');
      
      // Refresh lots to show updated bid
      const lotsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${auctionId}/lots`);
      if (lotsResponse.ok) {
        const lotsData = await lotsResponse.json();
        setLots(lotsData.lots || []);
      }
      
    } catch (error) {
      addNotification(`Failed to place bid: ${error.message}`, 'warning');
    } finally {
      setBiddingLoading(null);
    }
  };
  
  // Enhanced quick bid handler
  const handleQuickBid = async (lotId: string, bidAmount: number) => {
    if (!userEmail) {
      addNotification('Please log in to place a bid', 'warning');
      return;
    }
    
    setBiddingLoading(lotId);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use the new quickbid endpoint for direct bid amounts
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${auctionId}/${lotId}/quickbid`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          bidderEmail: userEmail,
          bidAmount: bidAmount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'You are already the highest bidder') {
          addNotification('You are already the highest bidder on this lot', 'warning');
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      
      // Automatically add to watchlist when bid is placed
      const wasAlreadyWatchlisted = watchlist.includes(lotId);
      if (!wasAlreadyWatchlisted) {
        setWatchlist(prev => [...prev, lotId]);
      }
      
      const watchlistMessage = !wasAlreadyWatchlisted ? ' Added to watchlist!' : '';
      addNotification(`🚀 Quick bid successful! New bid: R${data.currentBid || bidAmount}${watchlistMessage}`, 'success');
      
      // Refresh lots
      const lotsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${auctionId}/lots`);
      if (lotsResponse.ok) {
        const lotsData = await lotsResponse.json();
        setLots(lotsData.lots || []);
      }
      
    } catch (error) {
      addNotification(`Quick bid failed: ${error.message}`, 'warning');
    } finally {
      setBiddingLoading(null);
    }
  };
  
  const handleSetAutoBid = async (lotId: string) => {
    const maxBidStr = autoBidInputs[lotId];
    if (!maxBidStr || !userEmail) {
      addNotification('Please enter a valid max bid amount', 'warning');
      return;
    }
    
    const maxBid = parseFloat(maxBidStr);
    if (isNaN(maxBid) || maxBid <= 0) {
      addNotification('Please enter a valid max bid amount', 'warning');
      return;
    }
    
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;
    
    if (maxBid <= lot.currentBid) {
      addNotification(`Max bid must be higher than current bid of R${lot.currentBid}`, 'warning');
      return;
    }
    
    setAutoBidLoading(prev => ({ ...prev, [lotId]: true }));
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${auctionId}/${lotId}/autobid`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          bidderEmail: userEmail,
          maxBid 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setAutoBidStatus(prev => ({ ...prev, [lotId]: data.maxBid }));
      setAutoBidInputs(prev => ({ ...prev, [lotId]: '' })); // Clear input
      
      // Automatically add to watchlist when auto-bid is set
      const wasAlreadyWatchlisted = watchlist.includes(lotId);
      if (!wasAlreadyWatchlisted) {
        setWatchlist(prev => [...prev, lotId]);
      }
      
      const watchlistMessage = !wasAlreadyWatchlisted ? ' Added to watchlist!' : '';
      addNotification(`🤖 Auto-bid set for R${data.maxBid}! System will bid automatically when others bid against you.${watchlistMessage}`, 'success');
    } catch (error) {
      addNotification(`Failed to set auto-bid: ${error.message}`, 'warning');
    } finally {
      setAutoBidLoading(prev => ({ ...prev, [lotId]: false }));
    }
  };

  // Helper function to get highest bidder for a lot
  const getHighestBidder = (lot: Lot): string | null => {
    if (!lot.bidHistory || lot.bidHistory.length === 0) return null;
    return lot.bidHistory[lot.bidHistory.length - 1].bidderEmail;
  };

  // Helper function to check if user is highest bidder
  const isUserHighestBidder = (lot: Lot): boolean => {
    const highestBidder = getHighestBidder(lot);
    return highestBidder === userEmail;
  };

  // Helper function to navigate images
  const navigateImage = (lotId: string, direction: 'prev' | 'next', images: string[]) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[lotId] || 0;
      let newIndex;
      if (direction === 'next') {
        newIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
      }
      return { ...prev, [lotId]: newIndex };
    });
  };

  // --- Helper ---
  function formatTimeLeft(ms: number) {
    if (ms <= 0) return 'Ended';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // --- Render ---
  return (
    <main className="min-h-screen px-2 py-10 sm:px-6 bg-gradient-to-br from-yellow-200 via-white to-blue-200 flex justify-center items-start">
      {/* Bid Notifications */}
      <BidNotifications 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        userEmail={userEmail} 
        currentPage="auction" 
      />

      {pageLoading ? (
        <div className="w-full max-w-5xl">
          <AuctionHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <LotCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-200 p-0 sm:p-0 flex flex-col items-center relative overflow-hidden">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-yellow-300/60 via-white/80 to-blue-200/60 py-8 px-6 flex flex-col items-center border-b border-yellow-100 relative">
          <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-100 to-blue-200 flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-5xl">🏆</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-yellow-600 mb-2 text-center drop-shadow-lg tracking-tight">
            {auctionTitle}
          </h1>
          <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mt-2">
            {/* Registration logic */}
            {isRegistered === false && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150 focus:ring-2 focus:ring-green-300 focus:outline-none mb-2"
                onClick={handleRegister}
                disabled={registerLoading}
              >
                {registerLoading ? 'Registering...' : 'Register Here'}
              </button>
            )}
            {isRegistered === true && (
              <span className="bg-green-100 text-green-700 px-6 py-2 rounded-xl shadow font-bold border border-green-200 mb-2">You have successfully registered!</span>
            )}
            <div className="bg-blue-100 text-blue-800 font-mono px-6 py-2 rounded-xl shadow border border-blue-200 text-lg">
              Auction ends in: {currentTime ? formatTimeLeft(auctionEnd - currentTime) : 'Loading...'}
            </div>
            
            {/* User login status */}
            {!userEmail && (
              <div className="bg-red-100 text-red-700 px-6 py-2 rounded-xl shadow font-bold border border-red-200 mb-2">
                Please log in to participate in this auction
              </div>
            )}
            
            {/* Deposit logic */}
            {auction?.depositRequired && (
              <div className="flex flex-col items-center">
                <span className="text-red-600 font-semibold mb-1">Deposit Required: R{auction.depositAmount}</span>
                {userEmail && depositStatus === 'not_paid' && (
                  <button
                    onClick={handleDepositRequest}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                    disabled={depositLoading}
                  >
                    {depositLoading ? 'Processing...' : 'Pay Deposit'}
                  </button>
                )}
                {!userEmail && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
                    Please log in to pay deposit
                  </div>
                )}
                {depositStatus === 'pending' && (
                  <span className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-xl shadow font-bold border border-yellow-200">Deposit Pending Approval</span>
                )}
                {depositStatus === 'approved' && (
                  <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl shadow font-bold border border-blue-200">Deposit Approved</span>
                )}
                {/* Show banking details if deposit required and not paid */}
                {depositStatus !== 'approved' && (
                  <div className="mt-2 text-xs text-gray-700 bg-white/80 p-2 rounded border border-yellow-200">
                    <div className="font-bold mb-1">Banking Details:</div>
                    <div>Bank: [Your Bank Name]</div>
                    <div>Account: [Your Account Number]</div>
                    <div>Reference: {userEmail} / {auctionTitle}</div>
                  </div>
                )}
              </div>
            )}
            {/* If no deposit required, show FICA logic here if needed */}
          </div>
        </div>

        {/* User Account Status */}
        {userEmail && (
          <div className="w-full px-6 py-4 bg-white/70 border-b border-yellow-100">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <div className="text-lg font-semibold text-gray-700">
                Account Status for: <span className="text-blue-600">{userEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                {ficaStatus === 'approved' && (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl shadow font-bold border border-green-200 flex items-center gap-2">
                    ✅ Account Active - You can place bids
                  </div>
                )}
                {ficaStatus === 'pending' && (
                  <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl shadow font-bold border border-yellow-200 flex items-center gap-2">
                    ⏳ Account Pending - FICA under review
                  </div>
                )}
                {ficaStatus === 'rejected' && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl shadow font-bold border border-red-200 flex items-center gap-2">
                    ❌ Account Inactive - FICA rejected, please re-upload
                  </div>
                )}
                {ficaStatus === 'not_uploaded' && (
                  <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl shadow font-bold border border-gray-200 flex items-center gap-2">
                    📄 Account Inactive - Please upload FICA documents during registration
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Download Invoice Buttons */}
        <div className="w-full flex flex-col sm:flex-row justify-end items-center gap-4 px-6 py-6 border-b border-yellow-100 bg-white/70">
          <button
            onClick={() => handleDownloadInvoice(undefined, 'buyer')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            Download My Buyer Invoice (PDF)
          </button>
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-sm">Buyer:</label>
                <select
                  className="border rounded-xl px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200"
                  value={selectedBuyer}
                  onChange={e => setSelectedBuyer(e.target.value)}
                >
                  <option value="">Select buyer...</option>
                  {buyerEmails.map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
                <button
                  onClick={() => selectedBuyer && handleDownloadInvoice(selectedBuyer, 'buyer')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow disabled:opacity-50 transition-all duration-150"
                  disabled={!selectedBuyer}
                >
                  Download Buyer Invoice
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-sm">Seller:</label>
                <select
                  className="border rounded-xl px-2 py-1 text-sm focus:ring-2 focus:ring-green-200"
                  value={selectedSeller}
                  onChange={e => setSelectedSeller(e.target.value)}
                >
                  <option value="">Select seller...</option>
                  {sellerEmails.map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
                <button
                  onClick={() => selectedSeller && handleDownloadInvoice(selectedSeller, 'seller')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl shadow disabled:opacity-50 transition-all duration-150"
                  disabled={!selectedSeller}
                >
                  Download Seller Invoice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-dashed border-yellow-200 my-8"></div>

        {/* Admin FICA and Pending User Approvals UI */}
        {isAdmin && (
          <>
            {/* FICA Approvals */}
            <div className="w-full px-6 py-6 bg-white/80 rounded-xl mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-yellow-700">FICA Approvals</h2>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={fetchFicaList}
                  disabled={ficaListLoading}
                >
                  {ficaListLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              {ficaListLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : ficaList.length === 0 ? (
                <div className="text-gray-400 italic">No FICA uploads found.</div>
              ) : (
                <table className="w-full text-sm border mb-8">
                  <thead>
                    <tr className="bg-yellow-100">
                      <th className="p-2 border">User Email</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Document</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ficaList.map(fica => (
                      <tr key={fica.email} className="border-b">
                        <td className="p-2 border">{fica.email}</td>
                        <td className="p-2 border">{fica.status}</td>
                        <td className="p-2 border">
                          <a href={fica.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                        </td>
                        <td className="p-2 border flex gap-2">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                            onClick={() => handleApproveFica(fica.email)}
                            disabled={fica.status === 'approved'}
                          >Approve</button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            onClick={() => handleRejectFica(fica.email)}
                            disabled={fica.status === 'rejected'}
                          >Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Pending User Approvals */}
            <div className="w-full px-6 py-6 bg-white/80 rounded-xl mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-blue-700">User Registration Approvals</h2>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={fetchPendingUsers}
                  disabled={pendingUsersLoading}
                >
                  {pendingUsersLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              {pendingUsersLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-gray-400 italic">No pending user registrations.</div>
              ) : (
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 border">User Email</th>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Registered At</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.email} className="border-b">
                        <td className="p-2 border">{user.email}</td>
                        <td className="p-2 border">{user.name || '-'}</td>
                        <td className="p-2 border">{user.registeredAt ? new Date(user.registeredAt).toLocaleString() : '-'}</td>
                        <td className="p-2 border flex gap-2">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                            onClick={() => handleApproveUser(user.email)}
                          >Approve</button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            onClick={() => handleRejectUser(user.email)}
                          >Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Lots per page selector */}
        <div className="w-full flex justify-end mb-6 items-center gap-2 px-6">
          <label className="text-sm">Lots per page:</label>
          <select
            className="border rounded-xl px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-200"
            value={lotsPerPage}
            onChange={e => setLotsPerPage(Number(e.target.value))}
          >
            <option value={9}>9</option>
            <option value={18}>18</option>
            <option value={36}>36</option>
          </select>
        </div>

        {/* Lot list */}
        <div className="w-full px-6 pb-8">
          {currentLots.length === 0 ? (
            <p className="text-center text-gray-400 italic">No lots found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentLots.map(lot => {
                // Fix image handling - backend stores as 'image' not 'imageUrl' or 'images'
                let images: string[] = [];
                if (lot.images && Array.isArray(lot.images)) {
                  // If lot has multiple images array
                  images = lot.images.map((img: string) => 
                    img.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL}${img}` : `${process.env.NEXT_PUBLIC_API_URL}/uploads/lots/${img}`
                  );
                } else if (lot.imageUrl) {
                  // If lot has single imageUrl
                  images = [lot.imageUrl.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL}${lot.imageUrl}` : `${process.env.NEXT_PUBLIC_API_URL}/uploads/lots/${lot.imageUrl}`];
                } else if (lot.image) {
                  // If lot has single image (backend format)
                  images = [lot.image.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL}${lot.image}` : `${process.env.NEXT_PUBLIC_API_URL}/uploads/lots/${lot.image}`];
                } else {
                  // Default placeholder
                  images = ['/placeholder.jpg'];
                }
                
                const currentImageIdx = currentImageIndex[lot.id] || 0;
                const isHighestBidder = isUserHighestBidder(lot);
                const hasAutoBid = autoBidStatus[lot.id] !== undefined && autoBidStatus[lot.id] !== null;
                
                return (
                  <div key={lot.id} className="bg-white/90 rounded-2xl shadow-lg border border-yellow-100 p-6 hover:shadow-2xl transition-all duration-150 flex flex-col">
                    {/* Image Carousel */}
                    <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden group">
                      <img 
                        src={images[currentImageIdx]} 
                        alt={`${lot.title} - Image ${currentImageIdx + 1}`}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={() => openImageModal(images, currentImageIdx, lot.title)}
                      />
                      
                      {/* Magnifying Glass Overlay */}
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center cursor-pointer"
                        onClick={() => openImageModal(images, currentImageIdx, lot.title)}
                      >
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-full p-3">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Image Navigation */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateImage(lot.id, 'prev', images);
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all z-10"
                          >
                            ←
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateImage(lot.id, 'next', images);
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all z-10"
                          >
                            →
                          </button>
                          
                          {/* Image Indicators */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                            {images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${
                                  idx === currentImageIdx ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Image Counter */}
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10">
                            {currentImageIdx + 1}/{images.length}
                          </div>
                        </>
                      )}
                      
                      {/* Watchlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(lot.id);
                        }}
                        className={`absolute top-2 left-2 p-2 rounded-full transition-all z-10 ${
                          watchlist.includes(lot.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-red-500 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        ♥
                      </button>
                    </div>

                    {/* Lot Info */}
                    <div className="flex-1 flex flex-col items-center text-center">
                      <h2 className="text-xl font-bold text-yellow-700 mb-2">{lot.title}</h2>
                      
                      {/* Description with toggle */}
                      <div className="mb-3">
                        <p className={`text-gray-600 text-sm ${expandedDescriptions[lot.id] ? '' : 'overflow-hidden'}`}
                           style={expandedDescriptions[lot.id] ? {} : {
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical',
                             overflow: 'hidden'
                           }}>
                          {lot.description}
                        </p>
                        {lot.description && lot.description.length > 100 && (
                          <button
                            onClick={() => toggleDescription(lot.id)}
                            className="text-blue-500 text-xs mt-1 hover:underline"
                          >
                            {expandedDescriptions[lot.id] ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                      
                      {/* Current Bid and Status */}
                      <div className="mb-3">
                        <span className="text-lg font-semibold text-blue-700 block">
                          Current Bid: R{lot.currentBid}
                        </span>
                        
                        {/* Lot Timer - Enhanced Display */}
                        {lot.endTime && (
                          <div className="mt-2">
                            <LotTimer endTime={lot.endTime} lotNumber={lot.lotNumber || 1} />
                          </div>
                        )}
                        
                        {/* Bidding Status */}
                        {userEmail && (
                          <div className="mt-1">
                            {/* Check if lot has ended and user won */}
                            {lot.status === 'ended' && isHighestBidder ? (
                              <span className="text-green-600 font-bold text-lg bg-green-100 px-3 py-2 rounded-lg border-2 border-green-300 shadow-md flex items-center justify-center gap-2">
                                🎉 YOU WON! 🏆
                              </span>
                            ) : lot.status === 'ended' && lot.bidHistory && lot.bidHistory.length > 0 && 
                                   lot.bidHistory.some(bid => bid.bidderEmail === userEmail) ? (
                              <span className="text-gray-600 font-bold text-sm bg-gray-100 px-2 py-1 rounded">
                                🔚 Auction ended - You did not win
                              </span>
                            ) : lot.status === 'ended' ? (
                              <span className="text-gray-600 font-bold text-sm bg-gray-100 px-2 py-1 rounded">
                                🔚 Auction ended
                              </span>
                            ) : isHighestBidder ? (
                              <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">
                                🏆 You are the highest bidder!
                              </span>
                            ) : lot.bidHistory && lot.bidHistory.length > 0 && 
                                 lot.bidHistory.some(bid => bid.bidderEmail === userEmail) ? (
                              <span className="text-red-600 font-bold text-sm bg-red-100 px-2 py-1 rounded">
                                ❌ You have been outbid
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                Next bid: R{lot.currentBid + (lot.bidIncrement || 10)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Auto-bid Status */}
                        {hasAutoBid && (
                          <div className="mt-1">
                            <span className="text-purple-600 font-bold text-sm bg-purple-100 px-2 py-1 rounded">
                              🤖 Auto-bid: R{autoBidStatus[lot.id]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Auto-bid Section - Only show for active lots AND proper authorization */}
                      {lot.status !== 'ended' && (
                        auction?.depositRequired ? 
                          depositStatus === 'approved' : 
                          ficaStatus === 'approved'
                      ) && (
                        <div className="w-full mb-4 p-3 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Set Maximum Auto-bid
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={`Min: R${lot.currentBid + (lot.bidIncrement || 10)}`}
                              value={autoBidInputs[lot.id] || ''}
                              onChange={(e) => setAutoBidInputs(prev => ({ ...prev, [lot.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-200"
                              min={lot.currentBid + (lot.bidIncrement || 10)}
                              step={lot.bidIncrement || 10}
                            />
                            <button
                              onClick={() => handleSetAutoBid(lot.id)}
                              disabled={autoBidLoading[lot.id] || !userEmail}
                              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all duration-150 disabled:opacity-50 text-sm"
                            >
                              {autoBidLoading[lot.id] ? '...' : 'Set'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isHighestBidder ? 
                              "Auto-bid will activate when others bid against you" : 
                              "System will bid automatically up to your max amount when others bid against you"
                            }
                          </p>
                        </div>
                      )}

                      {/* Quick Bid Buttons - Only for active lots AND proper authorization */}
                      {userEmail && lot.status !== 'ended' && (
                        (auction?.depositRequired && depositStatus === 'approved') ||
                        (!auction?.depositRequired && ficaStatus === 'approved')
                      ) && (
                        <div className="mb-4">
                          <QuickBidButtons
                            currentBid={lot.currentBid}
                            increment={lot.bidIncrement || 10}
                            onQuickBid={(amount) => handleQuickBid(lot.id, amount)}
                            disabled={!userEmail || biddingLoading === lot.id}
                            loading={biddingLoading === lot.id}
                          />
                        </div>
                      )}

                      {/* Bidding Buttons - Only for active lots */}
                      {lot.status !== 'ended' ? (
                        <>
                          {auction?.depositRequired ? (
                            // Auction requires deposit
                            depositStatus === 'approved' ? (
                              <div className="flex gap-2 w-full">
                                <button
                                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all duration-150 disabled:opacity-50"
                                  onClick={() => handlePlaceBid(lot.id, lot.currentBid, lot.bidIncrement || 10)}
                                  disabled={biddingLoading === lot.id}
                                >
                                  {biddingLoading === lot.id ? 'Placing Bid...' : 
                                   `📈 Bid R${lot.currentBid + (lot.bidIncrement || 10)} (+R${lot.bidIncrement || 10})`}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-red-500 font-semibold text-center">
                                You must pay and have your deposit approved to bid.
                              </span>
                            )
                          ) : (
                            // Auction doesn't require deposit - check FICA status
                            ficaStatus === 'approved' ? (
                              <div className="flex gap-2 w-full">
                                <button
                                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all duration-150 disabled:opacity-50"
                                  onClick={() => handlePlaceBid(lot.id, lot.currentBid, lot.bidIncrement || 10)}
                                  disabled={biddingLoading === lot.id}
                                >
                                  {biddingLoading === lot.id ? 'Placing Bid...' : 
                                   `📈 Bid R${lot.currentBid + (lot.bidIncrement || 10)} (+R${lot.bidIncrement || 10})`}
                                </button>
                              </div>
                            ) : (
                              // User account not approved for bidding
                              <div className="flex flex-col items-center gap-1 w-full">
                                {ficaStatus === 'not_uploaded' && (
                                  <span className="text-xs text-red-600 font-semibold text-center">
                                    Account not active. Please upload FICA documents during registration.
                                  </span>
                                )}
                                {ficaStatus === 'pending' && (
                                  <span className="text-xs text-yellow-600 font-semibold text-center">
                                    Account pending approval. FICA documents under review.
                                  </span>
                                )}
                                {ficaStatus === 'rejected' && (
                                  <span className="text-xs text-red-600 font-semibold text-center">
                                    Account inactive. FICA documents rejected - please re-upload during registration.
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </>
                      ) : (
                        /* Lot Ended Message */
                        <div className="text-center p-4 bg-gray-100 rounded-lg">
                          <p className="text-gray-600 font-semibold">🔚 This lot has ended</p>
                          {lot.bidHistory && lot.bidHistory.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Final bid: R{lot.currentBid.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="w-full mt-4 flex justify-center items-center gap-6 pb-8">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-yellow-100 text-gray-700 font-semibold shadow disabled:opacity-50 transition-all duration-150"
          >
            ← Prev
          </button>
          <span className="text-base font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage === totalPages}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-yellow-100 text-gray-700 font-semibold shadow disabled:opacity-50 transition-all duration-150"
          >
            Next →
          </button>
        </div>

        {/* Decorative bottom accent */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-6 bg-gradient-to-r from-yellow-300 via-yellow-100 to-blue-200 rounded-full blur-md opacity-60"></div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        images={imageModal.images}
        currentIndex={imageModal.currentIndex}
        lotTitle={imageModal.lotTitle}
        onNavigate={navigateModalImage}
      />
    </main>
  );
}
