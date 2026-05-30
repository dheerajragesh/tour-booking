"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import TourCard from "@/components/TourCard";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import Loader from "@/components/Loader";

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [filters, setFilters] = useState({
    destination: "",
    price: "",
    duration: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/tours");
      setTours(data.tours || data || []);
    } catch (error) {
      console.error("Unable to fetch tours", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const destinationMatch = tour.destination
        .toLowerCase()
        .includes(filters.destination.toLowerCase());
      const priceMatch =
        !filters.price || tour.price <= Number(filters.price);
      const durationMatch =
        !filters.duration || tour.duration === Number(filters.duration);

      return destinationMatch && priceMatch && durationMatch;
    });
  }, [tours, filters]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Tours & Activities</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Discover curated tours, daily adventures, and unforgettable escapes.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <SearchBar
            onSearch={(query) =>
              setFilters((prev) => ({ ...prev, destination: query }))
            }
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <FilterSidebar filters={filters} setFilters={setFilters} />

        <div className="space-y-6">
          {filteredTours.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTours.map((tour) => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-10 shadow-xl text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                No tours match your filters.
              </h2>
              <p className="mt-3 text-slate-600">
                Try removing filter values or searching for a different destination.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
