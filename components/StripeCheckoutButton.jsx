"use client";

import api from "@/services/api";
import toast from "react-hot-toast";
import { FiCreditCard } from "react-icons/fi";

export default function StripeCheckoutButton({ bookingId }) {
  const handleCheckout = async () => {
    try {
      const { data } = await api.post("/payments/create-checkout-session", {
        bookingId,
      });

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to start Stripe checkout."
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={!bookingId}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiCreditCard />
      Pay securely
    </button>
  );
}
