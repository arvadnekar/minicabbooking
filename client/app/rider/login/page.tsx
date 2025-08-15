'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';

export default function RiderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.token); // if using cookies, skip this
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed');
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-sm mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg space-y-4"
    >
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Login</h2>

      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />

      <button
        type="submit"
        className="w-full bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition-colors"
      >
        Login
      </button>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={() => (window.location.href = 'http://localhost:3000/api/auth/google')}
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 shadow-sm hover:shadow-md transition font-medium text-gray-900 dark:text-gray-100"
      >
        <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
        Sign in with Google
      </button>
    </form>
  );
}
