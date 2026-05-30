"use client";
export default function FilterSidebar({ filters,setFilters,}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-fit">
      <h2 className="text-2xl font-bold mb-6">
        Filters
      </h2>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          Destination
        </label>

        <input
          type="text"
          className="w-full border p-3 rounded"
          value={filters.destination}
          onChange={(e) =>
            setFilters({
              ...filters,
              destination: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          Max Price
        </label>

        <input
          type="number"
          className="w-full border p-3 rounded"
          value={filters.price}
          onChange={(e) =>
            setFilters({
              ...filters,
              price: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Duration
        </label>

        <select
          className="w-full border p-3 rounded"
          value={filters.duration}
          onChange={(e) =>
            setFilters({
              ...filters,
              duration: e.target.value,
            })
          }
        >
          <option value="">All</option>
          <option value="1">1 Day</option>
          <option value="3">3 Days</option>
          <option value="7">1 Week</option>
        </select>
      </div>
    </div>
  );
}