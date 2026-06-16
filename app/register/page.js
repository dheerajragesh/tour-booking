"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import toast from "react-hot-toast";
import { setAuthSession } from "@/utils/authSession";
import { FiCompass, FiLock, FiMail, FiUser } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");


  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const validatePassword = (password) => {
    const value = String(password || "");

    if (value.length < 8) return "Password must be at least 8 characters.";
    if (value.length > 72)
      return "Password must be no more than 72 characters.";
    if (!/[a-z]/.test(value)) return "Password must include a lowercase letter.";
    if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
    if (!/[0-9]/.test(value)) return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(value))
      return "Password must include a special character.";

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validatePassword(form.password);
    setPasswordError(error);
    if (error) return;

    setLoading(true);


    try {
      const { data } = await api.post("/auth/register", form);
      setAuthSession(data);
      toast.success(data?.message || "Account created successfully");
      // After signup, send user to tours page (instead of going back to login)
      router.push("/tours");
      router.refresh();

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to register. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-12 text-[var(--foreground)]">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--card)] shadow-xl lg:grid-cols-[460px_1fr]">
        <section className="flex items-center px-6 py-12 sm:px-10 bg-[var(--card)] dark:bg-[var(--card)]">
          <form onSubmit={handleSubmit} className="w-full">

            <Link href="/" className="inline-flex items-center gap-3 text-xl font-black text-slate-950">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-teal-700 text-white">
                <FiCompass />
              </span>
              TourBook
            </Link>

            <h2 className="mt-10 text-3xl font-black text-slate-950 dark:text-[var(--foreground)]">
              Create account
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Join the marketplace to book tours, save favorites, and write
              traveler reviews.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Full name
                <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-700 focus-within:bg-white">
                  <FiUser className="text-teal-700" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    required
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    placeholder="Your name"
                  />
                </span>
              </label>

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
                    minLength={8}
                    onChange={(e) => {
                      setForm((current) => ({
                        ...current,
                        password: e.target.value,
                      }));
                      setPasswordError(validatePassword(e.target.value));
                    }}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    placeholder="At least 8 characters"
                  />

                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !!passwordError}

              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-teal-700 hover:text-[var(--foreground)]">
                Sign in
              </Link>
            </p>
          </form>
        </section>

        <section className="relative hidden min-h-[620px] overflow-hidden lg:block">
          <img
            src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Group_Hiking_%285220995856%29.jpg?width=1400"
            alt="Guided hiking group"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-200">
              Start booking
            </p>
            <h1 className="mt-3 text-4xl font-black">
              Discover curated trips with clear prices and trusted operators.
            </h1>
          </div>
        </section>
      </div>
    </main>
  );
}
