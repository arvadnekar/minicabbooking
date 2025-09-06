"use client";

import { useState, useRef, useEffect } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, ArrowRight, Phone } from "lucide-react";
import { Label } from "./ui/label";

export default function HeroSection() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState({ lat: 47.5615, lng: -52.7126 });
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 47.5615, lng: -52.7126 });

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const formattedTime = today.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  const [date, setDate] = useState(formattedDate);
  const [time, setTime] = useState(formattedTime);


  useEffect(() => {
    // Function to update time state
    const updateTime = () => {
      const now = new Date();
      const newTime = now.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
      setTime(newTime);
    };

    // Calculate ms until next minute
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Set timeout to update at next minute boundary
    const timeout = setTimeout(() => {
      updateTime();
      // After first update, set interval every minute
      const interval = setInterval(updateTime, 60000);
      // Store interval id so we can clear it later
      (window as any).__heroInterval = interval;
    }, msToNextMinute);

    return () => {
      clearTimeout(timeout);
      if ((window as any).__heroInterval) clearInterval((window as any).__heroInterval);
    };
  }, []);

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
    setDestination(place.formatted_address || "");
    setDropoffCoords({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  };

  if (!isLoaded) return <p className="text-center mt-8">Loading Maps...</p>;

  const isFormComplete = pickup && destination && date && time;
  return (
    <section className="relative py-12 lg:py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Available 24/7</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Your reliable
                <span className="block">
                  mini cab service
                </span>
              </h1>
              <p className="text-xl ext-gray-600 leading-relaxed">
                Book a ride in minutes. Professional drivers, competitive prices, and 24/7 availability across the city.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8 py-6">
                Book Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant={"secondary"} className="text-lg px-8 py-6">
                <Phone className="mr-2 w-5 h-5" />
                Call Us: 020 7946 0958
              </Button>
            </div>
          </div>

          {/* Booking Form + Map */}
          <div className="lg:pl-12 space-y-6">
            <Card className="shadow-2xl border-0 ">
              <CardContent className="p-8 space-y-6">
                <h2 className="text-2xl font-bold mb-2">Book Your Ride</h2>

                {/* Location Inputs */}
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                    <Autocomplete onLoad={(ref) => (pickupRef.current = ref)} onPlaceChanged={handlePickupPlace}>
                      <Input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Pickup location"
                        className="pl-12 h-14 w-full border border-gray-300 rounded-lg text-lg"
                      />
                    </Autocomplete>
                  </div>

                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                    <Autocomplete onLoad={(ref) => (dropoffRef.current = ref)} onPlaceChanged={handleDropoffPlace}>
                      <Input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Where to?"
                        className="pl-12 h-14 w-full border border-gray-300 rounded-lg text-lg"
                      />
                    </Autocomplete>
                  </div>
                </div>

                {/* Date & Time Inputs */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="block text-sm font-medium  mb-1">Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-14 text-lg"
                      min={formattedDate}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="block text-sm font-medium  mb-1">Time</Label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-14 text-lg"
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-14 text-lg"
                  variant={"default"}
                  disabled={!isFormComplete}
                >
                  See Price
                </Button>
              </CardContent>
            </Card>

            {/* Map */}
            {/* <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-lg">
              <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} zoom={12} center={pickupCoords}>
                <Marker position={pickupCoords} label="P" />
                <Marker position={dropoffCoords} label="D" />
              </GoogleMap>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
