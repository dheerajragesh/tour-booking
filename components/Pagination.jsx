"use client";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  const clampedTotalPages = Math.max(1, Number(totalPages || 1));
  const current = Math.min(Math.max(1, Number(page || 1)), clampedTotalPages);

  if (clampedTotalPages <= 1) return null;

  const buildRange = () => {
    // Always show: 1, current, neighbors, last
    const pages = new Set([1, clampedTotalPages, current]);
    for (let i = current - 2; i <= current + 2; i++) {
      if (i >= 1 && i <= clampedTotalPages) pages.add(i);
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const range = buildRange();

  const items = [];
  for (let i = 0; i < range.length; i++) {
    const p = range[i];
    const prev = range[i - 1];

    if (i > 0 && p - prev > 1) {
      items.push({ type: "ellipsis", key: `el-${prev}-${p}` });
    }

    items.push({ type: "page", key: p, page: p });
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <div className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-700">{current}</span> of{" "}
        <span className="font-semibold text-slate-700">{clampedTotalPages}</span>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, current - 1))}
          disabled={current === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-teal-700 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Previous"
        >
          &lt;
        </button>

        {items.map((it) => {
          if (it.type === "ellipsis") {
            return (
              <span
                key={it.key}
                className="px-2 text-slate-400 select-none"
              >
                ...
              </span>
            );
          }

          const isActive = it.page === current;

          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onPageChange(it.page)}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold transition ${
                isActive
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {it.page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(clampedTotalPages, current + 1))}
          disabled={current === clampedTotalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-teal-700 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Next"
        >
          &gt;
        </button>
      </nav>
    </div>
  );
}

