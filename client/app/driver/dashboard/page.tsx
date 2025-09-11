/* eslint-disable */
/* tslint:disable */
/* @ts-nocheck */

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
import { useAuth } from "@clerk/nextjs";
import { DirectionsRenderer, GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function DriverDetails() {
  const { getToken, userId } = useAuth();

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
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [rideStarted, setRideStarted] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [_routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [_routeIndex, setRouteIndex] = useState(0);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  useEffect(() => {
    const socketIo = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
      transports: ["websocket"],
    });

    setSocket(socketIo);

    const onConnect = () => {
      socketIo.emit("joinDriversRoom");
    };

    const onDisconnect = () => {
    };

    const onNewRide = (ride: any) => {
      setNewRide(ride);
      setDialogOpen(true);
    };

    const onRideUpdated = (data: any) => {
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

  // When a new ride is received, set pickupCoords and dropoffCoords
  useEffect(() => {
    if (newRide && newRide.pickupLocation && newRide.dropoffLocation) {
      setPickupCoords({
        lat: newRide.pickupLocation.lat,
        lng: newRide.pickupLocation.lng,
      });
      setDropoffCoords({
        lat: newRide.dropoffLocation.lat,
        lng: newRide.dropoffLocation.lng,
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

  // Extract route path from directions
  useEffect(() => {
    if (directions) {
      // Extract overview_path as array of LatLngLiteral
      const path = directions.routes[0].overview_path.map((latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }));
      setRoutePath(path);
      setRouteIndex(0);
    }
  }, [directions]);

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



  const handleAcceptRide = () => {
    if (!socket || !newRide || !userId) return;

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
            const step = 0.0010;
            const latDiff = pickup.lat - movingLocation.lat;
            const lngDiff = pickup.lng - movingLocation.lng;
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
            if (distance < step) {
              clearInterval(locationIntervalRef.current!);
              // Optionally, force a re-render or update state to show the Start Ride button
              setDriverLocation({ lat: pickup.lat, lng: pickup.lng });
              return;
            }
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

          setDialogOpen(false);
          // Do NOT clear newRide here!
          // setNewRide(null);
        },
        (_err) => {
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

  useEffect(() => {
    if (
      socket &&
      newRide &&
      userId &&
      isNearPickup &&
      !rideStarted
    ) {
      socket.emit("driver-arrived", {
        rideId: newRide._id,
        driverId: userId,
      });
    }
    // Only run when isNearPickup changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNearPickup]);

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
            {/* Always show driver marker */}
            {driverLocation && (
              <Marker
                position={driverLocation}
                icon={{
                  url: "https://cdn-icons-png.flaticon.com/512/12689/12689302.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {/* Show pickup marker only before ride starts */}
            {pickupCoords && !rideStarted && (
              <Marker
                position={pickupCoords}
                label="P"
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {/* Show dropoff marker only after ride starts */}
            {dropoffCoords && rideStarted && (
              <Marker
                position={dropoffCoords}
                label="D"
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}
      </div>

      {/* Status Message */}
      {pickupCoords && driverLocation && !rideStarted && !isNearPickup && (
        <div className="bg-yellow-100 text-yellow-900 rounded-lg px-4 py-3 mb-4">
          You are not near the pickup location yet.
        </div>
      )}
      {pickupCoords && driverLocation && !rideStarted && isNearPickup && (
        <div className="bg-green-100 text-green-900 rounded-lg px-4 py-3 mb-4 flex items-center justify-between w-full max-w-2xl">
          <span>
            <b>You have arrived at the pickup location!</b>
          </span>
          <Button
            className="ml-4"
            onClick={() => {
              if (socket && newRide && userId && dropoffCoords) {
                // Only emit start-ride when button is clicked
                socket.emit("start-ride", {
                  rideId: newRide._id,
                  driverId: userId,
                });
                setRideStarted(true);

                // Start moving driver toward dropoff every 5 seconds
                if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);

                let movingLocation = { ...driverLocation };
                locationIntervalRef.current = setInterval(() => {
                  const step = 0.0005;
                  const latDiff = dropoffCoords.lat - movingLocation.lat;
                  const lngDiff = dropoffCoords.lng - movingLocation.lng;
                  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
                  if (distance < step) {
                    clearInterval(locationIntervalRef.current!);
                    setDriverLocation({ lat: dropoffCoords.lat, lng: dropoffCoords.lng });
                    setRideCompleted(true);
                    socket.emit("ride-completed", {
                      rideId: newRide._id,
                      driverId: userId,
                    });
                    return;
                  }
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
              }
            }}
          >
            Start Ride
          </Button>
        </div>
      )}

      {/* Ride completed notification */}
      {rideCompleted && (
        <div className="bg-blue-100 text-blue-900 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>You have reached the destination. Ride completed!</span>
          <Button
            className="ml-4"
            onClick={() => {
              // Reset ride state so driver can accept new rides and map refreshes
              setRideCompleted(false);
              setRideStarted(false);
              setNewRide(null);
              setPickupCoords(null);
              setDropoffCoords(null);
              setDirections(null);

              // Optionally, reset driver location to current GPS location
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setDriverLocation({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    });
                  },
                  () => {
                    // fallback: keep previous location
                  }
                );
              }
            }}
          >
            Complete Ride
          </Button>
        </div>
      )}
    </div>
  );
}
