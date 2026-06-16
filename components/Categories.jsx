import Link from "next/link";
import {
  FiCloudLightning,
  FiCompass,
  FiMap,
  FiSun,
  FiUmbrella,
  FiUsers,
} from "react-icons/fi";


const categories = [
  { name: "International Tours", icon: FiCompass, description: "Explore global destinations & curated itineraries" },
  { name: "Domestic Tour", icon: FiMap, description: "Discover local favorites and nearby getaways" },
  { name: "Honey moon Tours", icon: FiSun, description: "Romantic stays, beaches, and unforgettable moments" },
  { name: "Family Tours", icon: FiUsers, description: "Kid-friendly trips and family experiences" },
  { name: "Luxury Tours", icon: FiCloudLightning, description: "Premium comfort, VIP perks, and exceptional guides" },
  { name: "Budget tour", icon: FiUmbrella, description: "Affordable adventures without compromising quality" },
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
