"use client";

import { FiX } from "react-icons/fi";

export default function PrimaryFilterChips({
  items = [],
  selected = [],
  onToggle,
  onClearAll,
  labelPrefix = "Selected",
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {selected.length ? (
        selected.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onToggle?.(cat)}
            className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800"
            aria-label={`Remove ${cat}`}
          >
            <span>{cat}</span>
            <FiX size={14} />
          </button>
        ))
      ) : (
        <span className="text-xs font-semibold text-slate-500">
          {labelPrefix}: none
        </span>
      )}

      {selected.length ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 transition hover:border-teal-200 hover:text-teal-700"
        >
          Clear
        </button>
      ) : null}

      {items.length ? <span className="sr-only">{items.length} items</span> : null}
    </div>
  );
}

