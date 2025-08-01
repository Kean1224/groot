'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('admin_jwt');
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        // Decode and validate JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (!payload.exp || Date.now() / 1000 > payload.exp) {
          localStorage.removeItem('admin_jwt');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        // Check if user has admin role
        if (payload.role !== 'admin') {
          localStorage.removeItem('admin_jwt');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        // All checks passed
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Auth validation error:', error);
        localStorage.removeItem('admin_jwt');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setLoading(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, loading };
}
