"use client";

import api from "@/services/api";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";

export default function WishlistButton({ tourId }) {
  const handleWishlist = async () => {
    try {
      await api.post("/wishlist", { tourId });
      toast.success("Added to wishlist");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update wishlist.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={!tourId}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiHeart />
      Wishlist
    </button>
  );
}
