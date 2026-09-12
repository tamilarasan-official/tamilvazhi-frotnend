import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/api";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/icons";

export const metadata: Metadata = { title: "Instructor sign in" };
export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Tamilvazhi";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getAdminSession()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <div className="animate-rise">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-12 w-12" />
          <p className="eyebrow mt-6">Instructor access</p>
          <h1 className="mt-2 text-3xl text-ink-100">{siteName}</h1>
          <p className="mt-2 text-sm text-ink-400">Sign in to upload and manage course material.</p>
        </div>

        <div className="panel rounded-md border-t-[3px] border-t-brand-500 p-6">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-[13px] text-ink-500">
          Students don&apos;t sign in. They use a course access code.
        </p>
      </div>
    </main>
  );
}
