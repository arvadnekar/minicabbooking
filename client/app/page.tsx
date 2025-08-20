'use client';

import Ctasection from "@/components/cts";
import Featuresection from "@/components/featuresection";
import Herosection from "@/components/hero";
import {TestimonialsGrid } from "@/components/TestimonialCard";

export default function Home() {
  return (
    <>
      <Herosection />
      <Featuresection />
      <TestimonialsGrid />
      <Ctasection/>
    </>
  );
}