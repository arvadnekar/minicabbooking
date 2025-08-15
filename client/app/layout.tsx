import NavBar from "@/components/general/Navbar";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/general/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
              {/* Logo / Brand */}
              <div className="flex flex-col">
                <h1 className="text-2xl font-extrabold tracking-wide">
                  🚖 MiniCab
                </h1>
                <span className="text-sm opacity-80">
                  Your trusted ride booking partner
                </span>
              </div>

              {/* NavBar Component */}
              <NavBar />
            </div>
          </header>
          {/* Main Content */}
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
          {/* Footer */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
