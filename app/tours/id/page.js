"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import ImageGallery from "@/components/ImageGallery";
import WishlistButton from "@/components/WishList";
import ReviewCard from "@/components/ReviewCard";
import AddReview from "@/components/AddReview";
import BookingForm from "@/components/BookingForm";
import Loader from "@/components/Loader";

export default function TourDetailsPage({ params }) {
  const [tour, setTour] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTour();
  }, [params.id]);

  const fetchTour = async () => {
    try {
      const { data } = await api.get(`/tours/${params.id}`);
      setTour(data.tour || data);
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to load tour details."
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Tour not found</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto p-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <ImageGallery images={tour.images || []} />

        <div className="grid md:grid-cols-3 gap-10 p-10">
          <div className="md:col-span-2">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-5xl font-bold mb-3 text-slate-900">
                  {tour.title}
                </h1>
                <p className="text-slate-500 text-lg">{tour.destination}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-4">
                <span className="rounded-3xl bg-blue-100 px-4 py-2 font-semibold text-blue-700">
                  ${tour.price}
                </span>
                <span className="rounded-3xl bg-slate-100 px-4 py-2 text-slate-700">
                  {tour.duration} Days
                </span>
              </div>

              <p className="leading-8 text-slate-700 mt-6">
                {tour.description}
              </p>

              <div className="mt-8">
                <WishlistButton tourId={tour._id} />
              </div>

              <div className="mt-14">
                <h2 className="text-3xl font-bold mb-6 text-slate-900">
                  Reviews
                </h2>

                {tour.reviews?.length ? (
                  tour.reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))
                ) : (
                  <p className="text-slate-600">No reviews yet.</p>
                )}

                <div className="mt-8">
                  <AddReview tourId={tour._id} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <BookingForm tour={tour} />
          </div>
        </div>
      </div>
    </div>
  );
}
