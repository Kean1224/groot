'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = params?.auctionId as string;
  const lotId = params?.lotId as string;
  
  const [lot, setLot] = useState<any>(null);
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail') || '';
    setUserEmail(email);
  }, []);

  useEffect(() => {
    if (!auctionId || !lotId) return;
    
    const fetchData = async () => {
      try {
        // Fetch auction and lots
        const auctionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`);
        if (!auctionResponse.ok) throw new Error('Failed to fetch auctions');
        
        const auctions = await auctionResponse.json();
        const foundAuction = auctions.find((a: any) => a.id === auctionId);
        
        if (!foundAuction) {
          setError('Auction not found');
          return;
        }
        
        setAuction(foundAuction);
        
        // Find the specific lot
        const foundLot = foundAuction.lots?.find((l: any) => l.id === lotId);
        if (!foundLot) {
          setError('Lot not found');
          return;
        }
        
        setLot(foundLot);
      } catch (err) {
        console.error('Error fetching lot:', err);
        setError('Failed to load lot details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auctionId, lotId]);

  const handlePlaceBid = async () => {
    if (!userEmail) {
      alert('Please log in to place a bid');
      return;
    }
    
    setBiddingLoading(true);
    
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
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      alert(`Bid placed successfully! New bid: R${data.currentBid}`);
      
      // Refresh lot data
      window.location.reload();
      
    } catch (error) {
      console.error('Bid placement failed:', error);
      alert(`Failed to place bid: ${error.message}`);
    } finally {
      setBiddingLoading(false);
    }
  };

  const goBackToAuction = () => {
    router.push(`/auctions/${auctionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={goBackToAuction}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ← Back to Auction
          </button>
        </div>
      </div>
    );
  }

  if (!lot) return null;

  const imageUrl = lot.imageUrl?.startsWith('http') 
    ? lot.imageUrl 
    : lot.imageUrl?.startsWith('/uploads')
    ? `${process.env.NEXT_PUBLIC_API_URL}${lot.imageUrl}`
    : lot.imageUrl || '/placeholder-lot.svg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={goBackToAuction}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 transition-colors"
          >
            ← Back to {auction?.title || 'Auction'}
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{lot.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={lot.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-lot.svg';
              }}
            />
          </div>

          {/* Details and Bidding */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{lot.title}</h2>
            
            {lot.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{lot.description}</p>
              </div>
            )}

            {/* Current Bid */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Bid</h3>
              <div className="text-3xl font-bold text-blue-600">
                R{lot.currentBid?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500">
                Next bid: R{((lot.currentBid || 0) + (lot.bidIncrement || 10)).toLocaleString()}
              </div>
            </div>

            {/* Bid History */}
            {lot.bidHistory && lot.bidHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Bids</h3>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {lot.bidHistory.slice(-5).reverse().map((bid: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm py-1">
                      <span>{bid.bidderEmail.replace(/(.{3}).*@/, '$1***@')}</span>
                      <span className="font-semibold">R{bid.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bidding Actions */}
            {lot.status !== 'ended' ? (
              <div className="space-y-4">
                {userEmail ? (
                  <button
                    onClick={handlePlaceBid}
                    disabled={biddingLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors disabled:opacity-50"
                  >
                    {biddingLoading ? 'Placing Bid...' : 
                     `Bid R${((lot.currentBid || 0) + (lot.bidIncrement || 10)).toLocaleString()}`}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to place a bid</p>
                    <button
                      onClick={() => router.push('/login')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600 font-semibold">🔚 This lot has ended</p>
                {lot.bidHistory && lot.bidHistory.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Final bid: R{lot.currentBid?.toLocaleString() || 0}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
