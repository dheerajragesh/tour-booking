"use client";
export default function AvaliablityCalendar({ tourId }) {
    }
  };

  if (!tour) return <h1>Loading...</h1>;

  return (
    <div className="max-w-7xl mx-auto p-10">
      <ImageGallery images={tour.images} />

      <div className="grid md:grid-cols-3 gap-10 mt-10">
        <div className="md:col-span-2">
          <h1 className="text-5xl font-bold mb-6">
            {tour.title}
          </h1>

          <p className="text-gray-600 mb-6">
            {tour.destination}
          </p>

          <div className="flex gap-6 mb-8">
            <span className="text-3xl font-bold text-blue-600">
              ${tour.price}
            </span>

            <span className="text-lg">
              {tour.duration} Days
            </span>
          </div>

          <p className="leading-8 text-gray-700 mb-10">
            {tour.description}
          </p>

          <WishlistButton tourId={tour._id} />

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">
              Reviews
            </h2>

            {tour.reviews?.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
              />
            ))}

            <AddReview tourId={tour._id} />
          </div>
        </div>

        <div>
          <BookingForm tour={tour} />
        </div>
      </div>
    </div>
  );
}