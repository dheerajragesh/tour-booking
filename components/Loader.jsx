export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}
