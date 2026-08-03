import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { serverApi, getAdminSession } from "@/lib/api";
import { AdminHeader } from "@/components/admin/admin-header";
import { CourseEditor, type EditorCourse } from "@/components/admin/course-editor";

export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Portal24";

async function loadCourse(id: string) {
  return serverApi<{ course: EditorCourse }>(`/api/courses/${id}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await loadCourse(id);
  return { title: result.ok ? `Manage ${result.data.course.title}` : "Course" };
}

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const result = await loadCourse(id);

  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <>
        <AdminHeader name={admin.name || admin.email} siteName={siteName} />
        <main className="mx-auto w-full max-w-md px-4 py-24 text-center">
          <h1 className="text-xl font-semibold text-ink-100">Couldn&apos;t load this course</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">{result.error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader name={admin.name || admin.email} siteName={siteName} />
      <CourseEditor course={result.data.course} />
    </>
  );
}
