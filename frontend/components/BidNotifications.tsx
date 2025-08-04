"use client";

import React, { useState, useEffect } from 'react';

interface BidNotification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'outbid' | 'win';
  timestamp: number;
}

interface BidNotificationsProps {
  notifications: BidNotification[];
  onRemove: (id: string) => void;
}

export default function BidNotifications({ notifications, onRemove }: BidNotificationsProps) {
  const [playedSounds, setPlayedSounds] = useState<Set<string>>(new Set());

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, onRemove]);

  // Play sound for new notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (!playedSounds.has(notification.id)) {
        playSound(notification.type);
        setPlayedSounds(prev => new Set(prev).add(notification.id));
      }
    });
  }, [notifications, playedSounds]);

  // Clean up played sounds for removed notifications
  useEffect(() => {
    const currentNotificationIds = new Set(notifications.map(n => n.id));
    setPlayedSounds(prev => {
      const filtered = new Set<string>();
      prev.forEach(id => {
        if (currentNotificationIds.has(id)) {
          filtered.add(id);
        }
      });
      return filtered;
    });
  }, [notifications]);

  // Play sound based on notification type
  const playSound = (type: string) => {
    try {
      const audio = new Audio();
      switch (type) {
        case 'success':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEVAhV0yO/bgSkEJG/A7t2RQgoUXrPq7KhVEwlGnt/yv2EWAhV0x+7cgjMGI2q97dpyIARVZ73v3JJFDBVLuN/2smAcBjiVz+vU';
          break;
        case 'outbid':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSjMGI2q97dpyIg';
          break;
        case 'win':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEVAhVzx+7cgjMGI2q97dpyIAR';
          break;
      }
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors
    } catch (error) {
      // Silently fail if audio doesn't work
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '🎉';
      case 'warning': return '⚠️';
      case 'outbid': return '💔';
      case 'win': return '🏆';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'from-green-500 to-green-600';
      case 'warning': return 'from-yellow-500 to-yellow-600';
      case 'outbid': return 'from-red-500 to-red-600';
      case 'win': return 'from-purple-500 to-purple-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`transform transition-all duration-500 ease-in-out bg-gradient-to-r ${getNotificationColor(notification.type)} text-white p-4 rounded-lg shadow-lg border-l-4 border-white animate-slide-in-right`}
          style={{
            animation: 'slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 4.5s forwards'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
              <span className="font-medium text-sm">{notification.message}</span>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="ml-2 text-white hover:text-gray-200 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
