"use client";

import React, { useState, useRef, useEffect } from 'react';

interface QuickBidButtonsProps {
  currentBid: number;
  increment: number;
  onQuickBid: (amount: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function QuickBidButtons({ 
  currentBid, 
  increment, 
  onQuickBid, 
  disabled = false,
  loading = false 
}: QuickBidButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate quick bid amounts
  const quickBidAmounts = [
    currentBid + increment,
    currentBid + increment * 2,
    currentBid + increment * 5,
    currentBid + increment * 10
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuickBid = (amount: number) => {
    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    setSelectedAmount(amount);
    onQuickBid(amount);
    setIsOpen(false); // Close dropdown after selection
    
    // Clear selection after animation
    setTimeout(() => setSelectedAmount(null), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const toggleDropdown = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quick Bid Toggle Button */}
      <button
        onClick={toggleDropdown}
        disabled={disabled || loading}
        className={`
          w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 transition-all duration-200
          ${disabled || loading ? 
            'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 
            'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white border-yellow-300 hover:shadow-md cursor-pointer'
          }
          ${isOpen ? 'shadow-lg scale-105' : ''}
        `}
      >
        <span className="text-sm font-bold">⚡ Quick Bid</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 transform transition-all duration-200 ease-out animate-in">
          <div className="text-xs text-gray-500 text-center mb-2 font-semibold">Select quick bid amount:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickBidAmounts.map((amount, index) => {
              const isSelected = selectedAmount === amount;
              const buttonClass = `
                relative overflow-hidden transform transition-all duration-150 
                ${isSelected ? 
                  'bg-gradient-to-r from-green-400 to-green-500 text-white scale-105 shadow-md' : 
                  'bg-gray-50 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:text-white hover:shadow-md hover:scale-102 active:scale-95'
                }
                text-xs font-bold py-2 px-2 rounded-lg border border-gray-200 text-center cursor-pointer
              `;

              return (
                <button
                  key={index}
                  onClick={() => handleQuickBid(amount)}
                  className={buttonClass}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-lg"></div>
                  )}
                  <div className="relative z-10">
                    <div className="text-xs opacity-75">
                      +R{(amount - currentBid).toLocaleString()}
                    </div>
                    <div className="font-bold">
                      R{amount.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Ripple effect */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-white rounded-lg animate-ping opacity-20"></div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-2 text-xs text-gray-400 text-center">
            💡 Tap to bid instantly
          </div>
        </div>
      )}
    </div>
  );
}
