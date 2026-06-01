"use client";

import { FiCalendar } from "react-icons/fi";

export default function AvaliablityCalendar({ dates = [] }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
        <FiCalendar className="text-teal-700" />
        Availability
      </h3>
      <div className="mt-4 grid gap-2">
        {dates.length ? (
          dates.map((date) => (
            <div
              key={date}
              className="rounded-[8px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {date}
            </div>
          ))
        ) : (
          <p className="rounded-[8px] bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Pick a date in the booking panel to request availability.
          </p>
        )}
      </div>
    </div>
  );
}
