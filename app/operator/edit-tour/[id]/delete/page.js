"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import { getApiMessage } from "@/utils/apiHelpers";
import { FiTrash2 } from "react-icons/fi";

export default function DeleteTourPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Auto-delete on visit.
    const run = async () => {
      setLoading(true);
      try {
        await api.delete(`/tours/${id}`);
        toast.success("Tour deleted successfully");
        router.push("/operator/Dashboard");
      } catch (e) {
        toast.error(getApiMessage(e, "Unable to delete tour."));
        router.push("/operator/Dashboard");
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-5 py-16">
      <section className="mx-auto max-w-xl rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
          <FiTrash2 />
        </div>
        <h1 className="mt-4 text-2xl font-black text-slate-950">Deleting tour</h1>
        <p className="mt-3 text-sm text-slate-600">
          {loading ? "Please wait..." : "Redirecting..."}
        </p>
      </section>
    </main>
  );
}

