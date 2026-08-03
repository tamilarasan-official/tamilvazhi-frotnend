import Link from "next/link";
import { LogoMark } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <LogoMark className="h-11 w-11" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink-100">
        Page not found
      </h1>
      <p className="mt-2.5 text-[15px] leading-relaxed text-ink-400">
        This course may have been removed, or the link is incorrect. Check the link with
        your instructor.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-11 items-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-400"
      >
        Back to my courses
      </Link>
    </main>
  );
}
