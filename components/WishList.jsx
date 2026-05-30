"use client";

import api from "@/services/api";
import toast from "react-hot-toast";

export default function WishlistButton({ tourId }) {
  const handleWishlist = async () => {
    try {
      await api.post("/wishlist", {
        tourId,
      });

      toast.success("Added to Wishlist");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <button
      onClick={handleWishlist}
      className="bg-pink-500 text-white px-4 py-2 rounded-lg"
    >
      ❤️ Wishlist
    </button>
  );
}