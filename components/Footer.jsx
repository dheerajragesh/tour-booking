import Link from "next/link";
import { FiCompass, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 text-xl font-black">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-teal-600">
              <FiCompass />
            </span>
            TourBook
          </Link>
          <p className="mt-5 max-w-md leading-7 text-slate-300">
            A polished marketplace for discovering vetted tours, comparing trip
            details, and completing bookings with confidence.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Explore
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-300">
            <Link href="/tours" className="hover:text-white">
              Tours
            </Link>
            <Link href="/bookings" className="hover:text-white">
              My bookings
            </Link>
            <Link href="/wishlist" className="hover:text-white">
              Wishlist
            </Link>
            <Link href="/profile" className="hover:text-white">
              Profile
            </Link>

          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Support
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-3">
              <FiMail className="text-teal-400" />
              support@tourbook.test
            </span>
            <span className="inline-flex items-center gap-3">
              <FiPhone className="text-teal-400" />
              +1 555 010 2040
            </span>
            <span className="inline-flex items-center gap-3">
              <FiMapPin className="text-teal-400" />
              Global tour marketplace
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-sm text-slate-400">
        <p>Copyright 2026 TourBook. All rights reserved.</p>
      </div>
    </footer>
  );
}
