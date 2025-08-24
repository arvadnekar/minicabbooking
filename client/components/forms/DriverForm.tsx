"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useAuth, useUser } from "@clerk/nextjs";

export default function DriverForm() {
  const { isLoaded, isSignedIn, user, } = useUser();
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    name: "",
    age: "",
    licenseNumber: "",
    vehicleModel: "",
    vehicleYear: "",
    plateNumber: "",
    province:''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", form, isSignedIn, user);
    if (!isSignedIn || !user) return;

    const token = await getToken();
    const res = await fetch("http://localhost:3000/api/onboarding/driver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        name: form.name || user.fullName,
        emailId: user.primaryEmailAddress?.emailAddress,
        username: user.username,
      }),
    });

    if (res.ok) {
      redirect("/driver/dashboard");
    } else {
      // Optionally handle error
      alert("Failed to onboard as driver.");
    }
  };


  useEffect(() => {
    if (user && user.fullName) {
      setForm({...form, name: user.fullName as string})
    }

  }, [isSignedIn, user?.fullName])

  return (
    <div className="flex w-full max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-2xl shadow-md p-8 border-red-500">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Complete Your Driver Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {/* Full Name */}
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="name">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Age */}
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label >
              Age
            </Label>
            <Input
            id="age"
              name="age"
              type="number"
              required
              placeholder="Enter your age"
              value={form.age}
              onChange={handleChange}
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="province">
              Province
            </Label>
            <Input
              id="province"
              name="province"
              type="text"
              required
              placeholder="Enter your province"
              value={form.province}
              onChange={handleChange}
            />
          </div>
          

          {/* License Number */}
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label >
              License Number
            </Label>
            <Input
              name="licenseNumber"
              type="text"
              required
              placeholder="Driver's License Number"
              value={form.licenseNumber}
              onChange={handleChange}
    
            />
          </div>

          {/* Vehicle Model */}
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label >
              Vehicle Model
            </Label>
            <Input
              name="vehicleModel"
              type="text"
              placeholder="e.g. Toyota Prius"
              value={form.vehicleModel}
              onChange={handleChange}
              
            />
          </div>

          {/* Vehicle Year */}
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label >
              Year of Manufacture
            </Label>
            <Input
              name="vehicleYear"
              type="number"
              placeholder="e.g. 2020"
              value={form.vehicleYear}
              onChange={handleChange}
              
            />
          </div>

          {/* Plate Number */}
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label >
              Plate Number
            </Label>
            <Input
              name="plateNumber"
              type="text"
              placeholder="Vehicle Plate Number"
              value={form.plateNumber}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant={'default'}
          >
            Save & Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
