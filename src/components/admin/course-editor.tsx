"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Uploader } from "./uploader";
import { Modal } from "./modal";
import { AccessCodePill } from "./course-list";
import { Badge, Button, Card, Input, cn } from "../ui";
import { PlusIcon, TrashIcon, VideoIcon, DocumentIcon, ArrowLeftIcon, EyeIcon } from "../icons";
import { formatBytes, formatDuration } from "@/lib/format";
import { apiPost, apiPatch, apiDelete } from "@/lib/client";

export type EditorItem = {
  id: string;
  title: string;
  type: "VIDEO" | "DOCUMENT";
  fileName: string;
  sizeBytes: number;
  durationSec: number | null;
  downloadable: boolean;
  downloadCount: number;
};

export type EditorModule = { id: string; title: string; items: EditorItem[] };

export type EditorCourse = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  accessCode: string;
  published: boolean;
  modules: EditorModule[];
};

export function CourseEditor({ course }: { course: EditorCourse }) {
  const router = useRouter();
  const [published, setPublished] = useState(course.published);
  const [openModuleId, setOpenModuleId] = useState<string | null>(course.modules[0]?.id ?? null);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const allItems = course.modules.flatMap((m) => m.items);
  const totalBytes = allItems.reduce((sum, i) => sum + i.sizeBytes, 0);

  async function togglePublished() {
    const next = !published;
    setPublished(next);
    try {
      await apiPatch(`/api/courses/${course.id}`, { published: next });
      router.refresh();
    } catch {
      setPublished(!next);
    }
  }

  async function addModule() {
    const title = newModuleTitle.trim();
    if (!title) return;
    try {
      const data = await apiPost<{ module: { id: string } }>("/api/modules", {
        courseId: course.id,
        title,
      });
      setOpenModuleId(data.module.id);
      setNewModuleTitle("");
      setAddingModule(false);
      router.refresh();
    } catch {
      // Leave the input populated so the instructor can retry without retyping.
    }
  }

  async function deleteCourse() {
    await apiDelete(`/api/courses/${course.id}`);
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-200"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All courses
      </Link>

      <header className="animate-rise flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl text-ink-100">{course.title}</h1>
            {published ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
          </div>
          {course.subtitle && <p className="mt-2 text-[15px] text-ink-400">{course.subtitle}</p>}
          <p className="mt-3 text-[13px] text-ink-500">
            {allItems.length} files · {formatBytes(totalBytes)}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <AccessCodePill code={course.accessCode} />
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/course/${course.slug}`} target="_blank">
              <Button variant="secondary" size="sm">
                <EyeIcon className="h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={togglePublished}>
              {published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      {!published && (
        <div className="animate-rise mt-6 rounded border border-glow-500/40 border-l-[3px] border-l-glow-500 bg-glow-500/10 px-4 py-3 text-[13px] text-glow-400">
          This course is a draft — students can&apos;t open it yet, even with the code. Publish it
          when the material is ready.
        </div>
      )}

      <section className="animate-rise mt-8 space-y-4">
        {course.modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            open={openModuleId === mod.id}
            onToggle={() => setOpenModuleId(openModuleId === mod.id ? null : mod.id)}
          />
        ))}

        {addingModule ? (
          <Card className="flex flex-wrap items-center gap-2 p-4">
            <Input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addModule()}
              placeholder="Module name, e.g. Week 3 — Thermodynamics"
              autoFocus
              className="min-w-0 flex-1"
            />
            <Button size="sm" onClick={addModule} disabled={!newModuleTitle.trim()}>
              Add
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAddingModule(false)}>
              Cancel
            </Button>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setAddingModule(true)}>
            <PlusIcon className="h-4 w-4" />
            Add module
          </Button>
        )}
      </section>

      <section className="mt-14 border-t border-ink-700 pt-6">
        <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-red-700">Danger zone</h2>
        <p className="mt-1.5 text-[13px] text-ink-500">
          Deleting a course also removes every uploaded video and document from storage.
        </p>
        <Button variant="danger" size="sm" className="mt-4" onClick={() => setConfirmDelete(true)}>
          <TrashIcon className="h-4 w-4" />
          Delete this course
        </Button>
      </section>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this course?">
        <p className="text-sm leading-relaxed text-ink-300">
          <strong className="text-ink-100">{course.title}</strong> and all {allItems.length} of its
          files ({formatBytes(totalBytes)}) will be permanently deleted. Students holding the access
          code will lose access immediately. This can&apos;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Keep it
          </Button>
          <Button variant="danger" onClick={deleteCourse}>
            Delete permanently
          </Button>
        </div>
      </Modal>
    </main>
  );
}

function ModuleCard({
  module: mod,
  open,
  onToggle,
}: {
  module: EditorModule;
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function deleteModule() {
    await apiDelete(`/api/modules/${mod.id}`);
    setConfirmDelete(false);
    router.refresh();
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <p className="truncate font-serif text-[16px] font-semibold text-ink-100">{mod.title}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">
            {mod.items.length} {mod.items.length === 1 ? "file" : "files"}
          </p>
        </button>

        <Button variant="ghost" size="sm" onClick={onToggle}>
          {open ? "Close" : "Manage"}
        </Button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete module ${mod.title}`}
          className="flex h-9 w-9 items-center justify-center rounded text-ink-500 transition-colors hover:bg-ink-800 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-700 p-4">
          {mod.items.length > 0 && (
            <ul className="mb-5 space-y-1.5">
              {mod.items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </ul>
          )}
          <Uploader moduleId={mod.id} />
        </div>
      )}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this module?">
        <p className="text-sm leading-relaxed text-ink-300">
          <strong className="text-ink-100">{mod.title}</strong> and its {mod.items.length}{" "}
          {mod.items.length === 1 ? "file" : "files"} will be permanently deleted from storage.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteModule}>
            Delete
          </Button>
        </div>
      </Modal>
    </Card>
  );
}

function ItemRow({ item }: { item: EditorItem }) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [downloadable, setDownloadable] = useState(item.downloadable);
  const [saving, setSaving] = useState(false);
  const [removed, setRemoved] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    try {
      await apiPatch(`/api/items/${item.id}`, body);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setRemoved(true);
    try {
      await apiDelete(`/api/items/${item.id}`);
      router.refresh();
    } catch {
      setRemoved(false);
    }
  }

  if (removed) return null;

  const duration = formatDuration(item.durationSec);

  return (
    <li className="flex items-center gap-3 rounded-md border border-ink-700 bg-ink-900 p-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-ink-800 text-ink-400">
        {item.type === "VIDEO" ? <VideoIcon className="h-4 w-4" /> : <DocumentIcon className="h-4 w-4" />}
      </span>

      <div className="min-w-0 flex-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== item.title && patch({ title: title.trim() })}
          aria-label="Item title"
          className="w-full truncate rounded-md bg-transparent text-[13px] font-medium text-ink-100 outline-none focus:bg-ink-800 focus:px-1.5"
        />
        <p className="mt-0.5 truncate text-[11px] text-ink-500">
          {duration ? `${duration} · ` : ""}
          {formatBytes(item.sizeBytes)}
          {item.downloadCount > 0 ? ` · ${item.downloadCount} downloads` : ""}
        </p>
      </div>

      <label
        className={cn(
          "hidden shrink-0 cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[11px] transition-colors sm:flex",
          downloadable ? "text-ink-400" : "text-glow-400",
        )}
        title="Allow students to save this file to their device"
      >
        <input
          type="checkbox"
          checked={downloadable}
          disabled={saving}
          onChange={(e) => {
            setDownloadable(e.target.checked);
            patch({ downloadable: e.target.checked });
          }}
          className="h-3.5 w-3.5 accent-brand-500"
        />
        Downloadable
      </label>

      <button
        type="button"
        onClick={remove}
        aria-label={`Delete ${item.title}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-ink-500 transition-colors hover:bg-ink-800 hover:text-red-700"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </li>
  );
}
