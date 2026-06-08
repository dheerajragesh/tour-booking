"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import AIGuide from "@/components/AIGuide";
import FilterSidebar from "@/components/FilterSidebar";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import TourCard from "@/components/TourCard";
import {
  FALLBACK_TOURS,
  getDistanceMiles,
  getRating,
  getTourCoordinates,
  normalizeList,
} from "@/utils/tourUtils";

const initialFilters = {
  destination: "",
  price: "",
  duration: "",
  category: "",
  nearby: false,
  radius: "50",
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
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 9;

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
    const radius = Number(filters.radius || 50);

    const normalize = (s) =>
      String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const tokenize = (s) =>
      normalize(s)
        .split(" ")
        .filter(Boolean);

    const queryTokens = destinationQuery
      ? tokenize(destinationQuery)
      : [];

    const annotatedTours = tours.map((tour) => {
      const coordinates = getTourCoordinates(tour);
      const distance =
        userLocation && coordinates
          ? getDistanceMiles(userLocation, coordinates)
          : null;

      return { tour, distance };
    });

    const results = annotatedTours.filter(({ tour, distance }) => {
      const destination = normalize(tour.destination);
      const title = normalize(tour.title);
      const category = normalize(tour.category);
      const price = Number(tour.price || 0);
      const duration = Number(tour.duration || 0);

      const categoryMatch = !categoryQuery || category.includes(categoryQuery);
      const priceMatch = !maxPrice || price <= maxPrice;
      const durationMatch = !maxDuration || duration <= maxDuration;
      const nearbyMatch =
        !filters.nearby || (distance !== null && distance <= radius);

      if (!destinationQuery) {
        return categoryMatch && priceMatch && durationMatch && nearbyMatch;
      }

      // E-commerce style matching: token-based AND match.
      // Each query token must appear either in destination or title.
      const destinationTokensMatch = queryTokens.every(
        (t) => destination.includes(t) || title.includes(t)
      );

      return (
        destinationTokensMatch &&
        categoryMatch &&
        priceMatch &&
        durationMatch &&
        nearbyMatch
      );
    });

    return [...results].sort((a, b) => {
      if (filters.sort === "nearest" || filters.nearby) {
        return (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY);
      }

      if (filters.sort === "price-low") return Number(a.tour.price || 0) - Number(b.tour.price || 0);
      if (filters.sort === "price-high") return Number(b.tour.price || 0) - Number(a.tour.price || 0);
      if (filters.sort === "duration") return Number(a.tour.duration || 0) - Number(b.tour.duration || 0);

      const ratingB = Number.parseFloat(getRating(b.tour));
      const ratingA = Number.parseFloat(getRating(a.tour));
      return (Number.isNaN(ratingB) ? 0 : ratingB) - (Number.isNaN(ratingA) ? 0 : ratingA);
    }).map(({ tour, distance }) =>
      distance === null ? tour : { ...tour, distanceMiles: distance }
    );
  }, [tours, filters, userLocation]);

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredTours.slice(start, end);
  }, [filteredTours, currentPage]);
  const resultStart = filteredTours.length
    ? (currentPage - 1) * pageSize + 1
    : 0;
  const resultEnd = Math.min(currentPage * pageSize, filteredTours.length);

  const updateFilters = (updater) => {
    setPage(1);
    setFilters((current) =>
      typeof updater === "function" ? updater(current) : updater
    );
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not supported in this browser.");
      return;
    }

    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("Showing tours near your current location.");
        updateFilters((current) => ({
          ...current,
          nearby: true,
          sort: "nearest",
        }));
      },
      () => {
        setLocationStatus("Location permission was not granted.");
        setUserLocation(null);
        updateFilters((current) => ({
          ...current,
          nearby: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setLocationStatus("");
  };

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
                updateFilters((current) => ({
                  ...current,
                  destination: query,
                }))
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
          <FilterSidebar
            filters={filters}
            setFilters={updateFilters}
            locationStatus={locationStatus}
            onUseMyLocation={handleUseMyLocation}
            onClearLocation={handleClearLocation}
          />

          <div>
            <AIGuide
              tours={filteredTours}
              filters={filters}
              onApplySuggestion={(suggestion) =>
                updateFilters((current) => ({ ...current, ...suggestion }))
              }
            />

            <div className="mb-5 mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {filteredTours.length} tour{filteredTours.length === 1 ? "" : "s"} found
              </p>
              <p className="text-sm text-slate-500">
                {filteredTours.length
                  ? `Showing ${resultStart}-${resultEnd}`
                  : "Prices and availability are served by your API."}
              </p>
            </div>

            {filteredTours.length ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedTours.map((tour, index) => (
                    <TourCard
                      key={tour._id || `${tour.title}-${index}`}
                      tour={tour}
                      index={(currentPage - 1) * pageSize + index}
                    />
                  ))}
                </div>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
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
