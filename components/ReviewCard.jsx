import { FiStar } from "react-icons/fi";

export default function ReviewCard({ review }) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-950">
            {review.user?.name || review.name || "Verified traveler"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">Booked through TourBook</p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
          <FiStar />
          {review.rating || 5}
        </span>
      </div>

      <p className="mt-4 leading-7 text-slate-700">
        {review.comment || "A memorable experience with a trusted local operator."}
      </p>
    </article>
  );
}
