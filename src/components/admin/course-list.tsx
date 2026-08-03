"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, cn } from "../ui";
import { FolderIcon, VideoIcon, DocumentIcon, CheckIcon } from "../icons";
import { formatBytes, formatDate } from "@/lib/format";
import { apiPatch } from "@/lib/client";

export type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  accessCode: string;
  published: boolean;
  updatedAt: string;
  videoCount: number;
  docCount: number;
  sizeBytes: number;
};

export function CourseList({ courses }: { courses: AdminCourse[] }) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<FolderIcon className="h-10 w-10" />}
        title="No courses yet"
        description="Create your first course, then upload the lecture videos and study material students need."
      />
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <CourseRow key={course.id} course={course} />
      ))}
    </div>
  );
}

function CourseRow({ course }: { course: AdminCourse }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(course.published);

  async function togglePublished() {
    setPublishing(true);
    const next = !published;
    try {
      await apiPatch(`/api/courses/${course.id}`, { published: next });
      setPublished(next);
      router.refresh();
    } catch {
      // Leave the toggle where it was; the dashboard still shows the truth.
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Card className="panel-hover p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/courses/${course.id}`}
              className="text-[17px] font-semibold tracking-tight text-ink-100 transition-colors hover:text-brand-400"
            >
              {course.title}
            </Link>
            {published ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
          </div>

          {course.subtitle && (
            <p className="mt-1 line-clamp-1 text-sm text-ink-400">{course.subtitle}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-400">
            <span className="inline-flex items-center gap-1.5">
              <VideoIcon className="h-4 w-4" />
              {course.videoCount} videos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DocumentIcon className="h-4 w-4" />
              {course.docCount} documents
            </span>
            <span>{formatBytes(course.sizeBytes)}</span>
            <span className="text-ink-500">Updated {formatDate(course.updatedAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <AccessCodePill code={course.accessCode} />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={togglePublished} disabled={publishing}>
              {published ? "Unpublish" : "Publish"}
            </Button>
            <Link href={`/admin/courses/${course.id}`}>
              <Button size="sm">Manage</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** One-tap copy — sharing this code is the instructor's most frequent action. */
export function AccessCodePill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API needs HTTPS or localhost; the code stays readable anyway.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy access code"
      className={cn(
        "inline-flex items-center gap-2 self-start rounded-xl border border-ink-600/70 bg-ink-900/70 px-3 py-1.5 font-mono text-[13px] tracking-widest transition-colors hover:border-brand-500/60 sm:self-end",
        copied ? "text-emerald-400" : "text-ink-200",
      )}
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : null}
      {copied ? "Copied" : code}
    </button>
  );
}
