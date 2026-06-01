"use client";

import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { FiEdit3, FiSend } from "react-icons/fi";

export default function AddReview({ tourId }) {
  const [form, setForm] = useState({
    rating: 5,
    comment: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/reviews", {
        ...form,
        rating: Number(form.rating),
        tourId,
      });

      toast.success("Review added");
      setForm({ rating: 5, comment: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to add review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[8px] bg-slate-50 p-5">
      <h3 className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
        <FiEdit3 className="text-teal-700" />
        Leave a review
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <label className="block text-sm font-semibold text-slate-700">
          Rating
          <select
            className="mt-2 w-full rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700"
            value={form.rating}
            onChange={(event) =>
              setForm((current) => ({ ...current, rating: event.target.value }))
            }
          >
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Comment
          <textarea
            rows="4"
            placeholder="Share what made the trip stand out"
            className="mt-2 w-full resize-none rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700"
            value={form.comment}
            required
            onChange={(event) =>
              setForm((current) => ({ ...current, comment: event.target.value }))
            }
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !tourId}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiSend />
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
