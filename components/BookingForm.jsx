"use client";

import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function BookingForm({ tour }) {
  const [form, setForm] = useState({ date: "", guests: 1 });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/bookings", {
        tourId: tour._id,
        date: form.date,
        guests: Number(form.guests),
      });

      toast.success("Booking request submitted");
      setForm({ date: "", guests: 1 });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to create booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-8 shadow-xl border border-slate-200">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Book this tour</h2>
        <p className="text-slate-500 mt-2">
          Reserve your spot with flexible payment and instant confirmation.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 border border-slate-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500">Price per person</span>
          <span className="text-xl font-bold text-slate-900">
            ${tour.price}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Estimated total</span>
          <span className="text-xl font-semibold text-blue-600">
            ${tour.price * Number(form.guests)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            name="date"
            value={form.date}
            required
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Guests
          <input
            type="number"
            name="guests"
            min="1"
            value={form.guests}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-3xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Booking..." : "Continue to Checkout"}
        </button>
      </form>
    </div>
  );
}
