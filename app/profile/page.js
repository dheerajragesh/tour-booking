"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FiBriefcase, FiMail, FiShield, FiUser } from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user || data);
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            "We could not load your profile. Please login again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Loader label="Loading profile..." />;

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[#f7f4ef] px-5 py-16">
        <div className="mx-auto max-w-2xl rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FiUser className="mx-auto text-4xl text-teal-700" />
          <h1 className="mt-5 text-3xl font-bold text-slate-950">
            Profile unavailable
          </h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <Link
            href="/login?redirect=/profile"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const initials = String(user.name || "Traveler")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentRole = user?.role || "user";

  const handleBecomeOperator = async () => {
    if (roleLoading) return;
    setRoleLoading(true);

    try {
      await api.post("/auth/role", { role: "operator" });
      toast.success("Role updated to operator.");

      const { data } = await api.get("/auth/me");
      setUser(data.user || data);

      router.refresh();
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          "Unable to update role. Please try again."
      );
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Account
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Traveler profile
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-[linear-gradient(135deg,#0f766e,#0f172a)]" />
          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-950 shadow-lg">
                  {user?.image || user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user?.image || user?.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-3xl font-black text-white">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="pb-2">
                  <h2 className="text-3xl font-black text-slate-950">
                    {user.name || "Traveler"}
                  </h2>
                  <p className="mt-1 text-slate-500">{user.email}</p>
                </div>
              </div>

              <Link
                href="/bookings"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                View bookings
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:grid sm:grid-cols-3">
              <div className="rounded-[8px] bg-slate-50 p-5">
                <FiMail className="text-teal-700" />
                <p className="mt-3 text-sm text-slate-500">Email</p>
                <p className="font-bold text-slate-950">{user.email}</p>
              </div>

              <div className="rounded-[8px] bg-slate-50 p-5">
                <FiShield className="text-teal-700" />
                <p className="mt-3 text-sm text-slate-500">Role</p>
                <p className="font-bold capitalize text-slate-950">
                  {currentRole}
                </p>

                {currentRole === "admin" ? (
                  <div className="mt-4 rounded-full bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-700">
                    Admin account
                  </div>
                ) : currentRole !== "operator" ? (
                  <button
                    type="button"
                    onClick={handleBecomeOperator}
                    disabled={roleLoading}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {roleLoading ? "Requesting operator..." : "Work as operator"}
                  </button>
                ) : (
                  <div className="mt-4 rounded-full bg-teal-50 px-4 py-2 text-center text-sm font-semibold text-teal-700">
                    Operator enabled
                  </div>
                )}
              </div>

              <div className="rounded-[8px] bg-slate-50 p-5">
                <FiBriefcase className="text-teal-700" />
                <p className="mt-3 text-sm text-slate-500">Account status</p>
                <p className="font-bold text-slate-950">Active</p>
              </div>
            </div>

            {currentRole === "operator" ? (
              <div className="mt-6 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
                  Operator access
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-950">
                  Manage tours
                </h3>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/operator/Dashboard"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    Operator Dashboard
                  </Link>

                  <Link
                    href="/operator/create-tour"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50"
                  >
                    Create a tour
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
