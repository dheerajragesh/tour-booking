"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { getApiMessage } from "@/utils/apiHelpers";
import {
  FiCalendar,
  FiClock,
  FiImage,
  FiMapPin,
  FiPlusCircle,
  FiTag,
} from "react-icons/fi";

const CATEGORIES = [
  "Adventure",
  "Camping",
  "Wildlife",
  "Hiking",
  "Cultural",
  "Water Sports",
];

const initialForm = {
  title: "",
  destination: "",
  description: "",
  price: "",
  duration: "",
  category: "Adventure",
  images: "",
  latitude: "",
  longitude: "",
  availableDates: "",
  availableTimes: "09:00, 11:00, 14:00",
  addOns: "",
  maxGroupSize: "12",
  cancellationPolicy:
    "Free cancellation up to 24 hours before the tour. Operator confirmation required for custom changes.",
};

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAddOns(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, price = "0"] = line.split("|").map((part) => part.trim());
      return { name, price: Number(price || 0) };
    })
    .filter((addOn) => addOn.name);
}

export default function CreateTourPage() {
  const [form, setForm] = useState(initialForm);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [imagePreviews]);

  const parsedAddOns = useMemo(() => parseAddOns(form.addOns), [form.addOns]);
  const parsedTimes = useMemo(
    () => splitCsv(form.availableTimes),
    [form.availableTimes]
  );

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFilesChange = (event) => {
    imagePreviews.forEach((src) => URL.revokeObjectURL(src));

    const files = Array.from(event.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let base64Images = [];

      if (imageFiles.length) {
        base64Images = await Promise.all(
          imageFiles.map(
            (file) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.onerror = () => reject(new Error("Failed to read image"));
                reader.readAsDataURL(file);
              })
          )
        );
      }

      const urlImages = splitCsv(form.images);
      const lat = Number(form.latitude);
      const lng = Number(form.longitude);
      const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
      const payload = {
        title: form.title,
        destination: form.destination,
        description: form.description,
        price: Number(form.price),
        duration: Number(form.duration),
        category: form.category,
        images: [...urlImages, ...base64Images],
        availableDates: splitCsv(form.availableDates),
        availableTimes: parsedTimes,
        timeSlots: parsedTimes,
        maxGroupSize: Number(form.maxGroupSize || 0),
        addOns: parsedAddOns,
        addOnServices: parsedAddOns,
        customizationOptions: parsedAddOns,
        cancellationPolicy: form.cancellationPolicy,
        ...(hasCoordinates
          ? {
              location: { lat, lng },
              coordinates: { lat, lng },
              latitude: lat,
              longitude: lng,
            }
          : {}),
      };

      await api.post("/tours", payload);

      toast.success("Tour created successfully");
      setForm(initialForm);
      setImageFiles([]);
      imagePreviews.forEach((src) => URL.revokeObjectURL(src));
      setImagePreviews([]);
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to create tour."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Operator inventory
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Create a tour
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Publish pricing, availability, customization options, images, and
            location data from one clean workflow.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Tour title
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                required
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Destination
              <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
                <FiMapPin className="text-teal-700" />
                <input
                  type="text"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Description
            <textarea
              name="description"
              value={form.description}
              rows="5"
              onChange={handleChange}
              className="mt-2 w-full resize-none rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              required
            />
          </label>

          <div className="mt-5 grid gap-5 md:grid-cols-4">
            <label className="block text-sm font-semibold text-slate-700">
              Price
              <input
                type="number"
                name="price"
                min="0"
                value={form.price}
                onChange={handleChange}
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                required
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Duration
              <input
                type="number"
                name="duration"
                min="1"
                value={form.duration}
                onChange={handleChange}
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                required
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Max group
              <input
                type="number"
                name="maxGroupSize"
                min="1"
                value={form.maxGroupSize}
                onChange={handleChange}
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Latitude
              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Longitude
              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Available dates
              <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
                <FiCalendar className="text-teal-700" />
                <input
                  type="text"
                  name="availableDates"
                  value={form.availableDates}
                  onChange={handleChange}
                  placeholder="2026-07-12, 2026-07-15"
                  className="w-full border-0 bg-transparent text-sm outline-none"
                />
              </span>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Time slots
              <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
                <FiClock className="text-teal-700" />
                <input
                  type="text"
                  name="availableTimes"
                  value={form.availableTimes}
                  onChange={handleChange}
                  className="w-full border-0 bg-transparent text-sm outline-none"
                />
              </span>
            </label>
          </div>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Add-on services
            <textarea
              name="addOns"
              value={form.addOns}
              rows="4"
              onChange={handleChange}
              placeholder={"Trail lunch | 24\nPrivate guide | 140"}
              className="mt-2 w-full resize-none rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
            />
          </label>

          {parsedAddOns.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {parsedAddOns.map((addOn) => (
                <span
                  key={`${addOn.name}-${addOn.price}`}
                  className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800"
                >
                  <FiTag />
                  {addOn.name} {addOn.price ? `$${addOn.price}` : ""}
                </span>
              ))}
            </div>
          ) : null}

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Cancellation policy
            <textarea
              name="cancellationPolicy"
              value={form.cancellationPolicy}
              rows="3"
              onChange={handleChange}
              className="mt-2 w-full resize-none rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
            />
          </label>

          <div className="mt-6 rounded-[8px] border border-slate-200 bg-slate-50 p-5">
            <label className="block text-sm font-semibold text-slate-700">
              Add images from your device
              <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3">
                <FiImage className="text-teal-700" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                  className="block w-full cursor-pointer text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </span>
            </label>

            {imagePreviews.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {imagePreviews.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="overflow-hidden rounded-[8px] border border-slate-200 bg-white"
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Image URLs
            <input
              type="text"
              name="images"
              value={form.images}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg, https://example.com/photo-2.jpg"
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
            />
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {parsedTimes.length} time slot{parsedTimes.length === 1 ? "" : "s"} ready.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlusCircle />
              {loading ? "Creating..." : "Create tour"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
