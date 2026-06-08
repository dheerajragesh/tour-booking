"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  getApiMessage,
  normalizeRecord,
  requestWithFallback,
} from "@/utils/apiHelpers";
import {
  formatPrice,
  formatTime,
  getItemId,
  getTourAddOns,
  getTourAvailableTimes,
} from "@/utils/tourUtils";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLock,
  FiMessageSquare,
  FiSliders,
  FiUsers,
} from "react-icons/fi";

const createInitialForm = () => ({
  date: "",
  time: "",
  guests: 1,
  paymentMethod: "stripe",
  specialRequirements: "",
  privateTour: false,
  addOns: [],
});

function getLocalAvailability(tour, form, availableTimes) {
  const unavailableDates = tour?.unavailableDates || tour?.blockedDates || [];
  const availableDates = tour?.availableDates || tour?.availability || [];
  const requestedDate = form.date;
  const requestedTime = form.time;

  if (unavailableDates.includes(requestedDate)) {
    return {
      available: false,
      message: "This date is blocked by the operator.",
    };
  }

  if (
    Array.isArray(availableDates) &&
    availableDates.length &&
    !availableDates.includes(requestedDate)
  ) {
    return {
      available: false,
      message: "This date is not listed in the tour inventory.",
    };
  }

  if (requestedTime && !availableTimes.includes(requestedTime)) {
    return {
      available: false,
      message: "That time slot is not available for this tour.",
    };
  }

  return {
    available: true,
    message:
      "This slot can be requested. The operator will confirm final availability.",
  };
}

export default function BookingForm({ tour }) {
  const router = useRouter();
  const [form, setForm] = useState(createInitialForm);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState({
    checked: false,
    loading: false,
    available: null,
    message: "",
  });

  const tourId = getItemId(tour);
  const minDate = new Date().toISOString().split("T")[0];
  const availableTimes = useMemo(() => getTourAvailableTimes(tour), [tour]);
  const availableAddOns = useMemo(() => getTourAddOns(tour), [tour]);
  const guests = Math.max(Number(form.guests || 1), 1);

  const selectedAddOns = useMemo(
    () =>
      availableAddOns.filter((addOn) =>
        form.addOns.includes(addOn.id || addOn._id || addOn.name)
      ),
    [availableAddOns, form.addOns]
  );

  const addOnTotal = selectedAddOns.reduce(
    (total, addOn) => total + Number(addOn.price || 0),
    0
  );
  const baseTotal = Number(tour?.price || 0) * guests;
  const privateTourTotal = form.privateTour ? Math.round(baseTotal * 0.2) : 0;
  const total = baseTotal + addOnTotal + privateTourTotal;
  const isUnavailable =
    availability.checked && availability.available === false;

  const resetAvailability = () => {
    setAvailability({
      checked: false,
      loading: false,
      available: null,
      message: "",
    });
  };

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (["date", "time", "guests"].includes(name)) {
      resetAvailability();
    }
  };

  const toggleAddOn = (addOn) => {
    const key = addOn.id || addOn._id || addOn.name;

    setForm((current) => ({
      ...current,
      addOns: current.addOns.includes(key)
        ? current.addOns.filter((item) => item !== key)
        : [...current.addOns, key],
    }));
  };

  const buildAvailabilityPayload = () => ({
    tourId,
    tour: tourId,
    date: form.date,
    bookingDate: form.date,
    time: form.time,
    startTime: form.time,
    participants: guests,
    travelers: guests,
    guests,
  });

  const handleCheckAvailability = async () => {
    if (!form.date || !form.time) {
      toast.error("Choose a date and time first.");
      return;
    }

    setAvailability((current) => ({
      ...current,
      loading: true,
      checked: true,
    }));

    const payload = buildAvailabilityPayload();

    try {
      let response;

      try {
        response = await requestWithFallback(
          "get",
          [
            `/tours/${tourId}/availability`,
            `/availability/tours/${tourId}`,
            "/availability/check",
          ],
          { params: payload }
        );
      } catch (error) {
        const status = error?.response?.status;

        if (![400, 404, 405].includes(status)) throw error;

        response = await requestWithFallback(
          "post",
          ["/availability/check", "/tours/availability"],
          payload
        );
      }

      const record = normalizeRecord(response.data, [
        "availability",
        "result",
        "slot",
      ]);
      const available =
        record?.available ??
        record?.isAvailable ??
        record?.canBook ??
        String(record?.status || "").toLowerCase() !== "unavailable";

      setAvailability({
        checked: true,
        loading: false,
        available: Boolean(available),
        message:
          record?.message ||
          (available
            ? "This slot is available for booking request."
            : "This slot is unavailable."),
      });
    } catch (error) {
      const local = getLocalAvailability(tour, form, availableTimes);

      setAvailability({
        checked: true,
        loading: false,
        available: local.available,
        message:
          error?.response?.status === 503
            ? "Live availability is offline, so this request will be sent to the operator for confirmation."
            : local.message,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !form.time) {
      toast.error("Choose a travel date and time before checkout.");
      return;
    }

    if (isUnavailable) {
      toast.error("Choose an available slot before sending this request.");
      return;
    }

    setLoading(true);

    const payload = {
      tourId,
      tour: tourId,
      bookingDate: form.date,
      date: form.date,
      time: form.time,
      startTime: form.time,
      travelers: guests,
      participants: guests,
      guests,
      numberOfGuests: guests,
      totalPrice: total,
      amount: total,
      paymentMethod: form.paymentMethod,
      payment_method: form.paymentMethod,
      specialRequirements: form.specialRequirements,
      specialRequests: form.specialRequirements,
      specialRequest: form.specialRequirements,
      privateTour: form.privateTour,
      addOns: selectedAddOns,
      addOnServices: selectedAddOns,
      customization: {
        privateTour: form.privateTour,
        addOns: selectedAddOns,
        specialRequirements: form.specialRequirements,
      },
      status: "pending",
    };

    try {
      await requestWithFallback(
        "post",
        ["/bookings/create", "/bookings", "/bookings/request", "/booking"],
        payload
      );

      toast.success("Booking request submitted");
      setForm(createInitialForm());
      router.push("/bookings");
    } catch (error) {
      const status = error?.response?.status;
      toast.error(
        getApiMessage(
          error,
          status === 401
            ? "Please login before booking this tour."
            : "Unable to create booking."
        )
      );

      if (status === 401) {
        router.push(`/login?redirect=/tours/${tourId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Reserve now
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-950">
          Book this tour
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Check a slot, add trip preferences, and send the request to the
          operator.
        </p>
      </div>

      <div className="mt-6 rounded-[8px] bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-500">Price per person</span>
          <span className="font-bold text-slate-950">
            {formatPrice(tour?.price)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
          <span className="text-sm text-slate-500">Estimated total</span>
          <span className="text-xl font-black text-teal-700">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Travel date
          <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
            <FiCalendar className="text-teal-700" />
            <input
              type="date"
              name="date"
              min={minDate}
              value={form.date}
              required
              onChange={handleChange}
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Time
            <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
              <FiClock className="text-teal-700" />
              <select
                name="time"
                value={form.time}
                required
                onChange={handleChange}
                className="w-full border-0 bg-transparent text-sm outline-none"
              >
                <option value="">Select</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Guests
            <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
              <FiUsers className="text-teal-700" />
              <input
                type="number"
                name="guests"
                min="1"
                max="50"
                value={form.guests}
                onChange={handleChange}
                className="w-full border-0 bg-transparent text-sm outline-none"
              />
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleCheckAvailability}
          disabled={availability.loading || !tourId}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-800 transition hover:border-teal-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiCheckCircle />
          {availability.loading ? "Checking..." : "Check availability"}
        </button>

        {availability.checked ? (
          <div
            className={`rounded-[8px] border px-4 py-3 text-sm font-medium ${
              availability.available === false
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <span className="inline-flex items-start gap-2">
              {availability.available === false ? (
                <FiAlertCircle className="mt-0.5 shrink-0" />
              ) : (
                <FiCheckCircle className="mt-0.5 shrink-0" />
              )}
              {availability.message}
            </span>
          </div>
        ) : null}

        <fieldset className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">
            Customization
          </legend>

          <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              name="privateTour"
              checked={form.privateTour}
              onChange={handleChange}
              className="h-4 w-4 accent-teal-700"
            />
            <FiSliders className="text-teal-700" />
            Private tour request
          </label>

          {availableAddOns.length ? (
            <div className="mt-3 grid gap-2">
              {availableAddOns.map((addOn) => {
                const key = addOn.id || addOn._id || addOn.name;

                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <span className="inline-flex items-center gap-3 font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={form.addOns.includes(key)}
                        onChange={() => toggleAddOn(addOn)}
                        className="h-4 w-4 accent-teal-700"
                      />
                      {addOn.name}
                    </span>
                    <span className="font-bold text-slate-600">
                      {addOn.price ? formatPrice(addOn.price) : "Included"}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : null}
        </fieldset>

        <label className="block text-sm font-semibold text-slate-700">
          Special requirements
          <span className="mt-2 flex items-start gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
            <FiMessageSquare className="mt-1 text-teal-700" />
            <textarea
              name="specialRequirements"
              rows="4"
              value={form.specialRequirements}
              onChange={handleChange}
              placeholder="Accessibility, dietary needs, pickup notes, or custom route requests"
              className="w-full resize-none border-0 bg-transparent text-sm outline-none"
            />
          </span>
        </label>

        <fieldset className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">
            Payment method
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-700 focus-within:ring-2 focus-within:ring-teal-200">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={form.paymentMethod === "stripe"}
                onChange={handleChange}
                className="h-4 w-4 accent-teal-700"
              />
              <FiCreditCard className="text-teal-700" />
              <span className="text-sm font-semibold text-slate-800">
                Stripe
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-700 focus-within:ring-2 focus-within:ring-teal-200">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={form.paymentMethod === "cash"}
                onChange={handleChange}
                className="h-4 w-4 accent-teal-700"
              />
              <span className="text-sm font-semibold text-slate-800">
                Cash on hand
              </span>
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading || !tourId || isUnavailable}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiCreditCard />
          {loading
            ? "Sending request..."
            : form.paymentMethod === "cash"
              ? "Send booking request"
              : "Continue to checkout"}
        </button>
      </form>

      <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
        <FiLock className="text-teal-700" />
        Confirmations, payment updates, and changes are sent through the API.
      </p>
    </div>
  );
}
