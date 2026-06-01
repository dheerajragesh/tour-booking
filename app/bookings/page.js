"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import {
  formatDate,
  formatPrice,
  getTourImage,
  normalizeList,
} from "@/utils/tourUtils";
import { FiCalendar, FiCreditCard, FiMapPin, FiUsers } from "react-icons/fi";

const statusClasses = {
  confirmed: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/bookings/my");
        setBookings(normalizeList(data, "bookings"));
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            "We could not load your bookings right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
            Travel desk
          </p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                My bookings
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Review upcoming reservations, payment status, dates, and trip
                details from one organized place.
              </p>
            </div>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Explore more tours
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {loading ? (
          <div className="rounded-[8px] border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
            Loading your reservations...
          </div>
        ) : error ? (
          <div className="rounded-[8px] border border-rose-200 bg-white p-10 text-center text-rose-700 shadow-sm">
            {error}
          </div>
        ) : bookings.length ? (
          <div className="grid gap-5">
            {bookings.map((booking) => {
              const tour = booking.tour || booking.tourId || {};
              const status = String(booking.status || "pending").toLowerCase();
              const guests = Number(booking.guests || booking.numberOfGuests || 1);
              const total =
                booking.totalPrice || booking.amount || Number(tour.price || 0) * guests;

              return (
                <article
                  key={booking._id}
                  className="grid overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm md:grid-cols-[240px_minmax(0,1fr)]"
                >
                  <img
                    src={getTourImage(tour)}
                    alt={tour.title || "Booked tour"}
                    className="h-56 w-full object-cover md:h-full"
                  />
                  <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                            statusClasses[status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {status}
                        </span>
                        <span className="text-sm text-slate-500">
                          Booking #{booking._id?.slice(-6) || "new"}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-bold text-slate-950">
                        {tour.title || "Tour reservation"}
                      </h2>

                      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <span className="inline-flex items-center gap-2">
                          <FiMapPin className="text-teal-700" />
                          {tour.destination || "Destination pending"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <FiCalendar className="text-teal-700" />
                          {formatDate(booking.bookingDate || booking.date)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <FiUsers className="text-teal-700" />
                          {guests} {guests === 1 ? "guest" : "guests"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <FiCreditCard className="text-teal-700" />
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-[8px] bg-slate-50 p-5">
                      <div>
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {formatPrice(total)}
                        </p>
                      </div>
                      {String(booking.paymentMethod || booking.payment_method || "")
                        .toLowerCase() === "cash" ? (
                        <div className="rounded-[10px] border border-teal-200 bg-teal-50 px-4 py-3">
                          <p className="text-sm font-semibold text-teal-900">
                            Cash on hand
                          </p>
                          <p className="mt-1 text-xs font-medium text-teal-800/80">
                            Payment recorded (status: {status})
                          </p>
                        </div>
                      ) : status === "pending" && booking._id ? (
                        <StripeCheckoutButton bookingId={booking._id} />
                      ) : (
                        <Link
                          href={tour._id ? `/tours/${tour._id}` : "/tours"}
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-700"
                        >
                          View trip
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              No bookings yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Your reserved tours will appear here once you complete a booking.
            </p>
            <Link
              href="/tours"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-950"
            >
              Find a tour
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
