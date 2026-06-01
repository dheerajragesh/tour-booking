"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import FilterSidebar from "@/components/FilterSidebar";
import Loader from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import TourCard from "@/components/TourCard";
import {
  FALLBACK_TOURS,
  getRating,
  normalizeList,
} from "@/utils/tourUtils";

const initialFilters = {
  destination: "",
  price: "",
  duration: "",
  category: "",
  sort: "recommended",
};

function getInitialFilters() {
  if (typeof window === "undefined") return initialFilters;

  const params = new URLSearchParams(window.location.search);

  return {
    ...initialFilters,
    destination: params.get("destination") || "",
    category: params.get("category") || "",
  };
}

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [filters, setFilters] = useState(getInitialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/tours");
        const list = normalizeList(data, "tours");
        setTours(list.length ? list : FALLBACK_TOURS);
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            "Showing sample tours because the API is not reachable."
        );
        setTours(FALLBACK_TOURS);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const filteredTours = useMemo(() => {
    const destinationQuery = filters.destination.trim().toLowerCase();
    const categoryQuery = filters.category.trim().toLowerCase();
    const maxPrice = Number(filters.price);
    const maxDuration = Number(filters.duration);

    const results = tours.filter((tour) => {
      const destination = String(tour.destination || "").toLowerCase();
      const title = String(tour.title || "").toLowerCase();
      const category = String(tour.category || "").toLowerCase();
      const price = Number(tour.price || 0);
      const duration = Number(tour.duration || 0);

      const destinationMatch =
        !destinationQuery ||
        destination.includes(destinationQuery) ||
        title.includes(destinationQuery);
      const categoryMatch = !categoryQuery || category.includes(categoryQuery);
      const priceMatch = !maxPrice || price <= maxPrice;
      const durationMatch = !maxDuration || duration <= maxDuration;

      return destinationMatch && categoryMatch && priceMatch && durationMatch;
    });

    return [...results].sort((a, b) => {
      if (filters.sort === "price-low") return Number(a.price || 0) - Number(b.price || 0);
      if (filters.sort === "price-high") return Number(b.price || 0) - Number(a.price || 0);
      if (filters.sort === "duration") return Number(a.duration || 0) - Number(b.duration || 0);

      const ratingB = Number.parseFloat(getRating(b));
      const ratingA = Number.parseFloat(getRating(a));
      return (Number.isNaN(ratingB) ? 0 : ratingB) - (Number.isNaN(ratingA) ? 0 : ratingA);
    });
  }, [tours, filters]);

  if (loading) return <Loader label="Loading tours..." />;

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Tour marketplace
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Compare tours, prices, and availability.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Search destinations, narrow by category, sort by price or trip
                length, then book directly through the connected backend.
              </p>
            </div>
            <SearchBar
              key={filters.destination}
              compact
              defaultValue={filters.destination}
              onSearch={(query) =>
                setFilters((current) => ({ ...current, destination: query }))
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {error ? (
          <div className="mb-6 rounded-[8px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
          <FilterSidebar filters={filters} setFilters={setFilters} />

          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {filteredTours.length} tour{filteredTours.length === 1 ? "" : "s"} found
              </p>
              <p className="text-sm text-slate-500">
                Prices and availability are served by your API.
              </p>
            </div>

            {filteredTours.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredTours.map((tour, index) => (
                  <TourCard key={tour._id || `${tour.title}-${index}`} tour={tour} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-slate-950">
                  No tours match your filters.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-slate-600">
                  Try clearing a filter, increasing your max price, or searching
                  a nearby destination.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
