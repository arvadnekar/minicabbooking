"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

export default function UserPage() {
  const { getToken } = useAuth();

 const fetchUserRole = async () => {
      const token = await getToken(); // 🔑 Clerk session token
      console.log("Token: ", token);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      console.log("Data Received: ", data);
    };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Button onClick={fetchUserRole}>
        Fetch User Role
      </Button>
    </div>
  );
}
