"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";

function normalizeQuery(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SearchBar({
  onSearch,
  defaultValue = "",
  compact = false,
  placeholder = "Search destinations or experiences",
  debounceMs = 350,
  enableDebounce = true,
}) {
  const [query, setQuery] = useState(defaultValue);
  const latestValueRef = useRef(query);

  useEffect(() => {
    latestValueRef.current = query;
  }, [query]);

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);

  useEffect(() => {
    if (!enableDebounce) return;

    const t = setTimeout(() => {
      onSearch?.(normalizedQuery);
    }, debounceMs);

    return () => clearTimeout(t);
  }, [normalizedQuery, debounceMs, enableDebounce, onSearch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(normalizedQuery);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm ${
        compact ? "max-w-xl" : ""
      }`}
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3">
        <FiSearch className="shrink-0 text-teal-700" />
        <span className="sr-only">Search destination</span>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!event.target.value.trim() && !enableDebounce) {
              onSearch?.("");
            }
          }}
        />
      </label>

      <button
        type="submit"
        className="shrink-0 bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        Search
      </button>
    </form>
  );
}

