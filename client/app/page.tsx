'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

export default function Home() {
  const router = useRouter();
  const [authType, setAuthType] = useState<'login' | 'register'>('login');

  const handleSelect = (role: 'driver' | 'rider') => {
    router.push(`/${role}/${authType}`);
  };

  const authButtons = [
    { type: 'login', label: 'Login', color: 'blue' },
    { type: 'register', label: 'Register', color: 'green' },
  ];

  const roleButtons = [
    { role: 'rider', label: 'Continue as Rider', color: 'green' },
    { role: 'driver', label: 'Continue as Driver', color: 'blue' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-xl w-full p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">
          Welcome to MiniCab!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Select your role and choose whether to log in or create a new account to get started.
        </p>

        {/* Toggle Login/Register */}
        <div className="mb-8 flex justify-center space-x-4">
          {authButtons.map((btn) => {
            const isActive = authType === btn.type;
            const baseClasses = "px-6 py-2 rounded-lg font-semibold shadow transition-transform duration-200";
            const activeClasses =
              btn.color === 'blue'
                ? 'bg-blue-600 text-white hover:bg-blue-700 scale-105'
                : 'bg-green-600 text-white hover:bg-green-700 scale-105';
            const inactiveClasses =
              'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';

            return (
              <button
                key={btn.type}
                onClick={() => setAuthType(btn.type as 'login' | 'register')}
                className={clsx(baseClasses, isActive ? activeClasses : inactiveClasses)}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
        {/* Role Selection */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {roleButtons.map((btn) => {
            const bgClass =
              btn.color === 'blue'
                ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700';
            return (
              <button
                key={btn.role}
                onClick={() => handleSelect(btn.role as 'rider' | 'driver')}
                className={`px-8 py-3 text-white rounded-lg shadow-md transition-transform duration-200 transform hover:scale-105 ${bgClass}`}
              >
                {btn.label}
              </button>
            );
            
          })}
        </div>
      </div>
    </div>
  );
}
