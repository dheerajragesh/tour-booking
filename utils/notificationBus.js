// utils/notificationBus.js

// Simple in-memory pub/sub for pushing notifications into the UI.
// Works across components within the same browser session.

const listeners = new Set();

export function subscribeToNotifications(fn) {
  if (typeof fn !== "function") return () => {};
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function publishNotification(notification) {
  for (const fn of listeners) {
    try {
      fn(notification);
    } catch {
      // ignore listener failures
    }
  }
}

