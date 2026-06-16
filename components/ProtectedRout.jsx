"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function getRole(user) {
  return (
    user?.role ||
    user?.user?.role ||
    user?.data?.role ||
    user?.type ||
    ""
  );
}

export default function ProtectedRoute({
  user,
  children,
  requiredRoles,
  redirectTo = "/login",
  denyTo = "/not-found",
}) {
  const router = useRouter();
  const role = getRole(user);

  useEffect(() => {
    // Wait for auth state to resolve instead of immediately redirecting.
    // Your operator dashboard initially sets `me` to null.
    // Treat only `undefined` as "loading".
    if (user === undefined) return;

    if (user === null) {
      router.push(redirectTo);
      return;
    }

    if (Array.isArray(requiredRoles) && requiredRoles.length) {
      const allowed = requiredRoles.includes(role);
      if (!allowed) router.push(denyTo);
    }
  }, [router, user, role, requiredRoles, redirectTo, denyTo]);

  // While role is being checked / waiting for auth, render nothing to avoid flashing.
  if (user === undefined) return null;

  if (Array.isArray(requiredRoles) && requiredRoles.length) {
    const allowed = requiredRoles.includes(role);
    if (!allowed) return null;
  }

  return children;

}





