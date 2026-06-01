"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import toast from "react-hot-toast";
import { setAuthSession } from "@/utils/authSession";
import { FiCompass, FiLock, FiMail } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/";

      setAuthSession(data);
      toast.success(data?.message || "Logged in successfully");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-5 py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-xl lg:grid-cols-[1fr_460px]">
        <section className="relative hidden min-h-[620px] overflow-hidden lg:block">
          <img
            src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Hikers_on_the_Ridge_Trail_%2827706806144%29.jpg?width=1400"
            alt="Travelers hiking a ridge trail"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-200">
              Welcome back
            </p>
            <h1 className="mt-3 text-4xl font-black">
              Manage trips, reviews, and reservations in one place.
            </h1>
          </div>
        </section>

        <section className="flex items-center px-6 py-12 sm:px-10">
          <form onSubmit={handleSubmit} className="w-full">
            <Link href="/" className="inline-flex items-center gap-3 text-xl font-black text-slate-950">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-teal-700 text-white">
                <FiCompass />
              </span>
              TourBook
            </Link>

            <h2 className="mt-10 text-3xl font-black text-slate-950">
              Sign in
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Continue to booking checkout, saved tours, and profile settings.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
                  <FiMail className="text-teal-700" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    required
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    placeholder="you@example.com"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
                  <FiLock className="text-teal-700" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    required
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    placeholder="Your password"
                  />
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-600">
              Do not have an account?{" "}
              <Link href="/register" className="font-semibold text-teal-700 hover:text-slate-950">
                Create one
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
