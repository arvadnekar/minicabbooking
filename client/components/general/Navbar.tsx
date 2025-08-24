"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MiniCab</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-emerald-600 transition-colors px-3 py-2 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Right-side buttons */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal"
                  forceRedirectUrl="/onboarding"
                  signUpForceRedirectUrl="/onboarding"
                   fallbackRedirectUrl="/onboarding"
                   signUpFallbackRedirectUrl="/onboarding">

                  <button className="bg-gray-700 text-white rounded-full font-medium text-sm h-10 px-4 hover:bg-gray-600 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal"
                  forceRedirectUrl="/onboarding"
                  signInForceRedirectUrl="/onboarding"
                   fallbackRedirectUrl="/onboarding"
                   signInFallbackRedirectUrl="/onboarding">
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-4 hover:bg-purple-600 transition-colors">
                    Drive with us
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-md"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200 flex flex-col gap-2">
              <SignedOut>
                <SignInButton mode="modal"
                  forceRedirectUrl="/onboarding"
                  signUpForceRedirectUrl="/onboarding"
                   fallbackRedirectUrl="/onboarding"
                   signUpFallbackRedirectUrl="/onboarding">
                  <button className="w-full bg-gray-700 text-white rounded-md h-10 hover:bg-gray-600 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal"
                  forceRedirectUrl="/onboarding"
                  signInForceRedirectUrl="/onboarding"
                   fallbackRedirectUrl="/onboarding"
                   signInFallbackRedirectUrl="/onboarding">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-md h-10 hover:from-blue-700 hover:to-purple-700 transition-colors">
                    Drive with us
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
