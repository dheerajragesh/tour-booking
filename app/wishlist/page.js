"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import Loader from "@/components/Loader";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";
import TourCard from "@/components/TourCard";
import { FALLBACK_TOURS, getItemId } from "@/utils/tourUtils";

const STORAGE_KEY = "tourbook_wishlist";

function getStoredWishlist() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setStoredWishlist(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function WishlistPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");

      const storedIds = getStoredWishlist();

      try {
        if (!storedIds.length) {
          setItems([]);
          return;
        }

        // Best-effort: ask backend for the tours if it supports it.
        // Fallback: show local-only by using backend /tours endpoints.
        const { data } = await api.get(`/tours?ids=${storedIds.join(",")}`);
        const tours = data?.tours || data?.data?.tours || data?.toursList || data;

        if (Array.isArray(tours)) {
          setItems(tours);
        } else {
          // fallback to all tours search (client-side)
          const allTours = await api.get("/tours");
          const list = allTours?.data?.tours || allTours?.data?.data?.tours || [];
          setItems(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        // Final fallback: show hardcoded sample tours only.
        setError("Could not load wishlist from server. Showing local favorites only.");
        const fallback = Array.isArray(FALLBACK_TOURS) ? FALLBACK_TOURS : [];
        setItems(
          fallback.filter((t) => storedIds.includes(String(getItemId(t))))
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const savedIds = useMemo(() => {
    return items.map((t) => String(getItemId(t)));
  }, [items]);

  const storedCount = useMemo(() => getStoredWishlist().length, []);

  if (loading) return <Loader label="Loading wishlist..." />;

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Wishlist
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Saved tours
          </h1>
          <p className="mt-3 text-slate-600">
            Your favorites from the Wishlist button. ({storedCount} saved)
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-[8px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
            {error}
          </div>
        ) : null}

        {!items.length ? (
          <div className="rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <FiHeart className="mx-auto text-4xl text-rose-600" />
            <h2 className="mt-4 text-2xl font-bold text-slate-950">No saved tours</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Use the Wishlist button on any tour to save it here.
            </p>
            <Link
              href="/tours"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Browse tours
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((tour, idx) => (
              <TourCard key={getItemId(tour) || idx} tour={tour} index={idx} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

