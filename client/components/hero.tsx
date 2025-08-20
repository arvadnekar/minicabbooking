'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Clock, 
 
  Car,
  ArrowRight,
  Phone,
} from 'lucide-react';

export default function Herosection() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedService, setSelectedService] = useState('standard');

  const services = [
    {
      id: 'economy',
      name: 'Economy',
      description: 'Affordable rides for everyday trips',
      price: 'From $8',
      icon: Car,
      time: '3 min'
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Comfortable rides with experienced drivers',
      price: 'From $12',
      icon: Car,
      time: '2 min'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Luxury vehicles for special occasions',
      price: 'From $20',
      icon: Car,
      time: '5 min'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-white py-12 lg:py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Available 24/7
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your reliable
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">mini cab service</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Book a ride in minutes. Professional drivers, competitive prices, and 24/7 availability across the city.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
                  Book Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Us: 020 7946 0958
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Professional Drivers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:pl-12">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Ride</h2>
                      <p className="text-gray-600">Get started with your journey</p>
                    </div>

                    {/* Location Inputs */}
                    <div className="space-y-4">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="Pickup location"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          className="pl-12 h-14 text-lg"
                        />
                      </div>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="Where to?"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="pl-12 h-14 text-lg"
                        />
                      </div>
                    </div>

                    {/* Service Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Choose your service</label>
                      <div className="space-y-3">
                        {services.map((service) => {
                          const Icon = service.icon;
                          return (
                            <div
                              key={service.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedService === service.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedService(service.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Icon className="w-6 h-6 text-gray-600" />
                                  <div>
                                    <div className="font-medium text-gray-900">{service.name}</div>
                                    <div className="text-sm text-gray-600">{service.description}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-gray-900">{service.price}</div>
                                  <div className="text-sm text-gray-600 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {service.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button 
                      className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={!pickup || !destination}
                    >
                      Book Ride
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      </div>
  );
}