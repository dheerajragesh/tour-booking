"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import { FiLink, FiMail, FiShare2 } from "react-icons/fi";

export default function SocialShare({ title = "TourBook experience" }) {
  const pageUrl = useSyncExternalStore(
    () => () => {},
    () => window.location.href,
    () => ""
  );
  const shareThisPropertyId = process.env.NEXT_PUBLIC_SHARETHIS_PROPERTY_ID;

  useEffect(() => {
    if (!shareThisPropertyId) return undefined;

    const scriptId = "sharethis-platform-script";
    if (document.getElementById(scriptId)) return undefined;

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://platform-api.sharethis.com/js/sharethis.js#property=${shareThisPropertyId}&product=inline-share-buttons`;
    document.body.appendChild(script);

    return undefined;
  }, [shareThisPropertyId]);

  const links = useMemo(() => {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(title);

    return [
      {
        label: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
      {
        label: "X",
        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      },
      {
        label: "WhatsApp",
        href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      },
    ];
  }, [pageUrl, title]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: pageUrl });
      return;
    }

    await navigator.clipboard.writeText(pageUrl);
    toast.success("Link copied");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    toast.success("Link copied");
  };

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
          <FiShare2 className="text-teal-700" />
          Share
        </h3>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
          aria-label="Copy tour link"
        >
          <FiLink />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <FiShare2 />
          Share tour
        </button>
        <a
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(pageUrl)}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        >
          <FiMail />
          Email
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
          >
            {link.label}
          </a>
        ))}
      </div>

      {shareThisPropertyId ? (
        <div className="sharethis-inline-share-buttons mt-4" />
      ) : null}
    </div>
  );
}
