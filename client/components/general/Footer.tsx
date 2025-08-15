export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 text-center py-4">
      <p className="text-sm">
        &copy; {new Date().getFullYear()}{" "}
        <span className="font-semibold text-white">MiniCab</span>. All rights reserved.
      </p>
      <p className="text-xs mt-1">Your trusted ride booking service</p>
    </footer>
  );
}
