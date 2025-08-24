const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // Your backend base URL

export const loginUser = async (credentials: { email: string; password: string }) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include', // for cookies if using httpOnly token
  });

  if (!res.ok) throw new Error('Login failed');
  return res.json(); // returns token and user info
};

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Registration failed');
  return res.json();
};
