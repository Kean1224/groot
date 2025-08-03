'use client';

import { useAdminAuth } from '../hooks/useAdminAuth';
import { useEffect } from 'react';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { isAuthenticated, loading, logout } = useAdminAuth();

  // Add session timeout warning
  useEffect(() => {
    if (isAuthenticated) {
      // Set login timestamp if not already set
      if (!localStorage.getItem('admin_login_time')) {
        localStorage.setItem('admin_login_time', Date.now().toString());
      }

      // Add page visibility change listener to logout on tab close/blur
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Page is hidden, start countdown for auto-logout
          const timeoutId = setTimeout(() => {
            if (document.hidden) {
              console.log('Auto-logout due to inactivity');
              logout();
            }
          }, 30 * 60 * 1000); // 30 minutes of inactivity

          // Store timeout ID to clear it later
          (window as any).inactivityTimeout = timeoutId;
        } else {
          // Page is visible again, clear the timeout
          if ((window as any).inactivityTimeout) {
            clearTimeout((window as any).inactivityTimeout);
            delete (window as any).inactivityTimeout;
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Prevent right-click context menu in admin areas (basic protection)
      const preventRightClick = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      document.addEventListener('contextmenu', preventRightClick);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', preventRightClick);
        if ((window as any).inactivityTimeout) {
          clearTimeout((window as any).inactivityTimeout);
        }
      };
    }
  }, [isAuthenticated, logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin credentials...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a few seconds...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">Admin authentication required</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-protected">
      {/* Add admin logout button in header */}
      <div className="bg-yellow-600 text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-1.332 6-6.031 6-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium">Admin Mode Active</span>
        </div>
        <button
          onClick={logout}
          className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
