import Link from "next/link";
import {
  FiCamera,
  FiCloudLightning,
  FiCompass,
  FiMap,
  FiSun,
  FiUmbrella,
} from "react-icons/fi";

const categories = [
  {
    name: "Adventure",
    icon: FiCloudLightning,
    description: "Rafting, climbs, and high-energy escapes",
  },
  {
    name: "Camping",
    icon: FiSun,
    description: "Night skies, campfires, and guided stays",
  },
  {
    name: "Wildlife",
    icon: FiCamera,
    description: "Safaris, reserves, and nature encounters",
  },
  {
    name: "Hiking",
    icon: FiMap,
    description: "Trails, ridges, and scenic day routes",
  },
  {
    name: "Cultural",
    icon: FiCompass,
    description: "Food, heritage, city walks, and local hosts",
  },
  {
    name: "Water Sports",
    icon: FiUmbrella,
    description: "Snorkeling, kayaking, and coastal days",
  },
];

export default function Categories() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = category.icon;

        return (
          <Link
            key={category.name}
            href={`/tours?category=${encodeURIComponent(category.name)}`}
            className="group rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-teal-50 text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">
              <Icon />
            </span>
            <h3 className="mt-5 text-lg font-bold text-slate-950">
              {category.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {category.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
