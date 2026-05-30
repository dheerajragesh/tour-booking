"use client";

import { useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function CreateTourPage() {
  const [form, setForm] = useState({
    title: "",
    destination: "",
    description: "",
    price: "",
    duration: "",
    images: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/tours", {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        images: form.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      toast.success("Tour created successfully");
      setForm({
        title: "",
        destination: "",
        description: "",
        price: "",
        duration: "",
        images: "",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to create tour."
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <h1 className="text-4xl font-bold mb-6 text-slate-900">
          Create New Tour
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <input
              type="text"
              name="title"
              value={form.title}
              placeholder="Tour title"
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="text"
              name="destination"
              value={form.destination}
              placeholder="Destination"
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            placeholder="Detailed description"
            rows="5"
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="grid gap-5 md:grid-cols-3">
            <input
              type="number"
              name="price"
              value={form.price}
              placeholder="Price"
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="number"
              name="duration"
              value={form.duration}
              placeholder="Duration (days)"
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="text"
              name="images"
              value={form.images}
              placeholder="Image URLs, comma separated"
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-3xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Create Tour
          </button>
        </form>
      </div>
    </div>
  );
}
