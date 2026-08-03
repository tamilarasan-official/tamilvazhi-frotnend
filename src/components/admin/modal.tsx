"use client";

import { useEffect } from "react";

/**
 * Minimal dialog. Deliberately not <dialog>: Safari's showModal support is
 * still uneven, and this needs only a backdrop, Escape, and scroll lock.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`animate-rise panel w-full ${width} rounded-t-2xl p-6 sm:rounded-2xl`}
      >
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-ink-100">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
