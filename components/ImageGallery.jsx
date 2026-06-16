"use client";

import { FALLBACK_TOUR_IMAGES } from "@/utils/tourUtils";

export default function ImageGallery({ images = [], title = "Tour gallery" }) {
  const galleryImages = images.length ? images.filter(Boolean) : FALLBACK_TOUR_IMAGES;
  const [primary, ...secondary] = galleryImages;
  const sideImages = secondary.length ? secondary.slice(0, 2) : FALLBACK_TOUR_IMAGES.slice(1, 3);

  return (
    <div className="grid gap-3 overflow-hidden rounded-[8px] bg-white dark:bg-[var(--card)] md:grid-cols-[1.6fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#0d1221] md:aspect-auto md:min-h-[440px]">
        <img
          src={primary}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm dark:bg-[rgba(13,18,33,0.72)] dark:text-[var(--foreground)]">
          Featured experience
        </div>
      </div>

      <div className="grid gap-3 md:grid-rows-2">
        {sideImages.map((image, index) => (
            <div key={`${image}-${index}`} className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-[#0d1221] md:aspect-auto">
            <img
              src={image}
              alt={`${title} ${index + 2}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
