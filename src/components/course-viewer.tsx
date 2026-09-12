"use client";

import { useMemo, useState } from "react";
import { VideoPlayer } from "./video-player";
import { Badge, Button, LinkButton, EmptyState, cn } from "./ui";
import {
  DocumentIcon,
  DownloadIcon,
  PlayIcon,
  SearchIcon,
  VideoIcon,
  ChevronDownIcon,
  FolderIcon,
} from "./icons";
import { formatBytes, formatDuration, fileExtension } from "@/lib/format";
import { apiGet, downloadUrl } from "@/lib/client";
import type { ClientCourse, ClientItem } from "@/lib/types";

export function CourseViewer({ course }: { course: ClientCourse }) {
  const allItems = useMemo(() => course.modules.flatMap((m) => m.items), [course.modules]);

  const firstVideo = allItems.find((i) => i.type === "VIDEO");
  const [activeId, setActiveId] = useState<string | null>(
    firstVideo?.id ?? allItems[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const active = allItems.find((i) => i.id === activeId) ?? null;

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return course.modules;
    return course.modules
      .map((m) => ({
        ...m,
        items: m.items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.fileName.toLowerCase().includes(q) ||
            (i.description ?? "").toLowerCase().includes(q),
        ),
      }))
      .filter((m) => m.items.length > 0);
  }, [course.modules, query]);

  const videoCount = allItems.filter((i) => i.type === "VIDEO").length;
  const docCount = allItems.length - videoCount;
  const totalBytes = allItems.reduce((sum, i) => sum + i.sizeBytes, 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6">
      <header className="animate-rise mb-8 border-b border-ink-700 pb-6">
        <p className="eyebrow mb-2">Course</p>
        <h1 className="text-balance text-3xl text-ink-100 sm:text-4xl">
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink-400">
            {course.subtitle}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="brand">
            <VideoIcon className="h-3.5 w-3.5" />
            {videoCount} {videoCount === 1 ? "video" : "videos"}
          </Badge>
          <Badge tone="glow">
            <DocumentIcon className="h-3.5 w-3.5" />
            {docCount} {docCount === 1 ? "document" : "documents"}
          </Badge>
          <Badge>{formatBytes(totalBytes)} total</Badge>
        </div>
      </header>

      {allItems.length === 0 ? (
        <EmptyState
          icon={<FolderIcon className="h-10 w-10" />}
          title="Nothing here yet"
          description="Your instructor hasn't uploaded any material for this course. Check back soon."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
          {/* ── Viewer ─────────────────────────────────────────── */}
          <section className="animate-rise min-w-0">
            {active ? (
              <div className="panel overflow-hidden rounded-md">
                {active.type === "VIDEO" ? (
                  <VideoPlayer itemId={active.id} title={active.title} />
                ) : (
                  <DocumentPreview item={active} />
                )}

                <div className="border-t border-ink-700 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-pretty text-xl leading-snug text-ink-100">
                        {active.title}
                      </h2>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-400">
                        <span>{fileExtension(active.fileName)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatBytes(active.sizeBytes)}</span>
                        {formatDuration(active.durationSec) && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{formatDuration(active.durationSec)}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {active.downloadable ? (
                      <LinkButton href={downloadUrl(active.id)}>
                        <DownloadIcon className="h-4 w-4" />
                        Download
                      </LinkButton>
                    ) : (
                      <Badge>Streaming only</Badge>
                    )}
                  </div>

                  {active.description && (
                    <p className="mt-4 whitespace-pre-line text-pretty text-sm leading-relaxed text-ink-300">
                      {active.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState title="Select an item from the list" />
            )}
          </section>

          {/* ── Playlist ───────────────────────────────────────── */}
          <aside className="animate-rise min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="panel flex max-h-[calc(100dvh-8rem)] flex-col rounded-md">
              <div className="border-b border-ink-700 p-3">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search this course…"
                    aria-label="Search course content"
                    className="h-10 w-full rounded border border-ink-600 bg-white pl-9 pr-3 text-sm text-ink-100 outline-none placeholder:text-ink-500 transition-[border-color,box-shadow] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {filteredModules.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-ink-500">
                    No results for “{query}”.
                  </p>
                ) : (
                  filteredModules.map((mod) => {
                    const isCollapsed = collapsed[mod.id] && !query;
                    return (
                      <div key={mod.id} className="mb-1">
                        <button
                          type="button"
                          onClick={() => setCollapsed((c) => ({ ...c, [mod.id]: !c[mod.id] }))}
                          className="flex w-full items-center justify-between gap-2 rounded px-3 py-2.5 text-left transition-colors hover:bg-ink-800"
                          aria-expanded={!isCollapsed}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-ink-200">
                              {mod.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-ink-500">
                              {mod.items.length} {mod.items.length === 1 ? "item" : "items"}
                            </span>
                          </span>
                          <ChevronDownIcon
                            className={cn(
                              "h-4 w-4 shrink-0 text-ink-500 transition-transform",
                              isCollapsed && "-rotate-90",
                            )}
                          />
                        </button>

                        {!isCollapsed && (
                          <ul className="mt-0.5 space-y-0.5">
                            {mod.items.map((item) => (
                              <li key={item.id}>
                                <PlaylistRow
                                  item={item}
                                  active={item.id === activeId}
                                  onSelect={() => setActiveId(item.id)}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function PlaylistRow({
  item,
  active,
  onSelect,
}: {
  item: ClientItem;
  active: boolean;
  onSelect: () => void;
}) {
  const duration = formatDuration(item.durationSec);

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md pr-1.5 transition-colors",
        active ? "bg-brand-500/15" : "hover:bg-ink-800",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-3 px-2.5 py-2.5 text-left"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors",
            active ? "bg-brand-500 text-white" : "bg-ink-800 text-ink-400 group-hover:text-ink-200",
          )}
        >
          {item.type === "VIDEO" ? (
            <PlayIcon className="ml-0.5 h-3 w-3" />
          ) : (
            <DocumentIcon className="h-4 w-4" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-[13px] leading-snug",
              active ? "font-medium text-ink-100" : "text-ink-200",
            )}
          >
            {item.title}
          </span>
          <span className="mt-0.5 block text-[11px] text-ink-500">
            {duration ? `${duration} · ` : ""}
            {formatBytes(item.sizeBytes)}
          </span>
        </span>
      </button>

      {item.downloadable && (
        <a
          href={downloadUrl(item.id)}
          title={`Download ${item.fileName}`}
          aria-label={`Download ${item.title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-ink-500 opacity-0 transition-all hover:bg-ink-700 hover:text-ink-100 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <DownloadIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

/**
 * Documents get a large tap target rather than an inline preview: embedded PDF
 * viewers are unreliable on mobile browsers, and the goal is to get the file
 * onto the student's device anyway.
 */
function DocumentPreview({ item }: { item: ClientItem }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center bg-ink-800 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-md border border-ink-600 bg-white text-brand-500">
        <DocumentIcon className="h-9 w-9" />
      </div>
      <p className="mt-4 text-sm font-semibold tracking-wider text-ink-300">
        {fileExtension(item.fileName)}
      </p>
      <p className="mt-1 max-w-sm truncate text-[13px] text-ink-500">{item.fileName}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {item.downloadable && (
          <LinkButton href={downloadUrl(item.id)}>
            <DownloadIcon className="h-4 w-4" />
            Download
          </LinkButton>
        )}
        <OpenInNewTab itemId={item.id} />
      </div>
    </div>
  );
}

function OpenInNewTab({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const data = await apiGet<{ url: string }>(`/api/files/${itemId}/url`);
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      // The Download button remains as a fallback; no need to alarm the student.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={open} disabled={loading}>
      {loading ? "Opening…" : "Open in browser"}
    </Button>
  );
}
