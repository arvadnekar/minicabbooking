"use client";
import { useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

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
  const { getToken } = useAuth();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickupManuallyChanged, setPickupManuallyChanged] = useState(false);

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

      {/* Card Layout */}
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
                  alert("Ride requested!");
                } else {
                  alert(data.error || "Failed to request ride");
                }
              } catch (err) {
                alert("Network error");
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

      {/* Map */}
      <div className="w-full max-w-4xl h-[500px] rounded-xl overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          zoom={12}
          center={userLocation || pickupCoords || { lat: 47.5615, lng: -52.7126 }}
        >
          {pickupCoords && <Marker position={pickupCoords} label="P" />}
          {dropoffCoords && <Marker position={dropoffCoords} label="D" />}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </div>
  );
}
