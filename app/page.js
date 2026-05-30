import Link from "next/link";
import Categories from "@/components/Categories";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(180deg,_#f8fafc,_#e2e8f0)] py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                Trusted Tour Marketplace
              </span>
              <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                Discover curated adventures, book instantly, and travel with confidence.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl">
                Browse local experiences, premium excursions, and one-of-a-kind tours from trusted operators.
                Secure payments, smart pricing, and support for every traveler.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition"
                >
                  Browse Tours
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-2xl shadow-slate-200">
              <div className="space-y-6">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Fast Booking
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Reserve tours, check availability, and complete checkout in one flow.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Verified Operators
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Every tour is curated and reviewed to keep your experience safe and memorable.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Flexible Plans
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Book now and manage your travel details from your personal dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">
              Popular categories
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              Explore tours by theme
            </h2>
          </div>
          <Link href="/tours" className="text-blue-600 font-semibold hover:underline">
            View all tours
          </Link>
        </div>

        <Categories />
      </section>
    </main>
  );
}
