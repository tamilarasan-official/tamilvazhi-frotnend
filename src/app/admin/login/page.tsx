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
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-16">
      <div className="animate-rise">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink-100">
            {siteName} instructor
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            Sign in to upload and manage course material.
          </p>
        </div>

        <div className="panel rounded-2xl p-6">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-[13px] text-ink-500">
          Students don&apos;t sign in — they use a course access code.
        </p>
      </div>
    </main>
  );
}
