"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Categories from "@/components/Categories";
import SearchBar from "@/components/SearchBar";
import TourCard from "@/components/TourCard";
import api from "@/services/api";
import {
  FALLBACK_TOUR_IMAGES,
  FALLBACK_TOURS,
  normalizeList,
} from "@/utils/tourUtils";
import {
  FiArrowRight,
  FiCheckCircle,
  FiGlobe,
  FiShield,
  FiStar,
} from "react-icons/fi";

const stats = [
  { value: "4.8/5", label: "Average traveler rating" },
  { value: "120+", label: "Curated experiences" },
  { value: "24h", label: "Booking support" },
];

export default function Home() {
  const router = useRouter();
  const [featuredTours, setFeaturedTours] = useState(FALLBACK_TOURS);

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      try {
        const { data } = await api.get("/tours");
        const tours = normalizeList(data, "tours");
        if (tours.length) setFeaturedTours(tours.slice(0, 3));
      } catch {
        setFeaturedTours(FALLBACK_TOURS);
      }
    };

    fetchFeaturedTours();
  }, []);

  const handleSearch = (query) => {
    const params = new URLSearchParams();
    if (query) params.set("destination", query);
    router.push(`/tours${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-10 lg:py-14">
          <div className="flex flex-col justify-center">


            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700">
              <FiShield />
              Verified operators and secure booking
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Book remarkable tours without the travel guesswork.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Compare vetted experiences, see clear pricing, reserve dates, and
              manage every booking from a marketplace built for travelers.
            </p>

            <div className="mt-8 max-w-2xl">
              <SearchBar onSearch={handleSearch} />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[8px] border border-slate-200 bg-[#f7f4ef] p-4">
                  <p className="text-2xl font-black text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-[8px] bg-slate-100">
            <img
              src={FALLBACK_TOUR_IMAGES[0]}
              alt="Mountain lake tour destination"
              className="h-full min-h-[520px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[8px] bg-white/95 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
                    Trending now
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Moraine Lake Explorer
                  </h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                  <FiStar />
                  4.9
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <FiCheckCircle className="text-teal-700" />
                  Small groups
                </span>
                <span className="inline-flex items-center gap-2">
                  <FiGlobe className="text-teal-700" />
                  Local guides
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
              Choose the experience you want
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Explore popular categories
            </h2>
          </div>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-slate-950"
          >
            View all tours
            <FiArrowRight />
          </Link>
        </div>

        <div className="mt-8">
          <Categories />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
                Featured tours
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                Best picks for your next trip
              </h2>
            </div>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Browse marketplace
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map((tour, index) => (
              <TourCard key={tour._id || tour.title} tour={tour} index={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
