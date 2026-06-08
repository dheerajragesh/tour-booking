"use client";

import { useEffect, useState } from "react";
import {
  normalizeCollection,
  requestWithFallback,
} from "@/utils/apiHelpers";
import { formatDate } from "@/utils/tourUtils";
import { FiBell } from "react-icons/fi";

export default function NotificationDropdown({ onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      setLoading(true);

      try {
        const { data } = await requestWithFallback("get", [
          "/chat/notifications",
          "/chat/notifications/my",
          "/notifications",
          "/notifications/my",
          "/users/notifications",
          // Some backends expose notifications under these role-scoped paths.
          "/admin/notifications",
          "/operator/notifications",
        ]);
        const list = normalizeCollection(data, ["notifications"]);


        if (!active) return;

        setNotifications(list);
        onCountChange?.(
          list.filter((notification) => !notification.read && !notification.isRead)
            .length
        );
      } catch {
        if (!active) return;
        setNotifications([]);
        onCountChange?.(0);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      active = false;
    };
  }, [onCountChange]);

  return (
    <div className="absolute right-0 top-12 z-50 w-80 rounded-[8px] border border-slate-200 bg-white p-4 shadow-xl">
      <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-bold text-slate-950">
        <FiBell className="text-teal-700" />
        Notifications
      </h2>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {loading ? (
          <p className="rounded-[8px] bg-slate-50 p-4 text-sm text-slate-600">
            Loading notifications...
          </p>
        ) : notifications.length ? (
          notifications.map((notification) => {
            const unread = !notification.read && !notification.isRead;

            return (
              <div
                key={notification._id || notification.id || notification.message}
                className={`rounded-[8px] border px-4 py-3 text-sm ${
                  unread
                    ? "border-teal-200 bg-teal-50 text-teal-900"
                    : "border-slate-100 bg-white text-slate-700"
                }`}
              >
                <p className="font-medium">
                  {notification.message ||
                    notification.title ||
                    "Booking update received."}
                </p>
                {notification.createdAt || notification.date ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(notification.createdAt || notification.date)}
                  </p>
                ) : null}
              </div>
            );
          })
        ) : (
          <p className="rounded-[8px] bg-slate-50 p-4 text-sm text-slate-600">
            No notifications yet.
          </p>
        )}
      </div>
    </div>
  );
}
