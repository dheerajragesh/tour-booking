"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/my");

      setBookings(data.bookings);
    } catch (error) {
      console.log(error);
    }
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-10">
        My Bookings
      </h1>

      {loading ? (
        <div className="rounded-3xl bg-white p-10 shadow-xl text-center text-slate-600">
          Loading bookings...
        </div>
      ) : bookings?.length ? (
      <div className="space-y-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h2 className="text-2xl font-bold">
              {booking.tour.title}
            </h2>

            <p>{booking.bookingDate}</p>

            <p>Status: {booking.status}</p>
          </div>
        ))}
      </div>
      ) : (
        <div className="rounded-3xl bg-white p-10 shadow-xl text-center text-slate-600">
          <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
          <p>Explore tours and book your next adventure.</p>
        </div>
      )}
    </div>
  );
}