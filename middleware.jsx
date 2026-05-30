import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");

  const protectedRoutes = [
    "/bookings",
    "/profile",
    "/operator",
    "/admin",
  ];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/bookings/:path*",
    "/profile/:path*",
    "/operator/:path*",
    "/admin/:path*",
  ],
};