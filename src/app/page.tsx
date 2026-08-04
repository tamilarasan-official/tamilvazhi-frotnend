import Link from "next/link";
import { serverApi } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { AccessForm } from "@/components/access-form";
import { Badge } from "@/components/ui";
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

const accentGlow: Record<string, string> = {
  indigo: "from-brand-500/25 to-transparent",
  emerald: "from-emerald-500/25 to-transparent",
  amber: "from-glow-500/25 to-transparent",
  rose: "from-rose-500/25 to-transparent",
  sky: "from-sky-500/25 to-transparent",
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
              className="rounded-xl px-3.5 py-2 text-[13px] font-medium text-ink-300 transition-colors hover:bg-ink-800/70 hover:text-ink-100"
            >
              Add a course
            </Link>
          ) : null
        }
      />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        {!result.ok && result.status === 503 && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
            {result.error}
          </div>
        )}

        {courses.length === 0 ? (
          <section className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center py-16">
            <div className="animate-rise w-full max-w-md text-center">
              <Badge tone="brand" className="mb-6">
                Course library
              </Badge>
              <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-ink-100 sm:text-5xl">
                Everything for your course,
                <span className="bg-gradient-to-r from-brand-400 to-glow-400 bg-clip-text text-transparent">
                  {" "}
                  in one place
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-relaxed text-ink-400">
                Stream every lecture and download the notes, slides and worksheets to your
                phone or laptop.
              </p>

              <div className="mt-9">
                <AccessForm autoFocus />
              </div>
            </div>
          </section>
        ) : (
          <section className="py-12">
            <div className="animate-rise">
              <h1 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
                Your courses
              </h1>
              <p className="mt-2 text-[15px] text-ink-400">
                Pick a course to watch the lectures and download the materials.
              </p>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <Link
                  key={course.id}
                  href={`/course/${course.slug}`}
                  style={{ animationDelay: `${index * 55}ms` }}
                  className="animate-rise panel panel-hover group relative flex flex-col overflow-hidden rounded-2xl p-6"
                >
                  <div
                    className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl ${
                      accentGlow[course.accent] ?? accentGlow.indigo
                    }`}
                    aria-hidden="true"
                  />

                  <div className="relative flex-1">
                    <h2 className="text-lg font-semibold leading-snug tracking-tight text-ink-100">
                      {course.title}
                    </h2>
                    {course.subtitle && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-400">
                        {course.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[13px] text-ink-400">
                      <span className="inline-flex items-center gap-1.5">
                        <VideoIcon className="h-4 w-4" />
                        {course.videoCount}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <DocumentIcon className="h-4 w-4" />
                        {course.docCount}
                      </span>
                    </div>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-400 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                      <PlayIcon className="ml-0.5 h-3.5 w-3.5" />
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
