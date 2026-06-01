"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data.notifications || []);
      } catch {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="absolute right-0 top-14 z-50 w-80 rounded-[8px] border border-slate-200 bg-white p-4 shadow-xl">
      <h2 className="mb-4 text-xl font-bold text-slate-950">
        Notifications
      </h2>

      <div className="space-y-4">
        {notifications.length ? notifications.map((notification) => (
          <div
            key={notification._id}
            className="border-b border-slate-100 pb-3 text-sm text-slate-700"
          >
            <p>{notification.message}</p>
          </div>
        )) : (
          <p className="rounded-[8px] bg-slate-50 p-4 text-sm text-slate-600">
            No notifications yet.
          </p>
        )}
      </div>
    </div>
  );
}
