"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { PROFESSIONAL_TOUR_CATEGORIES } from "@/utils/categories";

export default function MultiSelectCategories({
  value,
  onChange,
  categories = PROFESSIONAL_TOUR_CATEGORIES,
  placeholder = "Select categories...",
  label,
  required,
  allowClear = true,
}) {
  const selected = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const rootRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    if (!open) {
      // reset search when closing without setState inside the effect body
      // (avoids eslint cascade-render warning)
      queueMicrotask(() => setQuery(""));
      return;
    }

    setTimeout(() => {
      searchRef.current?.focus?.();
    }, 0);
  }, [open]);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, query]);

  const toggleCategory = (cat) => {
    const isSelected = selected.includes(cat);
    const next = isSelected
      ? selected.filter((c) => c !== cat)
      : [...selected, cat];
    onChange?.(next);
  };

  const removeCategory = (cat) => {
    onChange?.(selected.filter((c) => c !== cat));
  };

  const clearAll = () => {
    onChange?.([]);
  };

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
          {required ? (
            <span className="ml-2 text-xs font-bold text-rose-600">*</span>
          ) : null}
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex w-full flex-wrap items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.length ? (
          selected.map((cat) => (
            <span
              key={cat}
              className="group inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800"
            >
              {cat}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeCategory(cat);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    removeCategory(cat);
                  }
                }}
                className="hidden cursor-pointer rounded-full p-0.5 text-teal-800 group-hover:block"
                aria-label={`Remove ${cat}`}
              >
                <FiX size={14} />
              </span>
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">{placeholder}</span>
        )}

        <span className="ml-auto inline-flex items-center gap-2 text-slate-500">
          <FiSearch className="text-teal-700" />
          <span className="text-xs font-bold text-slate-400">
            {selected.length ? `${selected.length} selected` : ""}
          </span>
        </span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <FiSearch className="text-teal-700" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search categories..."
            />
            {allowClear && selected.length ? (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Clear selected categories"
              >
                <FiX />
              </button>
            ) : null}
          </div>

          <div className="max-h-64 overflow-auto p-2">
            {filtered.length ? (
              filtered.map((cat) => {
                const isSelected = selected.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleCategory(cat)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? "bg-teal-50 text-teal-800"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="font-semibold">{cat}</span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-teal-800" : "text-slate-400"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                No categories found.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-3 py-2">
            <span className="text-xs font-medium text-slate-500">
              Select one or more.
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

