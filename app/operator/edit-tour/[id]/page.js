"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  FiCalendar,
  FiClock,
  FiImage,
  FiMapPin,
  FiPlusCircle,
  FiTag,
} from "react-icons/fi";
import { PROFESSIONAL_TOUR_CATEGORIES } from "@/utils/categories";
import { getApiMessage } from "@/utils/apiHelpers";

const CATEGORIES = PROFESSIONAL_TOUR_CATEGORIES;

const initialForm = {
  title: "",
  destination: "",
  description: "",
  price: "",
  duration: "",
  categories: [],
  // legacy single category
  category: "International Tours",

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

function stringifyAddOns(addOns) {
  if (!Array.isArray(addOns) || !addOns.length) return "";
  // backend shape assumed: [{ name, price }]
  return addOns
    .map((a) => `${a?.name || ""} | ${Number(a?.price || 0)}`.trim())
    .filter(Boolean)
    .join("\n");
}

function normalizeFetchedTour(tour) {
  const categories = Array.isArray(tour?.categories)
    ? tour.categories
    : tour?.category
      ? [tour.category]
      : [];

  const availableTimes = Array.isArray(tour?.availableTimes)
    ? tour.availableTimes.join(", ")
    : tour?.availableTimes || "";

  const urlImages = Array.isArray(tour?.images) ? tour.images : [];

  const lat = tour?.location?.lat ?? tour?.coordinates?.lat ?? tour?.latitude ?? "";
  const lng = tour?.location?.lng ?? tour?.coordinates?.lng ?? tour?.longitude ?? "";

  return {
    title: tour?.title ?? "",
    destination: tour?.destination ?? "",
    description: tour?.description ?? "",
    price: tour?.price ?? "",
    duration: tour?.duration ?? "",
    categories,
    category: categories[0] || tour?.category || "International Tours",

    images: urlImages.join(", "),
    latitude: lat !== undefined && lat !== null ? String(lat) : "",
    longitude: lng !== undefined && lng !== null ? String(lng) : "",
    availableDates: Array.isArray(tour?.availableDates)
      ? tour.availableDates.join(", ")
      : tour?.availableDates ?? "",
    availableTimes: availableTimes || "",
    addOns: stringifyAddOns(tour?.addOns || tour?.customizationOptions || []),
    maxGroupSize:
      tour?.maxGroupSize ?? tour?.maxGroup ?? tour?.maxGroupSize ?? "",
    cancellationPolicy:
      tour?.cancellationPolicy ??
      "Free cancellation up to 24 hours before the tour. Operator confirmation required for custom changes.",
  };
}

export default function EditTourPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const parsedAddOns = useMemo(() => parseAddOns(form.addOns), [form.addOns]);
  const parsedTimes = useMemo(
    () => splitCsv(form.availableTimes),
    [form.availableTimes]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (!id) return;

    const fetchTour = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tours/${id}`);
        const tour = data?.tour || data;
        setForm(normalizeFetchedTour(tour));
      } catch (e) {
        toast.error(getApiMessage(e, "Unable to load tour for editing."));
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

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
    if (!id) return;

    setSubmitting(true);

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
        categories: form.categories,
        category: form.categories[0] || form.category,

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

      // Backend supports PUT /tours/:id
      await api.put(`/tours/${id}`, payload);

      toast.success("Tour updated successfully");
      router.push("/operator/Dashboard");
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to update tour."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ef]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
              Operator inventory
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Edit a tour
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">Loading tour details...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Operator inventory
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Edit a tour
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Update pricing, availability, customization options, and images.
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
              Categories
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  const selected = form.categories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setForm((current) => {
                          const next = selected
                            ? current.categories.filter((c) => c !== category)
                            : [...current.categories, category];
                          return {
                            ...current,
                            categories: next,
                            category: next[0] || current.category,
                          };
                        });
                      }}
                      className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                        selected
                          ? "border-teal-700 bg-teal-50 text-teal-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Select multiple categories for this tour.
              </p>
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
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlusCircle />
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

