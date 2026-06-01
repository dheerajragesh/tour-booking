import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "http://localhost:5000/api";

const HOP_BY_HOP_HEADERS = [
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
];

function buildBackendUrl(request, path = []) {
  const base = new URL(BACKEND_API_URL);
  const basePath = base.pathname.replace(/\/$/, "");
  const apiPath = path.map((segment) => encodeURIComponent(segment)).join("/");

  base.pathname = `${basePath}/${apiPath}`;
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
    if (!HOP_BY_HOP_HEADERS.includes(key.toLowerCase())) {
      headers.append(key, value);
    }
  });

  // Ensure content-type is preserved so frontend can parse JSON errors reliably.
  const contentType = backendResponse.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const setCookies = backendResponse.headers.getSetCookie?.() || [];
  if (setCookies.length) {
    headers.delete("set-cookie");
    setCookies.forEach((cookie) => headers.append("set-cookie", cookie));
  }

  return headers;
}

async function proxyRequest(request, context) {
  const { path = [] } = await context.params;
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const targetUrl = buildBackendUrl(request, path);

  try {
    const backendResponse = await fetch(targetUrl, {
      method,
      headers: getForwardHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    // Try to return JSON error payloads in a consistent way for axios consumers.
    const contentType = backendResponse.headers.get("content-type") || "";
    let payload;

    if (contentType.includes("application/json")) {
      try {
        payload = await backendResponse.json();
      } catch {
        payload = await backendResponse.text();
      }
    } else {
      payload = await backendResponse.arrayBuffer();
    }

    const headers = getResponseHeaders(backendResponse);

    if (typeof payload === "object" && payload !== null) {
      return NextResponse.json(payload, {
        status: backendResponse.status,
        headers,
      });
    }

    return new NextResponse(payload, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Backend API is not reachable. Start the backend server or update BACKEND_API_URL in .env.",
        backendUrl: BACKEND_API_URL,
        // Avoid leaking internal details, but help debugging locally.
        error: error instanceof Error ? error.message : String(error),
        targetUrl: targetUrl?.toString?.(),
      },
      { status: 503 }
    );
  }
}

export const GET = proxyRequest;
export const HEAD = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
