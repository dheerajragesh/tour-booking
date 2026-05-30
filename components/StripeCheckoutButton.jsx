"use client";

import api from "@/services/api";

export default function StripeCheckoutButton({
  bookingId,
}) {
  const handleCheckout = async () => {
    try {
      const { data } = await api.post(
        "/payments/create-checkout-session",
        {
          bookingId,
        }
      );

      window.location.href = data.url;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-green-600 text-white px-6 py-3 rounded-lg"
    >
      Pay with Stripe
    </button>
  );
}