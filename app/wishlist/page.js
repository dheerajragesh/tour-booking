"use client";

import Link from "next/link";
import { FiHeart } from "react-icons/fi";

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Wishlist
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            ❤️ Your Wishlist is Unavailable
          </h1>
          <p className="mt-3 text-slate-600">
            The wishlist feature has been removed.
          </p>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FiHeart className="mx-auto text-4xl text-rose-600" />
          <h2 className="mt-4 text-2xl font-bold text-slate-950">
            Wishlist isn’t available
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Browse tours and save favorites using the app’s updated features.
          </p>
          <Link
            href="/tours"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Browse Tours
          </Link>
        </div>
      </div>
    </main>
  );
}

