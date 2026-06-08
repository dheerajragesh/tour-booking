"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getApiMessage, requestWithFallback } from "@/utils/apiHelpers";
import { getItemId } from "@/utils/tourUtils";
import { FiCreditCard } from "react-icons/fi";

export default function StripeCheckoutButton({ bookingId, booking }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const tour = booking?.tour || booking?.tourId || booking?.tourPlan || {};
      const participants = Math.max(
        Number(
          booking?.travelers ||
            booking?.participants ||
            booking?.guests ||
            booking?.numberOfGuests ||
            1
        ),
        1
      );
      const unitPrice = Number(
        tour?.price ||
          (Number(booking?.totalPrice || booking?.amount || 0) / participants)
      );

      const { data } = await requestWithFallback(
        "post",
        [
          "/payments/checkout",
          "/payments/create-checkout-session",
          "/payments/checkout-session",
          "/stripe/create-checkout-session",
        ],
        {
          bookingId,
          booking: bookingId,
          tourId: getItemId(tour) || booking?.tourId,
          title: tour?.title || booking?.tourTitle || "Tour booking",
          price: unitPrice,
          participants,
        }
      );

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to start Stripe checkout."));
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={!bookingId || loading}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiCreditCard />
      {loading ? "Opening checkout..." : "Pay securely"}
    </button>
  );
}
