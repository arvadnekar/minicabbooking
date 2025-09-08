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
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import axios from "axios";

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
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated driver starting location (for demo)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number }>({
    lat: 47.5615,
    lng: -52.7126,
  });
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

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
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  // Ask for driver's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Location permission denied or unavailable.", err);
          // Optionally show a message to the driver
        }
      );
    }
  }, []);

  // When a new ride is received, set pickupCoords
  useEffect(() => {
    if (newRide && newRide.pickupLocation) {
      setPickupCoords({
        lat: newRide.pickupLocation.lat,
        lng: newRide.pickupLocation.lng,
      });
    }
  }, [newRide]);

  // Calculate directions between driver and pickup
  useEffect(() => {
    if (
      isLoaded &&
      driverLocation &&
      pickupCoords &&
      (driverLocation.lat !== pickupCoords.lat || driverLocation.lng !== pickupCoords.lng)
    ) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: driverLocation,
          destination: pickupCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirections(result);
          } else {
            setDirections(null);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [isLoaded, driverLocation, pickupCoords]);

  // Helper to calculate distance in meters
  function getDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    if (!a || !b) return null;
    const R = 6371e3;
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
    const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * y;
  }

  const isNearPickup =
    driverLocation && pickupCoords && getDistanceMeters(driverLocation, pickupCoords) !== null
      ? (getDistanceMeters(driverLocation, pickupCoords) as number) < 200
      : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Driver details:", form);
    router.push("/driver/dashboard");
  };

  // Move driver location closer to pickup for demo
  function moveToward(current: { lat: number; lng: number }, target: { lat: number; lng: number }, step = 0.0005) {
    const latDiff = target.lat - current.lat;
    const lngDiff = target.lng - current.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    if (distance < step) return target;
    return {
      lat: current.lat + (latDiff / distance) * step,
      lng: current.lng + (lngDiff / distance) * step,
    };
  }

  const handleAcceptRide = () => {
    if (!socket || !newRide || !userId) return;

    // Get driver's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const currentLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          socket.emit("accept-ride", {
            rideId: newRide._id,
            driverId: userId,
            location: currentLocation,
          });

          setDriverLocation(currentLocation);

          // Start moving driver toward pickup every 5 seconds
          if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);

          let movingLocation = { ...currentLocation };
          const pickup = newRide.pickupLocation;

          locationIntervalRef.current = setInterval(() => {
            // Move a small step toward pickup
            const step = 0.0005;
            const latDiff = pickup.lat - movingLocation.lat;
            const lngDiff = pickup.lng - movingLocation.lng;
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
            if (distance < step) return; // Already at/near pickup

            movingLocation = {
              lat: movingLocation.lat + (latDiff / distance) * step,
              lng: movingLocation.lng + (lngDiff / distance) * step,
            };
            setDriverLocation(movingLocation);
            socket.emit("driver-location", {
              rideId: newRide._id,
              driverId: userId,
              location: movingLocation,
            });
          }, 5000);

          // Hide dialog and clear newRide
          setDialogOpen(false);
          setNewRide(null);
        },
        (err) => {
          alert("Location permission denied. Please allow location access to accept rides.");
        }
      );
    }
  };

  const handleRejectRide = () => {
    socket?.emit("reject-ride", { rideId: newRide._id, driverId: userId });
    setDialogOpen(false);
    setNewRide(null);
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  // Fetch active ride on mount
  useEffect(() => {
    async function fetchActiveRide() {
      if (!userId) return;
      try {
        const token = await getToken();
        const res = await axios.get(
          "/api/rides/active?role=driver",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data) {
          setNewRide(res.data);
          setPickupCoords({
            lat: res.data.pickupLocation.lat,
            lng: res.data.pickupLocation.lng,
          });
        }
      } catch (err) {
        // No active ride or error
        setNewRide(null);
      }
    }
    fetchActiveRide();
  }, [userId]);

  return (
    <div className="flex flex-col items-center p-6">
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
              <Button variant="outline" onClick={handleRejectRide}>
                Dismiss
              </Button>
            </DialogClose>
            <Button onClick={handleAcceptRide}>Accept Ride</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Section */}
      <div className="w-full max-w-4xl h-[600px] rounded-xl overflow-hidden shadow-lg my-6">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            zoom={15}
            center={driverLocation || pickupCoords || { lat: 47.5615, lng: -52.7126 }}
          >
            {driverLocation && (
              <Marker
                position={driverLocation}
                icon={{
                url: "https://cdn-icons-png.flaticon.com/512/12689/12689302.png", // Flaticon car icon
                scaledSize: new window.google.maps.Size(40, 40),
              }}
                
              />
            )}
            {pickupCoords && (
              <Marker
                position={pickupCoords}
                label="P"
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}
      </div>

      {/* Status Message */}
      {pickupCoords && driverLocation && !isNearPickup && (
        <div className="bg-yellow-100 text-yellow-900 rounded-lg px-4 py-3 mb-4">
          You are not near the pickup location yet.
        </div>
      )}
      {pickupCoords && driverLocation && isNearPickup && (
        <div className="bg-green-100 text-green-900 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>You have arrived at the pickup location!</span>
          <Button
            className="ml-4"
            onClick={() => {
              if (socket && newRide && userId) {
                socket.emit("start-ride", {
                  rideId: newRide._id,
                  driverId: userId,
                });
              }
            }}
          >
            Start Ride
          </Button>
        </div>
      )}
    </div>
  );
}
