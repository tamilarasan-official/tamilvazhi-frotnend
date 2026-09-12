"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Minimal dialog. Deliberately not <dialog>: Safari's showModal support is
 * still uneven, and this needs only a backdrop, Escape, and scroll lock.
 *
 * Rendered through a portal into <body>. An ancestor that animates
 * `transform` (the page header's entrance animation) becomes the containing
 * block for `position: fixed`, which clipped the dialog to that header row.
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink-100/45 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`animate-rise panel w-full ${width} rounded-t-md border-t-[3px] border-t-brand-500 p-6 sm:rounded-md`}
      >
        <h2 className="mb-5 text-xl text-ink-100">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
