"use client";

export default function ImageGallery({ images }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images?.map((image, index) => (
        <img
          key={index}
          src={image}
          className="rounded-xl h-60 w-full object-cover"
        />
      ))}
    </div>
  );
}