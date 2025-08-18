"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (role: "driver" | "rider") => {
    if (!user) return;
    setLoading(true);

    // Save to Clerk (frontend only for now)
    await user.update({
      unsafeMetadata: { role, onboarded: true },
    });

    // Redirect based on role
    if (role === "rider") {
      router.push("/rider/dashboard");
    } else {
      router.push("/driver/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">Welcome to MiniCab 🚖</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Choose how you want to use MiniCab:
      </p>
      <div className="flex gap-6">
        <button
          disabled={loading}
          onClick={() => handleSelect("rider")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Continue as Rider
        </button>
        <button
          disabled={loading}
          onClick={() => handleSelect("driver")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          Continue as Driver
        </button>
      </div>
    </div>
  );
}
