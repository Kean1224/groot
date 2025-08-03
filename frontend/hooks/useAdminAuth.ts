'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_jwt');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('admin_login_time');
    }
  };

  const logout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_jwt');
        const loginTime = localStorage.getItem('admin_login_time');
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        // Check session timeout (4 hours max session)
        if (loginTime) {
          const sessionAge = Date.now() - parseInt(loginTime);
          const maxSessionAge = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
          if (sessionAge > maxSessionAge) {
            console.log('Session expired due to timeout');
            clearAuthData();
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/admin/login');
            return;
          }
        }

        // Decode and validate JWT token structure
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.log('Invalid JWT token format');
          clearAuthData();
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        const payload = JSON.parse(atob(parts[1]));
        
        // Check if token is expired
        if (!payload.exp || Date.now() / 1000 > payload.exp) {
          console.log('Token expired');
          clearAuthData();
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        // Check if user has admin role
        if (payload.role !== 'admin') {
          console.log('User does not have admin role');
          clearAuthData();
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        // Verify token with backend server
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-admin`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.log('Backend token verification failed');
            clearAuthData();
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/admin/login');
            return;
          }

          // All checks passed - user is authenticated
          setIsAuthenticated(true);
          setLoading(false);
        } catch (fetchError) {
          console.error('Network error during token verification:', fetchError);
          // On network error, still allow access if token is valid locally
          // But add a warning
          console.warn('Could not verify token with server, allowing local validation');
          setIsAuthenticated(true);
          setLoading(false);
        }

      } catch (error) {
        console.error('Auth validation error:', error);
        clearAuthData();
        setIsAuthenticated(false);
        setLoading(false);
        router.push('/admin/login');
      }
    };

    checkAuth();

    // Set up periodic token validation (every 5 minutes)
    const validationInterval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(validationInterval);
  }, [router]);

  return { isAuthenticated, loading, logout };
}
