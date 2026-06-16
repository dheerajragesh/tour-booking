import Link from "next/link";

export default function NotFound() {
  return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-16 text-[var(--foreground)]">
        <div className="max-w-xl rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-400">
            404
          </p>
          <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-[var(--foreground)]">
            This trip wandered off.
          </h1>
          <p className="mt-3 text-slate-600 dark:text-[var(--muted-strong)]">
            The page you are looking for does not exist or has moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Go home
          </Link>
        </div>
      </main>
  );
}
