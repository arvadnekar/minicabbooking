'use client';

import { Clock, Shield, Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function Featuresection() {
    return (
      <section id="services" className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why choose MiniCab?
            </h2>
            <p className="text-xl max-w-3xl mx-auto">
              We&#39;re committed to providing safe, reliable, and affordable transportation for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Safe & Secure',
                description: 'All drivers are background checked and vehicles are regularly inspected'
              },
              {
                icon: Clock,
                title: '24/7 Available',
                description: 'Book a ride anytime, anywhere. We never sleep so you can travel when you need'
              },
              {
                icon: Star,
                title: 'Highly Rated',
                description: '4.9 star average rating from over 50,000 satisfied customers'
              },
              {
                icon: Users,
                title: 'Professional Drivers',
                description: 'Experienced, courteous drivers who know the city like the back of their hand'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                    {feature.title}
                  </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
 );
}