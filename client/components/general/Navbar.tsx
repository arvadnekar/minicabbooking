import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";

export default function NavBar() {
  return (
    <nav className="flex items-center space-x-6 text-sm text-white">
      <a href="#" className="hover:text-yellow-300 transition-colors">Book Ride</a>
      <a href="#" className="hover:text-yellow-300 transition-colors">Drive</a>
      <a href="/about" className="hover:text-yellow-300 transition-colors">About Us</a>
      <a href="/contact" className="hover:text-yellow-300 transition-colors">Contact Us</a>

      {/* Theme Toggle Button on the right */}
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />

        <SignedOut>
          {/* Sign In redirects existing users to dashboard */}
          <SignInButton>
            <button className="bg-gray-700 text-white rounded-full font-medium text-sm h-10 px-4 hover:bg-gray-600 transition-colors">
              Sign In
            </button>
          </SignInButton>

          {/* Sign Up redirects new users to role selection */}
          <SignUpButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-4 hover:bg-purple-600 transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          {/* User menu */}
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
