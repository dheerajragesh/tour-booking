"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import { clearAuthSession } from "@/utils/authSession";
import {
  FiCompass,
  FiLogOut,
  FiMenu,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

const navLinks = [
  { href: "/", label: "Home", exact: true },
  { href: "/tours", label: "Tours" },
  { href: "/bookings", label: "Bookings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user || data);
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, [pathname]);

  const isActive = (link) =>
    link.exact ? pathname === link.href : pathname?.startsWith(link.href);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // The cookie may be httpOnly, so the backend remains the source of truth.
    } finally {
      clearAuthSession();
      setUser(null);
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-950"
          onClick={closeMenu}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-teal-700 text-white">
            <FiCompass aria-hidden="true" />
          </span>
          TourBook
        </Link>

        <div className="tour-desktop-only flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition hover:text-teal-700 ${
                isActive(link) ? "text-teal-700" : "text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="tour-desktop-only flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
              >
                <FiUser />
                {user.name?.split(" ")?.[0] || "Profile"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <FiLogOut />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="tour-mobile-only inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 text-slate-700"
          aria-label="Open navigation menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {menuOpen ? (
        <div className="tour-mobile-only border-t border-slate-200 bg-white px-5 py-4">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-[8px] px-4 py-3 text-sm font-semibold ${
                  isActive(link)
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  <FiUser />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  <FiLogOut />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  <FiShoppingBag />
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
