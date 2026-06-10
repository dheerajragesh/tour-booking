"use client";

import { useEffect, useId, useRef } from "react";

export default function DeleteConfirmationModal({

  open,
  title = "Confirm delete",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  disabled = false,
  onCancel,
  onConfirm,
  confirmButtonClassName = "",
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      cancelBtnRef.current?.focus?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 id={titleId} className="text-lg font-bold">
          {title}
        </h3>
        {description ? (
          <p id={descriptionId} className="mt-2 text-sm text-slate-600">
            {description}
          </p>
        ) : null}

        <div className="mt-4 flex gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onConfirm}
            className={`flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonClassName}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

