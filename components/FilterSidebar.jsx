"use client";

import { FiRefreshCcw, FiSliders } from "react-icons/fi";

const durations = [
  { value: "", label: "Any length" },
  { value: "1", label: "1 day" },
  { value: "3", label: "Up to 3 days" },
  { value: "7", label: "Up to 1 week" },
];

export default function FilterSidebar({ filters, setFilters }) {
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
      category: "",
      sort: "recommended",
    });
  };

  const activeCount = Object.entries(filters).reduce((acc, [key, value]) => {
    if (key === "sort") return value ? acc + 1 : acc;
    return value ? acc + 1 : acc;
  }, 0);

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/40 p-5 shadow-sm lg:sticky lg:top-24">
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

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
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
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.destination}
              placeholder="City, park, or country"
              onChange={(event) => updateFilter("destination", event.target.value)}
            />
          </label>

          <div className="border-t border-slate-100 pt-5" />

          <label className="block text-sm font-semibold text-slate-700">
            Category
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
            >
              <option value="">All categories</option>
              <option value="Adventure">Adventure</option>
              <option value="Camping">Camping</option>
              <option value="Wildlife">Wildlife</option>
              <option value="Hiking">Hiking</option>
              <option value="Cultural">Cultural</option>
              <option value="Water Sports">Water Sports</option>
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Max price
            <input
              type="number"
              min="0"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.price}
              placeholder="No limit"
              onChange={(event) => updateFilter("price", event.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Duration
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
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
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
              value={filters.sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="duration">Shortest duration</option>
            </select>
          </label>
        </div>
      </div>
    </aside>
  );
}
