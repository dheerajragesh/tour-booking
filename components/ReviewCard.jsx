export default function ReviewCard({ review }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">
          {review.user?.name}
        </h3>

        <span className="text-yellow-500 font-bold">
          ⭐ {review.rating}
        </span>
      </div>

      <p className="text-gray-700">
        {review.comment}
      </p>
    </div>
  );
}