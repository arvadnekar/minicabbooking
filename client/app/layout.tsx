import NavBar from "@/components/general/Navbar";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/general/Footer";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey="pk_test_aHVtYW5lLWFudC0yNC5jbGVyay5hY2NvdW50cy5kZXYk">
      <html lang="en" suppressHydrationWarning>
        <body className="flex flex-col min-h-screen">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
              <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-extrabold tracking-wide">🚖 MiniCab</h1>
                  <span className="text-sm opacity-80">Your trusted ride booking partner</span>
                </div>
                <NavBar />
              </div>
            </header>
            <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
