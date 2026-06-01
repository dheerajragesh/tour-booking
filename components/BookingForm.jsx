"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/tourUtils";
import { FiCalendar, FiCreditCard, FiLock, FiUsers } from "react-icons/fi";

export default function BookingForm({ tour }) {
  const router = useRouter();
  const [form, setForm] = useState({ date: "", guests: 1, paymentMethod: "stripe" });
  const [loading, setLoading] = useState(false);
  const minDate = new Date().toISOString().split("T")[0];

  const guests = Math.max(Number(form.guests || 1), 1);
  const total = useMemo(
    () => Number(tour?.price || 0) * guests,
    [tour?.price, guests]
  );

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date) {
      toast.error("Choose a travel date before checkout.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/bookings", {
        tourId: tour._id,
        date: form.date,
        bookingDate: form.date,
        guests,
        numberOfGuests: guests,
        totalPrice: total,
        paymentMethod: form.paymentMethod,
      });

      toast.success("Booking request submitted");
      setForm({ date: "", guests: 1 });
      router.push("/bookings");
    } catch (error) {
      const status = error?.response?.status;
      toast.error(
        error?.response?.data?.message ||
          (status === 401
            ? "Please login before booking this tour."
            : "Unable to create booking.")
      );

      if (status === 401) {
        router.push(`/login?redirect=/tours/${tour._id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Reserve now
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-950">
          Book this tour
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select your date and party size. The backend handles your reservation
          and checkout state.
        </p>
      </div>

      <div className="mt-6 rounded-[8px] bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-500">Price per person</span>
          <span className="font-bold text-slate-950">
            {formatPrice(tour?.price)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
          <span className="text-sm text-slate-500">Estimated total</span>
          <span className="text-xl font-black text-teal-700">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Travel date
          <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
            <FiCalendar className="text-teal-700" />
            <input
              type="date"
              name="date"
              min={minDate}
              value={form.date}
              required
              onChange={handleChange}
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </span>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Guests
          <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
            <FiUsers className="text-teal-700" />
            <input
              type="number"
              name="guests"
              min="1"
              max="20"
              value={form.guests}
              onChange={handleChange}
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </span>
        </label>

        <fieldset className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">
            Payment method
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-700 focus-within:ring-2 focus-within:ring-teal-200">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={form.paymentMethod === "stripe"}
                onChange={handleChange}
                className="h-4 w-4 accent-teal-700"
              />
              <FiCreditCard className="text-teal-700" />
              <span className="text-sm font-semibold text-slate-800">
                Stripe
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-700 focus-within:ring-2 focus-within:ring-teal-200">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={form.paymentMethod === "cash"}
                onChange={handleChange}
                className="h-4 w-4 accent-teal-700"
              />
              <span className="text-sm font-semibold text-slate-800">
                Cash on hand
              </span>
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading || !tour?._id}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiCreditCard />
          {loading ? "Booking..." : form.paymentMethod === "cash" ? "Confirm booking" : "Continue to checkout"}
        </button>
      </form>

      <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
        <FiLock className="text-teal-700" />
        Secure reservation request through the connected API.
      </p>
    </div>
  );
}
