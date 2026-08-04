import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { AccessForm } from "@/components/access-form";
import { ArrowLeftIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Enter access code" };

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Tamilvazhi";

export default function AccessPage() {
  return (
    <>
      <SiteHeader siteName={siteName} />
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center px-4 pb-20 sm:px-6">
        <div className="animate-rise">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight text-ink-100">
            Enter your access code
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-400">
            Type the code your instructor gave you to unlock the course materials.
          </p>

          <div className="mt-8">
            <AccessForm autoFocus />
          </div>
        </div>
      </main>
    </>
  );
}
