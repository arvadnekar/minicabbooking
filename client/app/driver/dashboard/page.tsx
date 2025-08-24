"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DriverDetails() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    age: "",
    licenseNumber: "",
    vehicleModel: "",
    vehicleYear: "",
    plateNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Driver details:", form); // later send to backend
    router.push("/driver/dashboard");
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" placeholder="Full Name" className="border p-2 w-full" onChange={handleChange}/>
        <input name="age" placeholder="Age" className="border p-2 w-full" onChange={handleChange}/>
        <input name="licenseNumber" placeholder="License Number" className="border p-2 w-full" onChange={handleChange}/>
        <input name="vehicleModel" placeholder="Vehicle Model" className="border p-2 w-full" onChange={handleChange}/>
        <input name="vehicleYear" placeholder="Year of Manufacture" className="border p-2 w-full" onChange={handleChange}/>
        <input name="plateNumber" placeholder="Plate Number" className="border p-2 w-full" onChange={handleChange}/>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Save & Continue</button>
      </form>
    </div>
  );
}
