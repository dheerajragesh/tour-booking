import Link from "next/link";

export default function TourCard({ tour }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img
        src={tour.images?.[0]}
        alt={tour.title}
        className="h-60 w-full object-cover"
      />

      <div className="p-5">
        <h2 className="text-2xl font-bold mb-2">
          {tour.title}
        </h2>

        <p className="text-gray-600 mb-2">
          {tour.destination}
        </p>

        <p className="font-semibold text-blue-600 mb-4">
          ${tour.price}
        </p>

        <Link
          href={`/tours/${tour._id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}