import { NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://localhost:5000";
const DEFAULT_BACKEND_API_URL = `${DEFAULT_BACKEND_URL}/api`;

const HOP_BY_HOP_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function normalizeBaseUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(String(value).trim().replace(/\/+$/, ""));
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function addBackendBase(candidates, seen, value) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized || seen.has(normalized)) return;

  seen.add(normalized);
  candidates.push(normalized);
}

function addBackendBaseWithApiVariant(candidates, seen, value) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return;

  addBackendBase(candidates, seen, normalized);

  const url = new URL(normalized);
  const segments = url.pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);

  if (lastSegment === "api") {
    const withoutApi = new URL(url);
    withoutApi.pathname = `/${segments.slice(0, -1).join("/")}`;
    addBackendBase(candidates, seen, withoutApi.toString());
    return;
  }

  const withApi = new URL(url);
  withApi.pathname = `/${[...segments, "api"].join("/")}`;
  addBackendBase(candidates, seen, withApi.toString());
}

function getBackendBaseCandidates() {
  const candidates = [];
  const seen = new Set();

  [
    process.env.BACKEND_API_URL,
    process.env.NEXT_PUBLIC_BACKEND_API_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    DEFAULT_BACKEND_API_URL,
    DEFAULT_BACKEND_URL,
  ].forEach((baseUrl) => addBackendBaseWithApiVariant(candidates, seen, baseUrl));

  return candidates;
}

function buildBackendUrl(baseUrl, request, path = []) {
  const base = new URL(baseUrl);
  const baseSegments = base.pathname.split("/").filter(Boolean);
  const apiSegments = path.map((segment) => String(segment));
  const nextPath = [...baseSegments, ...apiSegments]
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  base.pathname = nextPath ? `/${nextPath}` : "/";
  base.search = request.nextUrl.search;

  return base;
}

function getForwardHeaders(request) {
  const headers = new Headers(request.headers);

  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  headers.set("x-forwarded-host", request.headers.get("host") || "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  return headers;
}

function getResponseHeaders(backendResponse) {
  const headers = new Headers();

  backendResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.append(key, value);
    }
  });

  const contentType = backendResponse.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const setCookies = backendResponse.headers.getSetCookie?.() || [];
  if (setCookies.length) {
    headers.delete("set-cookie");
    setCookies.forEach((cookie) => headers.append("set-cookie", cookie));
  }

  return headers;
}

async function readBackendPayload(backendResponse) {
  if (backendResponse.status === 204 || backendResponse.status === 205) {
    return { payload: null, isJson: false };
  }

  const contentType = backendResponse.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return { payload: await backendResponse.json(), isJson: true };
    } catch {
      return { payload: await backendResponse.text(), isJson: false };
    }
  }

  return {
    payload: await backendResponse.arrayBuffer(),
    isJson: false,
  };
}

function createProxyResponse(backendResponse, payload, isJson, headers) {
  const responseInit = {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers,
  };

  if (backendResponse.status === 204 || backendResponse.status === 205) {
    return new NextResponse(null, responseInit);
  }

  if (isJson) {
    return NextResponse.json(payload, responseInit);
  }

  return new NextResponse(payload, responseInit);
}

function createProxyNotFound(joinedPath, attempts, backendPayload) {
  const payload = {
    message: `Backend route not found for /api/${joinedPath}. Check BACKEND_API_URL or the backend route mount.`,
  };

  if (process.env.NODE_ENV !== "production") {
    payload.attempted = attempts;

    if (typeof backendPayload === "string") {
      payload.backendMessage = backendPayload;
    }
  }

  return NextResponse.json(payload, { status: 404 });
}

async function proxyRequest(request, context) {
  const { path = [] } = await context.params;
  const pathSegments = Array.isArray(path) ? path : [String(path)];
  const joinedPath = pathSegments.join("/");
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;
  const headers = getForwardHeaders(request);
  const baseCandidates = getBackendBaseCandidates();
  const attemptedUrls = [];
  const attemptedKeys = new Set();

  let lastNetworkError;
  let lastResponse;
  let lastPayload;
  let lastIsJson = false;
  let lastHeaders;

  for (const baseUrl of baseCandidates) {
    const targetUrl = buildBackendUrl(baseUrl, request, pathSegments);
    const targetKey = targetUrl.toString();

    if (attemptedKeys.has(targetKey)) continue;

    attemptedKeys.add(targetKey);
    attemptedUrls.push(targetKey);

    try {
      const backendResponse = await fetch(targetUrl, {
        method,
        headers,
        body: body ? body.slice(0) : undefined,
        cache: "no-store",
        redirect: "manual",
      });
      const responseHeaders = getResponseHeaders(backendResponse);
      const { payload, isJson } = await readBackendPayload(backendResponse);

      lastResponse = backendResponse;
      lastHeaders = responseHeaders;
      lastPayload = payload;
      lastIsJson = isJson;

      if (backendResponse.status === 404) {
        continue;
      }

      return createProxyResponse(
        backendResponse,
        payload,
        isJson,
        responseHeaders
      );
    } catch (error) {
      lastNetworkError = error;
    }
  }

  if (lastResponse) {
    if (lastResponse.status === 404 && !lastIsJson) {
      return createProxyNotFound(joinedPath, attemptedUrls, lastPayload);
    }

    return createProxyResponse(
      lastResponse,
      lastPayload,
      lastIsJson,
      lastHeaders || undefined
    );
  }

  return NextResponse.json(
    {
      message:
        "Backend API is not reachable. Start the backend server or update BACKEND_API_URL in .env.",
      error:
        lastNetworkError instanceof Error
          ? lastNetworkError.message
          : String(lastNetworkError),
      attempted: attemptedUrls,
    },
    { status: 503 }
  );
}

export const GET = proxyRequest;
export const HEAD = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
