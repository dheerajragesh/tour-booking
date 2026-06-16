"use client";

import { FiMapPin, FiRefreshCcw, FiSliders } from "react-icons/fi";

const durations = [
  { value: "", label: "Any length" },
  { value: "1", label: "1 day" },
  { value: "3", label: "Up to 3 days" },
  { value: "7", label: "Up to 1 week" },
];

export default function FilterSidebar({
  filters,
  setFilters,
  locationStatus = "",
  onUseMyLocation,
  onClearLocation,
}) {
  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      destination: "",
      price: "",
      duration: "",
      categories: [],
      category: "", // backward compat
      nearby: false,
      radius: "50",
      sort: "recommended",
    });
    onClearLocation?.();
  };


  const activeCount = Object.entries(filters).reduce((acc, [key, value]) => {
    if (key === "sort") return value && value !== "recommended" ? acc + 1 : acc;
    if (key === "radius") return filters.nearby ? acc + 1 : acc;
    if (key === "categories") return Array.isArray(value) && value.length ? acc + 1 : acc;
    if (key === "category") return value ? acc + 1 : acc;
    return value ? acc + 1 : acc;
  }, 0);


  return (
    <aside className="h-fit rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
            <FiSliders className="text-teal-700" />
            Filters
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Refine your search
            {activeCount > 0 ? ` • ${activeCount} active` : ""}
          </p>
        </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-700 hover:shadow"
          >
          <FiRefreshCcw className="text-teal-700" />
          Reset
        </button>
      </div>

      <div className="mt-5 rounded-[8px] border border-slate-200 bg-white p-4">
        <div className="grid gap-5">
          <label className="block text-sm font-semibold text-slate-700">
            <span className="flex items-center justify-between">
              Destination
              {filters.destination ? (
                <span className="text-xs font-bold text-teal-700">Set</span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">Optional</span>
              )}
            </span>
            <input
              type="text"
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.destination}
              placeholder="City, park, or country"
              onChange={(event) => updateFilter("destination", event.target.value)}
            />
          </label>

          <div className="border-t border-slate-100 pt-5" />

          <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiMapPin className="text-teal-700" />
                  Nearby search
                </p>
                {locationStatus ? (
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {locationStatus}
                  </p>
                ) : null}
              </div>
              {filters.nearby ? (
                <button
                  type="button"
                  onClick={() => {
                    updateFilter("nearby", false);
                    onClearLocation?.();
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-teal-700 hover:text-teal-700"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onUseMyLocation}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <FiMapPin />
              Use my location
            </button>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Radius
              <select
                className="mt-2 w-full rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
                value={filters.radius}
                disabled={!filters.nearby}
                onChange={(event) => updateFilter("radius", event.target.value)}
              >
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
                <option value="250">250 miles</option>
                <option value="1000">1000 miles</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Categories
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                "International Tours",
                "Domestic Tour",
                "Honey moon Tours",
                "Family Tours",
                "Luxury Tours",
                "Budget tour",
              ].map((cat) => {
                const selected = Array.isArray(filters.categories)
                  ? filters.categories.includes(cat)
                  : false;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      const current = Array.isArray(filters.categories)
                        ? filters.categories
                        : [];
                      const next = selected
                        ? current.filter((c) => c !== cat)
                        : [...current, cat];
                      updateFilter("categories", next);
                      // keep legacy single category filter in sync
                      updateFilter("category", next[0] || "");
                    }}
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                      selected
                        ? "border-teal-700 bg-teal-50 text-teal-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Select multiple categories.
            </p>
          </label>


          <label className="block text-sm font-semibold text-slate-700">
            Max price
            <input
              type="number"
              min="0"
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.price}
              placeholder="No limit"
              onChange={(event) => updateFilter("price", event.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Duration
            <select
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.duration}
              onChange={(event) => updateFilter("duration", event.target.value)}
            >
              {durations.map((duration) => (
                <option key={duration.value || "all"} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Sort by
            <select
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="duration">Shortest duration</option>
              <option value="nearest">Nearest first</option>
            </select>
          </label>
        </div>
      </div>
    </aside>
  );
}
