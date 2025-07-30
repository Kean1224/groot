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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setLoading(false);
    if (res.ok) {
      // Optionally store token in cookie/localStorage if backend does not set cookie
      router.push('/');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
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
