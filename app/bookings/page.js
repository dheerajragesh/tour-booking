
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import {
  getApiMessage,
  normalizeCollection,
  normalizeRecord,
  requestWithFallback,
} from "@/utils/apiHelpers";

import {
  formatDate,
  formatPrice,
  formatTime,
  getItemId,
  getTourImage,
} from "@/utils/tourUtils";
import {
  FiCalendar,
  FiCreditCard,
  FiEdit3,
  FiMapPin,
  FiMessageSquare,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

const statusClasses = {
  confirmed: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
  canceled: "bg-rose-100 text-rose-700",
};

function getBookingDate(booking) {
  return booking.bookingDate || booking.date || booking.travelDate || "";
}

function getBookingTime(booking) {
  return booking.time || booking.startTime || booking.slotTime || "";
}

function getGuestCount(booking) {
  return Number(
    booking.guests ||
      booking.numberOfGuests ||
      booking.participants ||
      booking.travelers ||
      1
  );
}

function getSpecialRequirements(booking) {
  return (
    booking.specialRequirements ||
    booking.specialRequest ||
    booking.notes ||
    booking.customization?.specialRequirements ||
    ""
  );
}

function BookingEditModal({ booking, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    date: getBookingDate(booking),
    time: getBookingTime(booking),
    guests: getGuestCount(booking),
    specialRequirements: getSpecialRequirements(booking),
  });
  const minDate = new Date().toISOString().split("T")[0];

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="w-full max-w-xl rounded-[8px] border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Booking changes
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Update request details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
            aria-label="Close booking editor"
          >
            <FiX />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Date
            <input
              type="date"
              name="date"
              min={minDate}
              value={form.date ? String(form.date).slice(0, 10) : ""}
              onChange={handleChange}
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Time
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Guests
            <input
              type="number"
              name="guests"
              min="1"
              max="50"
              value={form.guests}
              onChange={handleChange}
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              required
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Special requirements
          <textarea
            name="specialRequirements"
            rows="4"
            value={form.specialRequirements}
            onChange={handleChange}
            className="mt-2 w-full resize-none rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
          />
        </label>

        <p className="mt-4 rounded-[8px] bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Changes are submitted to the operator and may be subject to the tour
          cancellation or change policy.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [savingId, setSavingId] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await requestWithFallback("get", [
        "/bookings/my-bookings",
        "/bookings/my",
        "/bookings/user",
        "/bookings",
      ]);
      setBookings(normalizeCollection(data, ["bookings", "reservations"]));
    } catch (error) {
      setError(getApiMessage(error, "We could not load your bookings right now."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fetchBookings, 0);

    return () => window.clearTimeout(timer);
  }, [fetchBookings]);

  const handleUpdateBooking = async (booking, form) => {
    const bookingId = getItemId(booking);
    const guests = Math.max(Number(form.guests || 1), 1);
    const payload = {
      bookingDate: form.date,
      date: form.date,
      time: form.time,
      startTime: form.time,
      guests,
      numberOfGuests: guests,
      participants: guests,
      travelers: guests,
      specialRequirements: form.specialRequirements,
      specialRequest: form.specialRequirements,
      customization: {
        ...(booking.customization || {}),
        specialRequirements: form.specialRequirements,
      },
    };

    setSavingId(bookingId);

    try {
      let response;

      try {
        response = await requestWithFallback(
          "patch",
          [`/bookings/${bookingId}`, `/bookings/update/${bookingId}`],
          payload
        );
      } catch (error) {
        const status = error?.response?.status;
        if (![400, 404, 405].includes(status)) throw error;
        response = await requestWithFallback("put", [`/bookings/${bookingId}`], payload);
      }

      const updated = normalizeRecord(response.data, ["booking", "reservation"]);
      setBookings((current) =>
        current.map((item) =>
          getItemId(item) === bookingId ? { ...item, ...payload, ...updated } : item
        )
      );
      toast.success("Booking changes saved.");
      setEditingBooking(null);
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to update booking."));
    } finally {
      setSavingId("");
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetBooking, setDeleteTargetBooking] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openDeleteBookingModal = (booking) => {
    setDeleteTargetBooking(booking);
    setDeleteModalOpen(true);
  };

  const closeDeleteBookingModal = () => {
    if (deleteLoading) return;
    setDeleteModalOpen(false);
    setDeleteTargetBooking(null);
  };

  const handleConfirmDeleteBooking = async () => {
    const booking = deleteTargetBooking;
    const bookingId = booking ? getItemId(booking) : null;
    if (!bookingId) return;

    setDeleteLoading(true);
    setSavingId(bookingId);

    try {
      try {
        await requestWithFallback("delete", [`/bookings/cancel/${bookingId}`]);
      } catch (error) {
        const status = error?.response?.status;
        if (![400, 404, 405].includes(status)) throw error;
        await requestWithFallback(
          "patch",
          [`/bookings/${bookingId}/cancel`, `/bookings/cancel/${bookingId}`],
          { status: "cancelled" }
        );
      }

      toast.success("Booking deleted.");
      await fetchBookings();
      setDeleteModalOpen(false);
      setDeleteTargetBooking(null);
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to delete booking."));
    } finally {
      setDeleteLoading(false);
      setSavingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] dark:bg-[var(--background)]">
      <section className="border-b border-slate-200 bg-white dark:border-[var(--border)] dark:bg-[var(--card)]">

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
            Travel desk
          </p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-[var(--foreground)] sm:text-5xl">
                My bookings
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Review reservation requests, update trip details, continue
                payment, and cancel when the policy allows it.
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
              const bookingId = getItemId(booking);
              const tour = booking.tour || booking.tourId || booking.tourPlan || {};
              const tourId = getItemId(tour);
              const status = String(booking.status || "pending").toLowerCase();
              const guests = getGuestCount(booking);
              const total =
                booking.totalPrice ||
                booking.amount ||
                Number(tour.price || 0) * guests;
              const time = getBookingTime(booking);
              const specialRequirements = getSpecialRequirements(booking);
              const canModify = !["cancelled", "canceled", "paid"].includes(status);

              return (
                <article
                  key={bookingId}
                  className="grid overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm md:grid-cols-[240px_minmax(0,1fr)]"
                >
                  <img
                    src={getTourImage(tour)}
                    alt={tour.title || "Booked tour"}
                    className="h-56 w-full object-cover md:h-full"
                  />
                  <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_240px]">
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
                          Booking #{bookingId?.slice(-6) || "new"}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-bold text-slate-950 dark:text-[var(--foreground)]">
                        {tour.title || "Tour reservation"}
                      </h2>

                      <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-[var(--muted)] sm:grid-cols-2">
                        <span className="inline-flex items-center gap-2">
                          <FiMapPin className="text-teal-700" />
                          {tour.destination || "Destination pending"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <FiCalendar className="text-teal-700" />
                          {formatDate(getBookingDate(booking))}
                          {time ? ` at ${formatTime(time)}` : ""}
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

                      {specialRequirements ? (
                        <p className="mt-4 inline-flex items-start gap-2 rounded-[8px] bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:text-[var(--muted)]">
                          <FiMessageSquare className="mt-0.5 shrink-0 text-teal-700" />
                          {specialRequirements}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-[8px] bg-slate-50 p-5">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-[var(--muted)]">Total</p>
                        <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-[var(--foreground)]">
                          {formatPrice(total)}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          Changes and cancellations follow the operator policy
                          attached to this booking.
                        </p>
                      </div>

                      {String(booking.paymentMethod || booking.payment_method || "")
                        .toLowerCase() === "cash" ? (
                        <div className="rounded-[8px] border border-teal-200 bg-teal-50 px-4 py-3">
                          <p className="text-sm font-semibold text-teal-900">
                            Cash on hand
                          </p>
                          <p className="mt-1 text-xs font-medium text-teal-800/80">
                            Payment recorded (status: {status})
                          </p>
                        </div>
                      ) : status === "pending" && bookingId ? (
                        <StripeCheckoutButton
                          bookingId={bookingId}
                          booking={booking}
                        />
                      ) : null}

                      <div className="grid gap-3">
                        <Link
                          href={tourId ? `/tours/${tourId}` : "/tours"}
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-700 dark:border-slate-600 dark:bg-[rgba(15,23,42,0.25)] dark:text-[var(--foreground)]"
                        >
                          View trip
                        </Link>

                        {canModify ? (
                          <button
                            type="button"
                            onClick={() => setEditingBooking(booking)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                          >
                            <FiEdit3 />
                            Change request
                          </button>
                        ) : null}

                        {!["cancelled", "canceled"].includes(status) && bookingId ? (
                          <button
                            type="button"
                            disabled={deleteLoading && savingId === bookingId}
                            onClick={() => openDeleteBookingModal(booking)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FiTrash2 />
                            {deleteLoading && savingId === bookingId
                              ? "Deleting..."
                              : "Delete booking"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
            <div className="rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-[var(--border)] dark:bg-[var(--card)]">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-[var(--foreground)]">
              No bookings yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-[var(--muted)]">
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

      {editingBooking ? (
        <BookingEditModal
          booking={editingBooking}
          saving={savingId === getItemId(editingBooking)}
          onClose={() => setEditingBooking(null)}
          onSave={(form) => handleUpdateBooking(editingBooking, form)}
        />
      ) : null}

      <DeleteConfirmationModal
        open={deleteModalOpen}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        confirmText={deleteLoading ? "Deleting..." : "Delete Booking"}
        cancelText="Cancel"
        disabled={deleteLoading}
        onCancel={closeDeleteBookingModal}
        onConfirm={handleConfirmDeleteBooking}
        confirmButtonClassName={
          deleteLoading ? "animate-pulse" : ""
        }
      />
    </main>
  );
}
