"use client";
import { GoogleMap, Marker, useLoadScript, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import io from "socket.io-client";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const BASE_FARE = 5;
const PER_KM = 1.5;
const PER_MIN = 0.3;

function calculateFareFromDirections(directions: google.maps.DirectionsResult | null) {
  if (!directions) return null;
  const leg = directions.routes[0]?.legs[0];
  if (!leg) return null;
  const distanceKm = leg.distance?.value ? leg.distance.value / 1000 : 0;
  const durationMin = leg.duration?.value ? leg.duration.value / 60 : 0;
  const fare = BASE_FARE + distanceKm * PER_KM + durationMin * PER_MIN;
  return {
    fare: fare.toFixed(2),
    distance: distanceKm.toFixed(2),
    duration: Math.round(durationMin),
  };
}

export default function RiderDashboard() {
  const { getToken, userId } = useAuth();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickupManuallyChanged, setPickupManuallyChanged] = useState(false);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [tempDriver, setTempDriver] = useState<any>(null); // <-- Add this line
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverArrived, setDriverArrived] = useState(false);
  const [rideStarted, setRideStarted] = useState(false);
  const [rideRequested, setRideRequested] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState<number | null>(null);
  const socketRef = useRef<any>(null);
  const riderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const driverBackupInfo = useState<any>(null)

  const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Set pickup to current location initially, but not after user changes it
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(coords);
          if (!pickupManuallyChanged) {
            setPickupCoords(coords);
          }
        },
        () => {
          // fallback to nothing
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupManuallyChanged]);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");
    if (userId) {
      socketRef.current.emit("joinRiderRoom", { userId });
    }
    socketRef.current.on(
      "driver-assigned",
      (payload: { driverId: string; name: string; car: string; phone: string; imageUrl: string }) => {
        setDriverInfo({
          id: payload.driverId,
          name: payload.name,
          car: payload.car,
          phone: payload.phone,
          imageUrl: payload.imageUrl,
        });
        setTempDriver({
          id: payload.driverId,
          name: payload.name,
          car: payload.car,
          phone: payload.phone,
          imageUrl: payload.imageUrl,
        })
      }
    );
    socketRef.current.on("driver-location", (payload: { location: { lat: number; lng: number } }) => {
      setDriverLocation(payload.location);
    });

    // Listen for driver-arrived event
    socketRef.current.on("driver-arrived", () => {
      setDriverArrived(true);
    });

    // Listen for start-ride event
    socketRef.current.on("start-ride", (payload: any) => {
      setRideStarted(true);
      setDriverArrived(false); // Hide arrival message
    });

    // Listen for ride-completed event
    socketRef.current.on("ride-completed", () => {
      setShowFeedback(true);
      setRideStarted(false);
      setDriverArrived(false);
      setDriverLocation(null);
      setDirections(null);
      setPickupCoords(null);
      setDropoffCoords(null);
      setRideRequested(false);
      setDriverInfo(null); // Hide driver details after ride completion
    });

    return () => {
      socketRef.current.disconnect();
      if (riderIntervalRef.current) clearInterval(riderIntervalRef.current);
    };
  }, [userId]);

  useEffect(() => {
    async function fetchActiveRide() {
      if (!userId) return;
      try {
        const token = await getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/rides/active?role=rider`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data) {
          // Set pickup/dropoff, etc.
          setPickupCoords({
            lat: res.data.pickupLocation.lat,
            lng: res.data.pickupLocation.lng,
          });
          setDropoffCoords({
            lat: res.data.dropoffLocation.lat,
            lng: res.data.dropoffLocation.lng,
          });
          // Optionally set driver info if assigned
          if (res.data.assignedDriver) {
            setDriverInfo({ id: res.data.assignedDriver });
          }
        }
      } catch (err) {
        // No active ride or error
      }
    }
    fetchActiveRide();
  }, [userId]);

  const autocompleteOptions =
    isLoaded && userLocation
      ? {
          location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
          radius: 50000,
          componentRestrictions: { country: "ca" },
        }
      : undefined;

  const handlePickupPlace = () => {
    const place = pickupRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    setPickup(place.formatted_address || "");
    setPickupCoords({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
    setPickupManuallyChanged(true);
  };

  const handleDropoffPlace = () => {
    const place = dropoffRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    setDropoff(place.formatted_address || "");
    setDropoffCoords({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  };

  // Calculate route only when both pickup and dropoff are set and not the same
  useEffect(() => {
    if (
      pickupCoords &&
      dropoffCoords &&
      pickup &&
      dropoff &&
      (pickupCoords.lat !== dropoffCoords.lat || pickupCoords.lng !== dropoffCoords.lng)
    ) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
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
  }, [pickupCoords, dropoffCoords, pickup, dropoff]);

  // Only show fare if both pickup and dropoff are set and directions exist
  const fareInfo =
    pickup &&
    dropoff &&
    pickupCoords &&
    dropoffCoords &&
    directions
      ? calculateFareFromDirections(directions)
      : null;

  if (!isLoaded) return <p className="text-center mt-8 text-gray-500">Loading Maps...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center p-4">
      {/* Only show booking form if ride is not requested */}
      {!rideRequested && (
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur w-full max-w-md mb-6">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Ride</h2>

            {/* Location Inputs */}
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Autocomplete
                  onLoad={(ref) => (pickupRef.current = ref)}
                  onPlaceChanged={handlePickupPlace}
                  options={autocompleteOptions}
                >
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => {
                      setPickup(e.target.value);
                      setPickupManuallyChanged(true);
                    }}
                    placeholder="Pickup location"
                    className="pl-12 h-14 w-full border border-gray-300 dark:border-gray-700 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                </Autocomplete>
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Autocomplete
                  onLoad={(ref) => (dropoffRef.current = ref)}
                  onPlaceChanged={handleDropoffPlace}
                  options={autocompleteOptions}
                >
                  <input
                    type="text"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="Dropoff location"
                    className="pl-12 h-14 w-full border border-gray-300 dark:border-gray-700 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                </Autocomplete>
              </div>
            </div>

            {/* Fare and ETA display */}
            {fareInfo && (
              <div className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-lg px-4 py-3 text-center">
                <div>
                  <span className="font-semibold">Estimated Fare:</span> ${fareInfo.fare}
                </div>
                <div>
                  <span className="font-semibold">Distance:</span> {fareInfo.distance} km
                </div>
                <div>
                  <span className="font-semibold">ETA:</span> {fareInfo.duration} min
                </div>
              </div>
            )}

            <Button
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={async () => {
                try {
                  const token = await getToken();
                  const res = await fetch(`http://localhost:3000/api/rides/request`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      pickupLocation: {
                        lat: pickupCoords?.lat,
                        lng: pickupCoords?.lng,
                        address: pickup,
                      },
                      dropoffLocation: {
                        lat: dropoffCoords?.lat,
                        lng: dropoffCoords?.lng,
                        address: dropoff,
                      },
                      paymentMethod: "cash",
                      fare: fareInfo ? Number(fareInfo.fare) : 0,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setRideRequested(true);
                    toast.success("Ride requested!", {
                      description: "Waiting for driver assignment...",
                    });
                  } else {
                    toast.error("Failed to request ride", {
                      description: data.message || data.error || "Please try again.",
                    });
                  }
                } catch (err) {
                  toast.error("Network error", {
                    description: "Please check your internet connection.",
                  });
                }
              }}
              disabled={
                !pickup ||
                !dropoff ||
                !pickupCoords ||
                !dropoffCoords ||
                !fareInfo
              }
            >
              Request Ride
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show driver info and arrival notification only if ride has not started */}
      {(
        <>
          {/* Always show driver info until ride is completed */}
          {driverInfo && (
            <div className="bg-green-100 text-green-900 rounded-lg px-4 py-3 mb-4 flex items-center gap-4">
              <img
                src={driverInfo.imageUrl}
                alt="Driver"
                className="w-16 h-16 rounded-full border-2 border-green-400 object-cover"
              />
              <div>
                <div>
                  <span className="font-semibold">Driver:</span> {driverInfo.name}
                </div>
                <div>
                  <span className="font-semibold">Car:</span> {driverInfo.car}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {driverInfo.phone}
                </div>
              </div>
            </div>
          )}
          {/* Show arrival banner only if driver has arrived and ride hasn't started */}
          {driverArrived && !rideStarted && (
            <div className="bg-green-100 text-green-900 rounded-lg px-4 py-3 mb-4">
              Your driver has arrived at the pickup location!
            </div>
          )}
        </>
      )}

      {/* Map */}
      <div className="w-full max-w-4xl h-[500px] rounded-xl overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          zoom={15}
          center={userLocation || pickupCoords || { lat: 47.5615, lng: -52.7126 }}
        >
          {pickupCoords && <Marker position={pickupCoords} label="P" />}
          {dropoffCoords && <Marker position={dropoffCoords} label="D" />}
          {directions && <DirectionsRenderer directions={directions} />}
          {/* Show driver marker if location available */}
          {driverLocation && (
            <Marker
              position={driverLocation}
              label="🚗"
              icon={{
                url: "https://cdn-icons-png.flaticon.com/512/12689/12689302.png", // Flaticon car icon
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Feedback Dialog */}
      <AlertDialog open={showFeedback} onOpenChange={setShowFeedback}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex flex-col items-center">
              <img
                src={tempDriver?.imageUrl}
                alt="Driver"
                className="w-16 h-16 rounded-full border-2 border-green-400 object-cover mb-2"
              />
              <AlertDialogTitle className="text-lg font-bold text-center">
                How was your ride with {tempDriver?.name}?
              </AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div>
              {/* Star Rating */}
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              {/* Tip Input */}
              <div className="mb-4 w-full">
                <label className="font-semibold mb-1 block text-sm text-gray-700">Add a tip (optional)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={tip ?? ""}
                  onChange={e => setTip(e.target.value === "" ? null : Number(e.target.value))}
                  placeholder="Enter tip amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg"
                />
              </div>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowFeedback(false);
                setRating(0);
                setTip(null);
                setTempDriver(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={rating === 0}
              onClick={async () => {
                await fetch("/api/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    rideId: tempDriver?.rideId,
                    driverId: tempDriver?.id,
                    riderId: userId,
                    rating,
                    tip,
                  }),
                });
                setShowFeedback(false);
                setRating(0);
                setTip(null);
                setTempDriver(null);
              }}
            >
              Submit Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
