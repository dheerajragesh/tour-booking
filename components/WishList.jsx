"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { requestWithFallback } from "@/utils/apiHelpers";
import { FiHeart } from "react-icons/fi";

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

export default function WishlistButton({ tourId }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSaved(getStoredWishlist().includes(tourId));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [tourId]);

  const handleWishlist = async () => {
    if (!tourId || loading) return;
    setLoading(true);

    try {
      await requestWithFallback("post", ["/wishlist", "/wishlists"], {
        tourId,
        tour: tourId,
      });
      setSaved(true);
      toast.success("Added to wishlist");
    } catch {
      const current = getStoredWishlist();
      const next = current.includes(tourId) ? current : [...current, tourId];
      setStoredWishlist(next);
      setSaved(true);
      toast.success("Saved locally");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={!tourId || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
      }`}
    >
      <FiHeart />
      {loading ? "Saving..." : saved ? "Saved" : "Wishlist"}
    </button>
  );
}
