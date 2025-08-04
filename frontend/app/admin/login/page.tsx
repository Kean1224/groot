'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

// Separate component for handling search params to avoid SSR issues
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for session expiry error
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_expired') {
      setError('Your session has expired. Please login again.');
    }

    // Clear any existing admin data on login page load
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_jwt');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('admin_login_time');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Ensure clean values
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin-login`;
      
      console.log('Admin login attempt to:', apiUrl);
      console.log('Using credentials:', { email: cleanEmail, password: '***' });
      
      const requestBody = {
        email: cleanEmail,
        password: cleanPassword
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-cache'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Full response data:', data);
      console.log('Login response details:', {
        status: data.status,
        role: data.role,
        email: data.email,
        hasToken: !!data.token,
        tokenLength: data.token ? data.token.length : 0
      });
      
      // Check for successful login response
      if (data.token && data.role === 'admin' && data.status === 'success') {
        console.log('✅ Login validation passed, storing auth data...');
        
        // Store authentication data
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_jwt', data.token);
          localStorage.setItem('userEmail', data.email);
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('admin_login_time', Date.now().toString());
          // Set cookie for middleware
          document.cookie = `admin_jwt=${data.token}; path=/; SameSite=Lax;`;
          console.log('✅ Auth data stored in localStorage and cookie');
        }
        
        console.log('✅ Redirecting to admin dashboard...');
        
        // Immediate redirect without timeout
        const redirectTo = searchParams.get('redirect') || '/admin';
        router.push(redirectTo);
        
      } else {
        console.error('❌ Login validation failed:', {
          hasToken: !!data.token,
          roleMatch: data.role === 'admin',
          statusMatch: data.status === 'success',
          actualData: data
        });
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded shadow">
        <h1 className="text-3xl font-bold text-center text-yellow-600">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              autoComplete="username"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="bg-red-50 border border-red-200 rounded p-4 mt-6">
          <div className="text-sm text-red-700">
            <p className="font-medium mb-2">⚠️ Admin Access:</p>
            <p className="text-xs">
              Admin access has been disabled. No users are configured in the system.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin login...</p>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}