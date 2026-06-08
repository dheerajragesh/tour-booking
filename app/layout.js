import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "TourBook | Curated Tour Booking Marketplace",
  description:
    "Discover, compare, and book trusted tours and travel experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <Toaster position="top-right" />
          <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

