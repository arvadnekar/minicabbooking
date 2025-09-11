"use client";

import DriverForm from "@/components/forms/DriverForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/clerk-react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  // Sync Clerk user with backend on mount
  useEffect(() => {
    const syncUser = async () => {
      if (user && isSignedIn) {
        const token = await getToken();
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            externalUserId: user.id,
            emailId: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            username: user.username,
            imgUrl: user.imageUrl,
          }),
        });
      }
    };
    syncUser();
  }, [user, isSignedIn, getToken]);

  // Check onboarding status and redirect if needed
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/onboarding/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserData(data);
      if (data.isOnboarded && data.role) {
        if (data.role === "rider") {
          redirect("/rider/dashboard");
        } else if (data.role === "driver") {
          redirect("/driver/dashboard");
        }
      }
    };

    if (isSignedIn) {
      fetchOnboardingStatus();
    }
  }, [isSignedIn, getToken, router]);

  const registerRider = async () => {
    const token = await getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/onboarding/rider`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: user?.fullName,
        emailId: user?.primaryEmailAddress?.emailAddress,
        province: "", // You can collect this from user if needed
        username: user?.username,
      }),
    });
    redirect("/rider/dashboard");
  };

  if (!isLoaded || !isSignedIn || !userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">Welcome to MiniCab 🚖</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Choose how you want to use MiniCab:
      </p>
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Tabs defaultValue="rider">
          <TabsList>
            <TabsTrigger value="rider">Rider</TabsTrigger>
            <TabsTrigger value="driver">Driver</TabsTrigger>
          </TabsList>
          <TabsContent value="rider" className="mt-4">
            <Button onClick={registerRider} className="w-full">
              Continue as Rider
            </Button>
          </TabsContent>
          <TabsContent value="driver" className="mt-4 max-w-3xl w-full">
            <DriverForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
