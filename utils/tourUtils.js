export const FALLBACK_TOUR_IMAGES = [
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Moraine_Lake_17092005.jpg?width=1600",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Group_Hiking_%285220995856%29.jpg?width=1600",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hikers_on_the_Ridge_Trail_%2827706806144%29.jpg?width=1600",
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hot_air_balloons_in_Cappadocia.jpg?width=1600",
];

export const FALLBACK_TOURS = [
  {
    _id: "sample-mountain-escape",
    title: "Moraine Lake Explorer",
    destination: "Banff, Canada",
    location: { lat: 51.4968, lng: -115.9281 },
    category: "Adventure",
    price: 249,
    duration: 3,
    rating: 4.9,
    reviews: [{ _id: "r1", rating: 5 }],
    images: [FALLBACK_TOUR_IMAGES[0]],
    availableDates: [],
    availableTimes: ["08:00", "10:30", "13:00"],
    addOns: [
      { name: "Trail lunch", price: 24 },
      { name: "Private guide", price: 140 },
    ],
    description:
      "A small-group mountain escape with scenic trails, lake viewpoints, and expert local guides.",
  },
  {
    _id: "sample-ridge-hike",
    title: "Ridge Trail Hiking Day",
    destination: "Shenandoah, USA",
    location: { lat: 38.4755, lng: -78.4535 },
    category: "Hiking",
    price: 129,
    duration: 1,
    rating: 4.8,
    reviews: [{ _id: "r2", rating: 5 }],
    images: [FALLBACK_TOUR_IMAGES[2]],
    availableDates: [],
    availableTimes: ["07:30", "09:00", "12:00"],
    addOns: [
      { name: "Picnic basket", price: 18 },
      { name: "Trekking poles", price: 12 },
    ],
    description:
      "A guided day hike with ridge views, picnic stops, and trail support for every level.",
  },
  {
    _id: "sample-balloon-tour",
    title: "Sunrise Balloon Flight",
    destination: "Cappadocia, Turkey",
    location: { lat: 38.6431, lng: 34.8286 },
    category: "Cultural",
    price: 319,
    duration: 2,
    rating: 4.7,
    reviews: [{ _id: "r3", rating: 5 }],
    images: [FALLBACK_TOUR_IMAGES[3]],
    availableDates: [],
    availableTimes: ["05:30", "06:00"],
    addOns: [
      { name: "Hotel pickup", price: 35 },
      { name: "Celebration package", price: 60 },
    ],
    description:
      "Float above historic valleys at sunrise with hotel pickup, breakfast, and local hosts.",
  },
];

export function normalizeList(payload, key) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function formatPrice(value, { currency = "INR", locale = "en-IN" } = {}) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}


export function getTourImage(tour, index = 0) {
  const image = tour?.images?.find(Boolean);
  if (image) return image;

  const seed = String(tour?._id || tour?.title || index);
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_TOUR_IMAGES[total % FALLBACK_TOUR_IMAGES.length];
}

export function getDurationLabel(duration) {
  const days = Number(duration || 0);
  if (!days) return "Flexible";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function getRating(tour) {
  if (Number(tour?.rating)) return Number(tour.rating).toFixed(1);

  const reviews = Array.isArray(tour?.reviews) ? tour.reviews : [];
  if (!reviews.length) return "New";

  const average =
    reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
    reviews.length;

  return average ? average.toFixed(1) : "New";
}

export function formatDate(value) {
  if (!value) return "Date pending";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date pending";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(value) {
  if (!value) return "Time pending";

  const [hours, minutes] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getItemId(item) {
  return item?._id || item?.id || item?.uuid || "";
}

export function getTourAddOns(tour) {
  const addOns =
    tour?.addOns ||
    tour?.addons ||
    tour?.addOnServices ||
    tour?.customizationOptions ||
    [];

  if (!Array.isArray(addOns)) return [];

  return addOns
    .map((addOn) => {
      if (typeof addOn === "string") return { name: addOn, price: 0 };

      return {
        ...addOn,
        name: addOn.name || addOn.title || addOn.label || "Add-on service",
        price: Number(addOn.price || addOn.amount || 0),
      };
    })
    .filter((addOn) => addOn.name);
}

export function getTourAvailableTimes(tour) {
  const times = tour?.availableTimes || tour?.times || tour?.timeSlots || [];

  if (!Array.isArray(times) || !times.length) {
    return ["09:00", "11:00", "14:00"];
  }

  return times.map((time) => String(time));
}

export function getTourCoordinates(tour) {
  const candidates = [
    tour?.location,
    tour?.coordinates,
    tour?.geo,
    tour?.destinationCoordinates,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (Array.isArray(candidate) && candidate.length >= 2) {
      const [lng, lat] = candidate.map(Number);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    const lat = Number(candidate.lat ?? candidate.latitude);
    const lng = Number(candidate.lng ?? candidate.lon ?? candidate.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  const lat = Number(tour?.lat ?? tour?.latitude);
  const lng = Number(tour?.lng ?? tour?.lon ?? tour?.longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };

  return null;
}

export function getDistanceMiles(from, to) {
  if (!from || !to) return null;

  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}
