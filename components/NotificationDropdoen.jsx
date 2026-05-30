"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get(
        "/notifications"
      );

      setNotifications(data.notifications);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="absolute right-0 top-14 bg-white shadow-xl rounded-xl w-80 p-4 z-50">
      <h2 className="text-xl font-bold mb-4">
        Notifications
      </h2>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className="border-b pb-3"
          >
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}