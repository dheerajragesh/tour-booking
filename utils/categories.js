export const PROFESSIONAL_TOUR_CATEGORIES = [
  "International Tours",
  "Domestic Tour",
  "Honeymoon Tours",

  "Family Tours",
  "Luxury Tours",
  "Budget Tour",
  "Adventure Tours",
  "Cultural Tours",
  "Wildlife Tours",
  "Beach Tours",
];

export function normalizeCategoryName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function dedupeCategories(categories) {
  const out = [];
  const seen = new Set();

  (Array.isArray(categories) ? categories : [])
    .map((c) => String(c || "").trim())
    .filter(Boolean)
    .forEach((c) => {
      const key = normalizeCategoryName(c);
      if (seen.has(key)) return;
      seen.add(key);
      out.push(c);
    });

  return out;
}

