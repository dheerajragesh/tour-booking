"use client";
import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function AddReview({ tourId }) {
  const [form, setForm] = useState({
    rating: 5,
    comment: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/reviews", {
        ...form,
        tourId,
      });

      toast.success("Review Added");

      setForm({
        rating: 5,
        comment: "",
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6">
        Leave a Review
      </h2>

      <select
        className="w-full border p-3 rounded mb-4"
        value={form.rating}
        onChange={(e) =>
          setForm({
            ...form,
            rating: e.target.value,
          })
        }
      >
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>

      <textarea
        rows="5"
        placeholder="Write your review"
        className="w-full border p-3 rounded mb-4"
        value={form.comment}
        onChange={(e) =>
          setForm({
            ...form,
            comment: e.target.value,
          })
        }
      />

      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
        Submit Review
      </button>
    </form>
  );
}