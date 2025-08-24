"use client";
import { useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript, Autocomplete } from "@react-google-maps/api";

export default function RiderDashboard() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState({ lat: 47.5615, lng: -52.7126 });
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 47.5615, lng: -52.7126 });

  const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const handlePickupPlace = () => {
    const place = pickupRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    setPickup(place.formatted_address || "");
    setPickupCoords({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
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

  if (!isLoaded) return <p className="text-center mt-8 text-gray-500">Loading Maps...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">Book a Ride</h1>

      {/* Input Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-full max-w-md mb-6">
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pickup Location
            </label>
            <Autocomplete onLoad={(ref) => (pickupRef.current = ref)} onPlaceChanged={handlePickupPlace}>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup point"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </Autocomplete>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dropoff Location
            </label>
            <Autocomplete onLoad={(ref) => (dropoffRef.current = ref)} onPlaceChanged={handleDropoffPlace}>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Enter dropoff point"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </Autocomplete>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition">
            Request Ride
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="w-full max-w-4xl h-[500px] rounded-xl overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          zoom={12}
          center={pickupCoords}
        >
          <Marker position={pickupCoords} label="P" />
          <Marker position={dropoffCoords} label="D" />
        </GoogleMap>
      </div>
    </div>
  );
}
