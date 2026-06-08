"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/Pagination";

export default function AdminPaginatedTable({
  title,
  subtitle,
  items,
  emptyText,
  pageSize = 8,
  renderHeader,
  renderRow,
}) {
  const [page, setPage] = useState(1);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const totalPages = Math.max(1, Math.ceil(safeItems.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return safeItems.slice(start, end);
  }, [safeItems, currentPage, pageSize]);

  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {safeItems.length === 0 ? (
        <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
          {emptyText}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>{renderHeader?.()}</thead>
              <tbody>
                {pagedItems.map((it) => renderRow(it))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </section>
  );
}

