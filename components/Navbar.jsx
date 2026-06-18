"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import { clearAuthSession } from "@/utils/authSession";
import NotificationDropdown from "@/components/NotificationDropdoen";
import { FiBell, FiCompass, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { FiMoon, FiSun } from "react-icons/fi";
import { FiShoppingBag } from "react-icons/fi";

function getRole(user) {
  return user?.role || user?.user?.role || user?.data?.role || user?.type || "";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadTheme = () => {
      if (typeof window === "undefined") return;
      const saved = window.localStorage.getItem("tourbook_theme");
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      const nextTheme = saved || (prefersDark ? "dark" : "light");
      setTheme(nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    };

    loadTheme();
  }, []);

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

  const role = getRole(user);

  const isActive = (href) => {
    if (!href) return false;
    return href === "/" ? pathname === href : pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // cookie may be httpOnly; backend remains source of truth
    } finally {
      clearAuthSession();
      setUser(null);
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("tourbook_theme", next);
  };

  const baseLinks = useMemo(() => {
    // Unauthenticated
    if (!user) {
      return [{ href: "/tours", label: "Tours" }, { href: "/bookings", label: "Bookings" }, { href: "/wishlist", label: "Wishlist" }];
    }

    if (role === "operator") {
      return [
        { href: "/operator/Dashboard", label: "Operator Dashboard" },
        { href: "/operator/create-tour", label: "Create tour" },
      ];
    }

    if (role === "admin") {
      return [{ href: "/admin", label: "Admin Dashboard" }];
    }

    // customer
    return [
      { href: "/", label: "Home", exact: true },
      { href: "/tours", label: "Tours" },
      { href: "/bookings", label: "Bookings" },
      { href: "/wishlist", label: "Wishlist" },
    ];
  }, [user, role]);

  const desktopLinks = useMemo(() => {
    // Hide the currently active link to reduce clutter.
    return baseLinks.filter((link) => {
      const href = link.href;
      const active = link.exact ? pathname === href : pathname?.startsWith(href);
      return !active;
    });
  }, [baseLinks, pathname]);

  const renderLink = (link) => {
    const href = link.href;
    const active = link.exact ? pathname === href : isActive(href);

    return (
      <Link
        key={href}
        href={href}
        onClick={(e) => {
          if (active) {
            e.preventDefault();
          } else {
            closeMenu();
          }
        }}
        className={`text-sm font-semibold transition ${
          active
            ? "cursor-default text-teal-700"
            : "hover:text-teal-700 text-slate-600"
        }`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--card)",
        color: "var(--foreground)",
      }}
    >
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
          {desktopLinks.map(renderLink)}
        </div>

        <div className="tour-desktop-only flex items-center gap-3">
          {user ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((v) => !v)}
                  aria-label="Open notifications"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                >
                  <FiBell />
                  {unreadCount ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-black text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
                {notificationsOpen ? (
                  <NotificationDropdown onCountChange={setUnreadCount} />
                ) : null}
              </div>

              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                onClick={closeMenu}
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
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                onClick={closeMenu}
              >
                <FiShoppingBag />
                <span className="ml-2">Sign up</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="tour-mobile-only inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 text-slate-700"
          aria-label="Open navigation menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {menuOpen ? (
        <div className="tour-mobile-only border-t border-slate-200 bg-white px-5 py-4">
          <div className="grid gap-2">{desktopLinks.map(renderLink)}</div>

          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              {theme === "dark" ? <FiMoon /> : <FiSun />}
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
            {user ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((v) => !v)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    <FiBell />
                    Notifications
                    {unreadCount ? (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-black text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : null}
                  </button>
                  {notificationsOpen ? (
                    <NotificationDropdown onCountChange={setUnreadCount} />
                  ) : null}
                </div>

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

