"use client";

import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex gap-4 mb-8">
      <input
        type="text"
        placeholder="Search destination"
        className="border p-3 rounded w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={() => onSearch(query)}
        className="bg-blue-600 text-white px-6 rounded"
      >
        Search
      </button>
    </div>
  );
}