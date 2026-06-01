import Cookies from "js-cookie";

const TOKEN_KEY = "token";

export function extractAuthToken(payload) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.jwt ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.user?.token ||
    ""
  );
}

export function getAuthToken() {
  if (typeof window === "undefined") return "";

  return Cookies.get(TOKEN_KEY) || window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setAuthSession(payload) {
  if (typeof window === "undefined") return "";

  const token = extractAuthToken(payload);

  if (token) {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  return token;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  Cookies.remove(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}
