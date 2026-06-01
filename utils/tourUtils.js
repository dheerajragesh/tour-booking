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
    category: "Adventure",
    price: 249,
    duration: 3,
    rating: 4.9,
    reviews: [{ _id: "r1", rating: 5 }],
    images: [FALLBACK_TOUR_IMAGES[0]],
    description:
      "A small-group mountain escape with scenic trails, lake viewpoints, and expert local guides.",
  },
  {
    _id: "sample-ridge-hike",
    title: "Ridge Trail Hiking Day",
    destination: "Shenandoah, USA",
    category: "Hiking",
    price: 129,
    duration: 1,
    rating: 4.8,
    reviews: [{ _id: "r2", rating: 5 }],
    images: [FALLBACK_TOUR_IMAGES[2]],
    description:
      "A guided day hike with ridge views, picnic stops, and trail support for every level.",
  },
  {
    _id: "sample-balloon-tour",
    title: "Sunrise Balloon Flight",
    destination: "Cappadocia, Turkey",
    category: "Cultural",
    price: 319,
    duration: 2,
    rating: 4.7,
    reviews: [{ _id: "r3", rating: 5 }],
    images: [FALLBACK_TOUR_IMAGES[3]],
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

export function formatPrice(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
