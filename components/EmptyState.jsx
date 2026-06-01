export default function EmptyState({ title, description = "Nothing found here." }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-slate-600">{description}</p>
    </div>
  );
}
