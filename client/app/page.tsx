'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [authType, setAuthType] = useState<'login' | 'register'>('login');

  const handleSelect = (role: 'driver' | 'rider') => {
    console.log("URL", role, authType)
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
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white text-center">
        Welcome to MiniCab!
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 text-center max-w-lg">
        Select your role and choose whether to log in or create a new account to get started.
      </p>

      {/* Toggle Login/Register */}
      <div className="mb-10 flex space-x-4">
        {authButtons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => setAuthType(btn.type as 'login' | 'register')}
            aria-pressed={authType === btn.type}
            className={`px-6 py-2 rounded-lg font-semibold shadow transition-all
              ${authType === btn.type
                ? `bg-${btn.color}-600 text-white hover:bg-${btn.color}-700 scale-105`
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Role Selection */}
      <div className="flex space-x-6">
        {roleButtons.map((btn) => (
          <button
            key={btn.role}
            onClick={() => handleSelect(btn.role as 'rider' | 'driver')}
            className={`px-6 py-3 bg-${btn.color}-500 text-white rounded-lg shadow-md hover:bg-${btn.color}-600 dark:bg-${btn.color}-600 dark:hover:bg-${btn.color}-700 transition-all`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
