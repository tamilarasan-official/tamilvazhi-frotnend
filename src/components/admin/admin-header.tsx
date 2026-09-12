"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "../icons";
import { Button } from "../ui";
import { apiPost } from "@/lib/client";

export function AdminHeader({ name, siteName }: { name: string; siteName: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await apiPost("/api/auth/logout");
    } finally {
      // Navigate even if the request failed — a stale cookie is better handled
      // by the login page than by stranding the user on a dead dashboard.
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 border-t-[3px] border-t-brand-500 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <LogoMark className="h-8 w-8" />
          <span className="font-serif text-[19px] font-semibold tracking-tight text-ink-100">
            {siteName}
          </span>
          <span className="hidden border-l border-ink-600 pl-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 sm:inline">
            Instructor
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            target="_blank"
            className="hidden rounded px-3 py-2 text-[13px] font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 sm:block"
          >
            Student view
          </Link>
          <span className="hidden max-w-[10rem] truncate text-[13px] text-ink-500 md:block">
            {name}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut} disabled={pending}>
            {pending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>
    </header>
  );
}
