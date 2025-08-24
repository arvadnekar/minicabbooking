'use client';

import Ctasection from "@/components/cts";
import Featuresection from "@/components/featuresection";
import Herosection from "@/components/hero";
import {TestimonialsGrid } from "@/components/TestimonialCard";
import { useAuth, useUser } from "@clerk/clerk-react";
import { redirect } from "next/navigation";

export default function Home() {
  const { isLoaded, isSignedIn, user, } = useUser();
   if (!isLoaded) {
    return <div>Loading...</div>;
   }
   if (isSignedIn) {
    redirect('/onboarding')
   }
  return (
    <>
      <Herosection />
      <Featuresection />
      <TestimonialsGrid />
      <Ctasection/>
    </>
  );
}