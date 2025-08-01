import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Login attempt:', { email, apiUrl: process.env.NEXT_PUBLIC_API_URL });
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`;
      console.log('Making request to:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      const data = await res.json();
      console.log('Response data:', data);
      setLoading(false);
      
      if (res.ok) {
        // Store the token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userEmail', data.email);
          localStorage.setItem('userRole', data.role);
          console.log('Login successful, token stored:', data.token);
        }
        
        // Redirect based on role
        if (data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error details:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check if the backend is running.');
      } else {
        setError(`Network error occurred: ${error.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white/90 p-8 rounded-2xl shadow-xl flex flex-col gap-4 border border-yellow-200 mt-10">
      <h2 className="text-2xl font-bold text-yellow-700 mb-2">Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      <label className="font-semibold">Email
        <input type="email" className="mt-1 w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label className="font-semibold">Password
        <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>
      <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-150" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
