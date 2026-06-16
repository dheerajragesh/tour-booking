"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/services/api";
import AddReview from "@/components/AddReview";
import BookingForm from "@/components/BookingForm";
import ChatBox from "@/components/ChatBox";
import ImageGallery from "@/components/ImageGallery";
import Loader from "@/components/Loader";
import ReviewCard from "@/components/ReviewCard";
import SocialShare from "@/components/SocialShare";
import WishlistButton from "@/components/WishList";
import {
  FALLBACK_TOURS,
  formatPrice,
  getItemId,
  getDurationLabel,
  getRating,
} from "@/utils/tourUtils";
import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";

export default function TourDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchTour = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/tours/${id}`);
        setTour(data.tour || data);
      } catch (error) {
        const fallback = FALLBACK_TOURS.find((item) => item._id === id);

        if (fallback) {
          setTour(fallback);
        } else {
          setError(
            error?.response?.data?.message || "Unable to load tour details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  if (loading) return <Loader label="Loading tour details..." />;

  if (error || !tour) {
    return (
      <main className="min-h-screen bg-[#f7f4ef] dark:bg-[var(--background)] px-5 py-16">
        <div className="mx-auto max-w-2xl rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-[var(--border)] dark:bg-[var(--card)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-[var(--accent)]">
            Tour unavailable
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-950 dark:text-[var(--foreground)]">
            We could not find this trip.
          </h1>
          <p className="mt-3 text-slate-600 dark:text-[var(--muted)]">
            {error || "The tour may have been removed or the link is outdated."}
          </p>
          <Link
            href="/tours"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Back to tours
          </Link>
        </div>
      </main>
    );
  }

  const reviews = Array.isArray(tour.reviews) ? tour.reviews : [];
  const tourId = getItemId(tour);
  const operatorName =
    tour.operator?.name ||
    tour.operatorName ||
    tour.createdBy?.name ||
    "operator";
  const operatorId =
    getItemId(tour.operator) ||
    tour.operatorId ||
    tour.operator ||
    getItemId(tour.createdBy);

  const handleReviewAdded = (review) => {
    setTour((current) => ({
      ...current,
      reviews: [review, ...(Array.isArray(current?.reviews) ? current.reviews : [])],
    }));
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] dark:bg-[var(--background)]">
      <section className="border-b border-slate-200 bg-white dark:border-[var(--border)] dark:bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="text-sm text-slate-500 dark:text-[var(--muted)]">
            <Link href="/" className="hover:text-teal-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tours" className="hover:text-teal-700">
              Tours
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-[var(--foreground)]">{tour.title}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <ImageGallery images={tour.images || []} title={tour.title} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-8">
            <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                  <FiStar />
                  {getRating(tour)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-teal-700">
                  <FiMapPin />
                  {tour.destination || "Destination pending"}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {tour.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                {tour.description ||
                  "A curated travel experience with trusted operators, comfortable pacing, and clear booking support."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[8px] bg-slate-50 p-4">
                  <FiClock className="text-teal-700" />
                  <p className="mt-3 text-sm text-slate-500">Duration</p>
                  <p className="font-bold text-slate-950">
                    {getDurationLabel(tour.duration)}
                  </p>
                </div>
                <div className="rounded-[8px] bg-slate-50 p-4">
                  <FiUsers className="text-teal-700" />
                  <p className="mt-3 text-sm text-slate-500">Group style</p>
                  <p className="font-bold text-slate-950">Small group</p>
                </div>
                <div className="rounded-[8px] bg-slate-50 p-4">
                  <FiShield className="text-teal-700" />
                  <p className="mt-3 text-sm text-slate-500">Booking</p>
                  <p className="font-bold text-slate-950">Secure checkout</p>
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-[var(--border)] dark:bg-[var(--card)]">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-[var(--foreground)]">
                What is included
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Verified local operator",
                  "Mobile booking confirmation",
                  "Flexible traveler support",
                  "Curated itinerary and route notes",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-slate-700">
                    <FiCheckCircle className="shrink-0 text-teal-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Traveler reviews
                  </h2>
                  <p className="mt-1 text-slate-500">
                    {reviews.length
                      ? `${reviews.length} recent review${
                          reviews.length === 1 ? "" : "s"
                        }`
                      : "Be the first to review this tour."}
                  </p>
                </div>
                <WishlistButton tourId={tour._id} />
              </div>

              <div className="mt-6 space-y-4">
                {reviews.length ? (
                  reviews.map((review) => (
                    <ReviewCard key={review._id || review.comment} review={review} />
                  ))
                ) : (
                  <div className="rounded-[8px] bg-slate-50 p-5 text-slate-600">
                    No reviews yet.
                  </div>
                )}
              </div>

              <div className="mt-6">
                <AddReview tourId={tourId} onReviewAdded={handleReviewAdded} />
              </div>
            </div>

            <ChatBox
              tourId={tourId}
              operatorId={operatorId}
              operatorName={operatorName}
            />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingForm tour={tour} />
            <div className="mt-4 rounded-[8px] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-950">
                From {formatPrice(tour.price)} per person
              </p>
              <p className="mt-2">
                Taxes, operator fees, and checkout details are finalized by the
                booking API.
              </p>
            </div>
            <div className="mt-4">
              <SocialShare title={tour.title} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
