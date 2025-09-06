"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

export default function DriverDetails() {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    age: "",
    licenseNumber: "",
    vehicleModel: "",
    vehicleYear: "",
    plateNumber: "",
  });

  const [newRide, setNewRide] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIo = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    setSocket(socketIo);

    const onConnect = () => {
      console.log("Socket connected:", socketIo.id);
      socketIo.emit("joinDriversRoom");
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
    };

    const onNewRide = (ride: any) => {
      console.log("Received new-ride event:", ride);
      setNewRide(ride);
      setDialogOpen(true);
    };

    const onRideUpdated = (data: any) => {
      console.log("Ride updated:", data);
      // Optionally update UI or remove ride from list if accepted
    };

    socketIo.on("connect", onConnect);
    socketIo.on("disconnect", onDisconnect);
    socketIo.on("new-ride", onNewRide);
    socketIo.on("ride-updated", onRideUpdated);

    return () => {
      socketIo.off("connect", onConnect);
      socketIo.off("disconnect", onDisconnect);
      socketIo.off("new-ride", onNewRide);
      socketIo.off("ride-updated", onRideUpdated);
      socketIo.disconnect();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Driver details:", form);
    router.push("/driver/dashboard");
  };

  const handleAcceptRide = () => {
    socket?.emit("accept-ride", { rideId: newRide._id, driverId: userId });
    setDialogOpen(false);
    setNewRide(null);
  };

  const handleRejectRide = () => {
    socket?.emit("reject-ride", { rideId: newRide._id, driverId: userId });
    setDialogOpen(false);
    setNewRide(null);
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

      {/* Dialog for new ride */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Ride Available!</DialogTitle>
            <DialogDescription>
              A new ride request has just come in. Would you like to accept it?
            </DialogDescription>
          </DialogHeader>
          {newRide && (
            <div className="mb-4">
              <div><b>Pickup:</b> {newRide.pickupLocation?.address}</div>
              <div><b>Dropoff:</b> {newRide.dropoffLocation?.address}</div>
              <div><b>Fare:</b> ${newRide.fare}</div>
              <div><b>Payment:</b> {newRide.paymentMethod}</div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Dismiss
              </Button>
            </DialogClose>
            <Button onClick={handleAcceptRide}>Accept Ride</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
