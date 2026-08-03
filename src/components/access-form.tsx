"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, type FormEvent } from "react";
import { Button } from "./ui";
import { SpinnerIcon, LockIcon } from "./icons";
import { apiPost, ApiError } from "@/lib/client";

/**
 * Access-code entry.
 *
 * Posts straight from the browser to the API so the browser stores the
 * Set-Cookie itself — no relaying the session through Next.js.
 *
 * A single wide input rather than per-character boxes: those are fiddly on
 * mobile keyboards and break pasting a code out of a WhatsApp message.
 */
export function AccessForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending || code.trim().length < 3) return;

    setPending(true);
    setError(null);

    try {
      const data = await apiPost<{ ok: true; slug: string; title: string }>("/api/access", {
        code: code.trim(),
      });
      router.push(`/course/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setPending(false);
      inputRef.current?.select();
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative">
        <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ACCESS CODE"
          autoFocus={autoFocus}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={32}
          aria-label="Course access code"
          aria-invalid={Boolean(error)}
          className="h-14 w-full rounded-2xl border border-ink-600/70 bg-ink-900/80 pl-12 pr-4 text-center text-lg font-semibold tracking-[0.3em] text-ink-100 placeholder:tracking-[0.2em] placeholder:text-ink-600 transition-colors focus:border-brand-500/70 focus:bg-ink-900"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending || code.trim().length < 3}
        className="mt-4 w-full"
      >
        {pending ? (
          <>
            <SpinnerIcon className="h-4 w-4" />
            Checking…
          </>
        ) : (
          "Unlock my course"
        )}
      </Button>

      <p className="mt-4 text-center text-[13px] leading-relaxed text-ink-500">
        No sign-up, no password. Your instructor shares this code with the class.
      </p>
    </form>
  );
}
