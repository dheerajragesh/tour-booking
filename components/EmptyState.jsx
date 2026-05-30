export default function EmptyState({ title }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold mb-4">
        {title}
      </h2>

      <p className="text-gray-600">
        Nothing found here.
      </p>
    </div>
  );
}