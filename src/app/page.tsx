import Link from "next/link";
import { serverApi } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { AccessForm } from "@/components/access-form";
import { VideoIcon, DocumentIcon, PlayIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Tamilvazhi";

type StudentCourse = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  accent: string;
  videoCount: number;
  docCount: number;
};

/** A restrained coloured rule along the top of each course card. */
const accentRule: Record<string, string> = {
  indigo: "border-t-brand-500",
  emerald: "border-t-emerald-700",
  amber: "border-t-glow-500",
  rose: "border-t-rose-700",
  sky: "border-t-sky-700",
};

export default async function HomePage() {
  const result = await serverApi<{ courses: StudentCourse[] }>("/api/access/courses");
  const courses = result.ok ? result.data.courses : [];

  return (
    <>
      <SiteHeader
        siteName={siteName}
        right={
          courses.length > 0 ? (
            <Link
              href="/access"
              className="rounded border border-ink-600 bg-white px-3.5 py-2 text-[13px] font-medium text-ink-200 transition-colors hover:border-ink-500 hover:bg-ink-900"
            >
              Add a course
            </Link>
          ) : null
        }
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-24 sm:px-6">
        {!result.ok && result.status === 503 && (
          <div className="mt-6 rounded border border-red-700/30 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {result.error}
          </div>
        )}

        {courses.length === 0 ? (
          <section className="flex flex-1 flex-col items-center justify-center py-16">
            <div className="animate-rise w-full max-w-md text-center">
              <p className="eyebrow">Course Library</p>
              <h1 className="mt-4 text-balance text-4xl leading-[1.12] text-ink-100 sm:text-5xl">
                Everything for your course, in one place.
              </h1>
              <div className="mx-auto mt-6 w-16 border-t-2 border-glow-500" aria-hidden="true" />
              <p className="mx-auto mt-6 max-w-sm text-pretty text-[15px] leading-relaxed text-ink-400">
                Stream every lecture and download the notes, slides and worksheets to your phone
                or laptop.
              </p>

              <div className="mt-9">
                <AccessForm autoFocus />
              </div>
            </div>
          </section>
        ) : (
          <section className="py-12">
            <div className="animate-rise">
              <p className="eyebrow">Course Library</p>
              <h1 className="mt-2 text-3xl text-ink-100 sm:text-4xl">Your courses</h1>
              <p className="mt-2 text-[15px] text-ink-400">
                Pick a course to watch the lectures and download the materials.
              </p>
              <div className="rule-double mt-6" aria-hidden="true" />
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <Link
                  key={course.id}
                  href={`/course/${course.slug}`}
                  style={{ animationDelay: `${index * 55}ms` }}
                  className={`animate-rise panel panel-hover group flex flex-col rounded-md border-t-[3px] p-6 ${
                    accentRule[course.accent] ?? accentRule.indigo
                  }`}
                >
                  <div className="flex-1">
                    <h2 className="text-xl leading-snug text-ink-100">{course.title}</h2>
                    {course.subtitle && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-400">
                        {course.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-ink-700 pt-4">
                    <div className="flex items-center gap-4 text-[13px] text-ink-400">
                      <span className="inline-flex items-center gap-1.5">
                        <VideoIcon className="h-4 w-4" />
                        {course.videoCount}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <DocumentIcon className="h-4 w-4" />
                        {course.docCount}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-500 transition-colors group-hover:text-brand-600">
                      Open
                      <PlayIcon className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
