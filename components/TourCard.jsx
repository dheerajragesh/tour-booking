import Link from "next/link";
import {
  formatPrice,
  getDurationLabel,
  getItemId,
  getRating,
  getTourImage,
} from "@/utils/tourUtils";
import { FiArrowRight, FiClock, FiMapPin, FiNavigation, FiStar } from "react-icons/fi";

export default function TourCard({ tour, index = 0 }) {
  const tourId = getItemId(tour);
  const href = tourId ? `/tours/${tourId}` : "/tours";
  const rating = getRating(tour);
  const distance = Number(tour?.distanceMiles);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={getTourImage(tour, index)}
          alt={tour?.title || "Tour destination"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
          <FiStar className="text-amber-500" />
          {rating}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <FiMapPin className="text-teal-700" />
              {tour?.destination || "Destination pending"}
            </p>
            <h2 className="mt-3 line-clamp-2 text-xl font-bold text-slate-950">
              {tour?.title || "Curated tour experience"}
            </h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              From
            </p>
            <p className="text-lg font-black text-slate-950">
              {formatPrice(tour?.price)}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {tour?.description ||
            "Compare pricing, operator details, and booking options for this experience."}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FiClock className="text-teal-700" />
            {getDurationLabel(tour?.duration)}
          </span>
          {Number.isFinite(distance) ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <FiNavigation className="text-sky-600" />
              {distance < 10 ? distance.toFixed(1) : Math.round(distance)} mi
            </span>
          ) : null}
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Details
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
