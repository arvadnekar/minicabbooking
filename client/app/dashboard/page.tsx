"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = await getToken(); // 🔑 Clerk session token

      const res = await fetch("http://localhost:5000/api/user/role", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setUserRole(data.user.role);
    };

    fetchUserRole();
  }, [getToken]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {userRole ? (
        <p className="mt-4">You are logged in as <b>{userRole}</b></p>
      ) : (
        <p className="mt-4 text-gray-600">Loading...</p>
      )}
    </div>
  );
}
