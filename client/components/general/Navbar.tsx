import { ThemeToggle } from "./theme-toggle";

export default function NavBar() {
  return (
    <nav className="flex items-center space-x-6 text-sm text-white">
      <a href="#" className="hover:text-yellow-300 transition-colors">Book Ride</a>
      <a href="#" className="hover:text-yellow-300 transition-colors">Drive</a>
      <a href="/about" className="hover:text-yellow-300 transition-colors">About Us</a>
      <a href="/contact" className="hover:text-yellow-300 transition-colors">Contact Us</a>

      {/* Theme Toggle Button on the right */}
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}
