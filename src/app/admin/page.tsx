import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverApi, getAdminSession } from "@/lib/api";
import { AdminHeader } from "@/components/admin/admin-header";
import { CourseList, type AdminCourse } from "@/components/admin/course-list";
import { CreateCourseButton } from "@/components/admin/create-course-button";
import { Card } from "@/components/ui";
import { formatBytes } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Tamilvazhi";

type DashboardData = {
  courses: AdminCourse[];
  totals: { files: number; downloads: number; storageBytes: number };
};

export default async function AdminDashboard() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const result = await serverApi<DashboardData>("/api/courses");

  if (!result.ok) {
    return (
      <>
        <AdminHeader name={admin.name || admin.email} siteName={siteName} />
        <main className="mx-auto w-full max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl text-ink-100">Couldn&apos;t load your courses</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">{result.error}</p>
        </main>
      </>
    );
  }

  const { courses, totals } = result.data;

  const stats = [
    { label: "Courses", value: String(courses.length) },
    { label: "Files", value: String(totals.files) },
    { label: "Storage used", value: formatBytes(totals.storageBytes) },
    { label: "Downloads", value: String(totals.downloads) },
  ];

  return (
    <>
      <AdminHeader name={admin.name || admin.email} siteName={siteName} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Instructor dashboard</p>
            <h1 className="mt-2 text-3xl text-ink-100">Courses</h1>
            <p className="mt-2 text-[15px] text-ink-400">
              Upload videos and documents, then share the access code with your students.
            </p>
          </div>
          <CreateCourseButton />
        </div>

        <div className="rule-double mt-6" aria-hidden="true" />

        <div className="animate-rise mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-t-[3px] border-t-brand-500 p-4">
              <p className="text-[12px] font-medium uppercase tracking-wide text-ink-500">
                {stat.label}
              </p>
              <p className="mt-1.5 font-serif text-2xl font-semibold text-ink-100">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>

        <div className="animate-rise mt-8">
          <CourseList courses={courses} />
        </div>
      </main>
    </>
  );
}
