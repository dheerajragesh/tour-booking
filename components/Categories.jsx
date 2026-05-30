const categories = [
  "Adventure",
  "Camping",
  "Wildlife",
  "Hiking",
  "Cultural",
  "Water Sports",
];

export default function Categories() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-10">
      {categories.map((category) => (
        <div
          key={category}
          className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-xl transition"
        >
          <h3 className="font-bold">{category}</h3>
        </div>
      ))}
    </div>
  );
}