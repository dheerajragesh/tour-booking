import api from "@/services/api";

const FALLBACK_STATUSES = new Set([400, 404, 405]);

export function getApiMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function normalizeCollection(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;

  return [];
}

export function normalizeRecord(payload, keys = []) {
  if (!payload || Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (payload?.[key] && typeof payload[key] === "object") {
      return payload[key];
    }
  }

  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}

export async function requestWithFallback(method, candidates, payload, config) {
  const endpoints = Array.isArray(candidates) ? candidates : [candidates];
  let lastError;

  for (const endpoint of endpoints) {
    try {
      if (method === "get" || method === "delete") {
        return await api[method](endpoint, payload || config || {});
      }

      return await api[method](endpoint, payload, config || {});
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;

      if (!FALLBACK_STATUSES.has(status)) {
        throw error;
      }
    }
  }

  throw lastError;
}
