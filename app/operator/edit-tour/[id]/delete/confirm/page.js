"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import { getApiMessage } from "@/utils/apiHelpers";

export default function ConfirmDeleteTourPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const run = async () => {
      setLoading(true);
      try {
        await api.delete(`/tours/${id}`);
        toast.success("Tour deleted successfully");
      } catch (e) {
        toast.error(getApiMessage(e, "Unable to delete tour."));
      } finally {
        setLoading(false);
        router.push("/operator/Dashboard");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-5 py-16">
      <section className="mx-auto max-w-xl rounded-[8px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Deleting tour</h1>
        <p className="mt-3 text-sm text-slate-600">
          {loading ? "Please wait..." : "Redirecting..."}
        </p>
      </section>
    </main>
  );
}

