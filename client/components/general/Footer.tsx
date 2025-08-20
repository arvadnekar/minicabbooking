import { Car } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
  <footer id="contact" className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">MiniCab</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your trusted partner for reliable, safe, and affordable transportation across the city.
              </p>
              <div className="text-gray-400">
                <p>📞 020 7946 0958</p>
                <p>✉️ info@minicab.com</p>
                <p>📍 Newfoundland, Canada</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Airport Transfer</li>
                <li>City Rides</li>
                <li>Corporate Travel</li>
                <li>Event Transportation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
               <li><Link href="/about">About Us</Link></li>
                <li><Link href="#about">Privacy Policy</Link></li>
                <li><Link href="#about">Terms of Service</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MiniCab. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}
