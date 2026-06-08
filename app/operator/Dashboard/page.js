"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  getApiMessage,
  normalizeCollection,
  requestWithFallback,
} from "@/utils/apiHelpers";
import {
  formatDate,
  getDurationLabel,
  formatPrice,
  formatTime,
  getItemId,
} from "@/utils/tourUtils";
import {
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiPlusCircle,
  FiXCircle,
} from "react-icons/fi";
import SimplePieChart from "@/components/SimplePieChart";
import Pagination from "@/components/Pagination";

const statusClasses = {

  confirmed: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
  canceled: "bg-rose-100 text-rose-700",
};

function getBookingTour(booking) {
  return booking.tour || booking.tourId || booking.tourPlan || {};
}

export default function OperatorDashboard() {
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const revenue = useMemo(
    () =>
      bookings.reduce((total, booking) => {
        const status = String(booking.status || "").toLowerCase();
        if (!["paid", "confirmed"].includes(status)) return total;
        return total + Number(booking.totalPrice || booking.amount || 0);
      }, 0),
    [bookings]
  );

  const pendingCount = bookings.filter(
    (booking) => String(booking.status || "pending").toLowerCase() === "pending"
  ).length;

  const bookingPageSize = 8;
  const tourPageSize = 6;
  const [bookingPage, setBookingPage] = useState(1);
  const [tourPage, setTourPage] = useState(1);

  const bookingTotalPages = Math.max(
    1,
    Math.ceil(bookings.length / bookingPageSize)
  );
  const currentBookingPage = Math.min(
    Math.max(1, bookingPage),
    bookingTotalPages
  );
  const tourTotalPages = Math.max(1, Math.ceil(tours.length / tourPageSize));
  const currentTourPage = Math.min(Math.max(1, tourPage), tourTotalPages);

  const pagedBookings = useMemo(() => {
    const start = (currentBookingPage - 1) * bookingPageSize;
    const end = start + bookingPageSize;
    return bookings.slice(start, end);
  }, [bookings, currentBookingPage]);

  const pagedTours = useMemo(() => {
    const start = (currentTourPage - 1) * tourPageSize;
    const end = start + tourPageSize;
    return tours.slice(start, end);
  }, [tours, currentTourPage]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [tourResponse, bookingResponse] = await Promise.all([
        requestWithFallback("get", [
          "/tours",
          "/operator/tours",
          "/tours/operator/me",
          "/tours/my",
        ]),
        requestWithFallback("get", [
          "/bookings/my-bookings",
          "/operator/bookings",
          "/bookings/operator",
          "/bookings",
        ]),
      ]);

      setTours(normalizeCollection(tourResponse.data, ["tours"]));
      setBookings(normalizeCollection(bookingResponse.data, ["bookings"]));
    } catch (error) {
      setError(getApiMessage(error, "Unable to load operator dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fetchDashboard, 0);

    return () => window.clearTimeout(timer);
  }, [fetchDashboard]);

  const updateBookingStatus = async (booking, status) => {
    const bookingId = getItemId(booking);
    setUpdatingId(bookingId);

    try {
      await requestWithFallback(
        "patch",
        [
          `/operator/bookings/${bookingId}`,
          `/bookings/${bookingId}`,
          `/bookings/status/${bookingId}`,
        ],
        { status }
      );

      setBookings((current) =>
        current.map((item) =>
          getItemId(item) === bookingId ? { ...item, status } : item
        )
      );
      toast.success(`Booking ${status}.`);
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to update booking."));
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Operator dashboard
          </p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Manage requests and inventory
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                Review pending reservations, confirm availability, and keep tour
                listings ready for travelers.
              </p>
            </div>
            <Link
              href="/operator/create-tour"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <FiPlusCircle />
              Create tour
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {error ? (
          <div className="mb-6 rounded-[8px] border border-rose-200 bg-white px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        {/* KPIs + PIE CHART layout */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <FiCheckCircle className="text-teal-700" />
              Pending Requests
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {loading ? "-" : pendingCount}
            </p>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <FiBarChart2 className="text-teal-700" />
              Total Tours
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {loading ? "-" : tours.length}
            </p>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <FiCalendar className="text-teal-700" />
              Total Bookings
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {loading ? "-" : bookings.length}
            </p>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm md:col-span-3">
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <FiDollarSign className="text-teal-700" />
              Total Revenue
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {loading ? "-" : formatPrice(revenue)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-bold tracking-[0.24em] text-teal-700">
              PIE CHART
            </div>
            <div className="w-full flex justify-center">
              <SimplePieChart
                size={160}
                label="Bookings"
                data={(() => {
                  const safe = (n) => Number(n || 0);
                  const pending = safe(
                    bookings.filter(
                      (b) => String(b.status || "pending").toLowerCase() === "pending"
                    ).length
                  );
                  const confirmed = safe(
                    bookings.filter(
                      (b) => String(b.status || "").toLowerCase() === "confirmed"
                    ).length
                  );
                  const cancelled = safe(
                    bookings.filter((b) => {
                      const s = String(b.status || "").toLowerCase();
                      return s === "cancelled" || s === "canceled";
                    }).length
                  );

                  return [
                    { label: "Pending", value: pending, color: "#f59e0b" },
                    { label: "Confirmed", value: confirmed, color: "#14b8a6" },
                    { label: "Cancelled", value: cancelled, color: "#ef4444" },
                  ];
                })()}
              />
            </div>
          </div>
        </div>



        <div className="mt-8 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Tour inventory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep pricing, destination, and duration easy to scan.
              </p>
            </div>
            <Link
              href="/operator/create-tour"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <FiPlusCircle />
              New tour
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Tour</th>
                  <th className="py-3 pr-4 font-semibold">Destination</th>
                  <th className="py-3 pr-4 font-semibold">Duration</th>
                  <th className="py-3 pr-4 font-semibold">Price</th>
                  <th className="py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-slate-600">
                      Loading tours...
                    </td>
                  </tr>
                ) : pagedTours.length ? (
                  pagedTours.map((tour) => {
                    const tourId = getItemId(tour);

                    return (
                      <tr
                        key={tourId || tour.title}
                        className="border-b border-slate-100"
                      >
                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {tour.title || "Untitled tour"}
                        </td>
                        <td className="py-4 pr-4 text-slate-600">
                          {tour.destination || "Destination pending"}
                        </td>
                        <td className="py-4 pr-4 text-slate-600">
                          {getDurationLabel(tour.duration)}
                        </td>
                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {formatPrice(tour.price)}
                        </td>
                        <td className="py-4">
                          <Link
                            href={tourId ? `/tours/${tourId}` : "/tours"}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-slate-600">
                      No tours have been published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              page={currentTourPage}
              totalPages={tourTotalPages}
              onPageChange={setTourPage}
            />
          </div>
        </div>

        <div className="mt-8 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Booking requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Confirm, decline, or review the details sent by travelers.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchDashboard}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Tour</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Guests</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Total</th>
                  <th className="py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-slate-600">
                      Loading requests...
                    </td>
                  </tr>
                ) : pagedBookings.length ? (
                  pagedBookings.map((booking) => {
                    const bookingId = getItemId(booking);
                    const tour = getBookingTour(booking);
                    const status = String(booking.status || "pending").toLowerCase();
                    const guests =
                      booking.guests ||
                      booking.numberOfGuests ||
                      booking.participants ||
                      booking.travelers ||
                      1;
                    const time = booking.time || booking.startTime || "";

                    return (
                      <tr key={bookingId} className="border-b border-slate-100">
                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {tour.title || booking.tourTitle || "Tour request"}
                        </td>
                        <td className="py-4 pr-4 text-slate-600">
                          {formatDate(booking.bookingDate || booking.date)}
                          {time ? ` at ${formatTime(time)}` : ""}
                        </td>
                        <td className="py-4 pr-4 text-slate-600">{guests}</td>
                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                              statusClasses[status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-slate-950">
                          {formatPrice(booking.totalPrice || booking.amount)}
                        </td>
                        <td className="py-4">
                          {status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={updatingId === bookingId}
                                onClick={() =>
                                  updateBookingStatus(booking, "confirmed")
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-950 disabled:opacity-60"
                              >
                                <FiCheckCircle />
                                Confirm
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === bookingId}
                                onClick={() =>
                                  updateBookingStatus(booking, "cancelled")
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                              >
                                <FiXCircle />
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500">No action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-slate-600">
                      No booking requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              page={currentBookingPage}
              totalPages={bookingTotalPages}
              onPageChange={setBookingPage}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
