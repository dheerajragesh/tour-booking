import Link from "next/link";
import { FiBarChart2, FiCalendar, FiPlusCircle } from "react-icons/fi";

const actions = [
  {
    href: "/operator/Dashboard",
    title: "View dashboard",
    description: "Track tours, bookings, and revenue from your operator workspace.",
    icon: FiBarChart2,
  },
  {
    href: "/operator/create-tour",
    title: "Create tour",
    description: "Publish a new tour with pricing, images, and trip details.",
    icon: FiPlusCircle,
  },

];

export default function OperatorPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Operator workspace
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Manage your tour business
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Create experiences, review reservations, and keep your marketplace
            inventory ready for travelers.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-10">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-teal-50 text-teal-700">
                <Icon />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-950">
                {action.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {action.description}
              </p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
