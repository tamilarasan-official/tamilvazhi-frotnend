import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { serverApi } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { CourseViewer } from "@/components/course-viewer";
import type { ClientCourse } from "@/lib/types";

export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Portal24";

async function loadCourse(slug: string) {
  return serverApi<{ course: ClientCourse }>(`/api/courses/slug/${encodeURIComponent(slug)}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadCourse(slug);
  return { title: result.ok ? result.data.course.title : "Course" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadCourse(slug);

  if (!result.ok) {
    // 403 means the course exists but this visitor hasn't redeemed its code —
    // it also covers a course unpublished since they did.
    if (result.status === 403) redirect(`/access?course=${encodeURIComponent(slug)}`);
    if (result.status === 404) notFound();

    return (
      <>
        <SiteHeader siteName={siteName} />
        <main className="mx-auto w-full max-w-md px-4 py-24 text-center">
          <h1 className="text-xl font-semibold text-ink-100">Couldn&apos;t load this course</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">{result.error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader siteName={siteName} />
      <CourseViewer course={result.data.course} />
    </>
  );
}
