import Footer from "@/components/general/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Navbar from "@/components/general/Navbar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider >
      <html lang="en" suppressHydrationWarning>
        <body className="flex flex-col min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >

          <Navbar />
          <div className="flex-grow py-5 mx-2 pt-20 md:mx-36 text-xl [&_p]:my-6">
            {children}
          </div>
          <Separator />
          <Footer />
          <Toaster richColors closeButton />
        </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
