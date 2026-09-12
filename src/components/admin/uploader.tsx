"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Button, cn } from "../ui";
import { UploadCloudIcon, VideoIcon, DocumentIcon, CheckIcon, TrashIcon } from "../icons";
import { formatBytes } from "@/lib/format";
import {
  uploadFile,
  readVideoDuration,
  detectType,
  titleFromFileName,
} from "@/lib/upload-client";

type QueueItem = {
  id: string;
  file: File;
  title: string;
  type: "VIDEO" | "DOCUMENT";
  status: "queued" | "uploading" | "done" | "error" | "cancelled";
  percent: number;
  error?: string;
  controller?: AbortController;
};

let counter = 0;

export function Uploader({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);

  const update = useCallback((id: string, patch: Partial<QueueItem>) => {
    setQueue((q) => q.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: QueueItem[] = Array.from(files).map((file) => ({
      id: `q${++counter}`,
      file,
      title: titleFromFileName(file.name),
      type: detectType(file),
      status: "queued",
      percent: 0,
    }));
    setQueue((q) => [...q, ...next]);
  }, []);

  async function startAll() {
    setBusy(true);
    // Sequential: two 2 GB uploads in parallel just split the same uplink and
    // make both progress bars crawl.
    for (const item of queue) {
      if (item.status !== "queued" && item.status !== "error") continue;

      const controller = new AbortController();
      update(item.id, { status: "uploading", percent: 0, error: undefined, controller });

      try {
        const durationSec =
          item.type === "VIDEO" ? await readVideoDuration(item.file) : null;

        await uploadFile({
          file: item.file,
          moduleId,
          title: item.title.trim() || item.file.name,
          type: item.type,
          durationSec,
          signal: controller.signal,
          onProgress: (p) => update(item.id, { percent: p.percent }),
        });

        update(item.id, { status: "done", percent: 100 });
      } catch (error) {
        const err = error as Error;
        if (err?.name === "AbortError") {
          update(item.id, { status: "cancelled" });
        } else {
          update(item.id, { status: "error", error: err?.message ?? "Upload failed." });
        }
      }
    }

    setBusy(false);
    router.refresh();
  }

  const pending = queue.filter((q) => q.status === "queued" || q.status === "error").length;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-md border border-dashed bg-white px-6 py-10 text-center transition-colors",
          dragging
            ? "border-brand-500 bg-brand-500/5"
            : "border-ink-600 hover:border-ink-500",
        )}
      >
        <UploadCloudIcon className="h-9 w-9 text-ink-500" />
        <p className="mt-3 text-[15px] font-medium text-ink-200">
          Drop videos and documents here
        </p>
        <p className="mt-1 text-[13px] text-ink-500">
          MP4, MOV, PDF, DOCX, PPTX, ZIP — up to 20 GB each
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </Button>
      </div>

      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          {queue.map((item) => (
            <QueueRow
              key={item.id}
              item={item}
              disabled={busy}
              onTitleChange={(title) => update(item.id, { title })}
              onRemove={() => {
                item.controller?.abort();
                setQueue((q) => q.filter((x) => x.id !== item.id));
              }}
            />
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-[13px] text-ink-500">
              {queue.filter((q) => q.status === "done").length} of {queue.length} uploaded
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setQueue((q) => q.filter((x) => x.status === "uploading"))}
              >
                Clear list
              </Button>
              <Button size="sm" onClick={startAll} disabled={busy || pending === 0}>
                {busy ? "Uploading…" : `Upload ${pending} file${pending === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QueueRow({
  item,
  disabled,
  onTitleChange,
  onRemove,
}: {
  item: QueueItem;
  disabled: boolean;
  onTitleChange: (title: string) => void;
  onRemove: () => void;
}) {
  const statusColor = {
    queued: "text-ink-500",
    uploading: "text-brand-400",
    done: "text-emerald-700",
    error: "text-red-700",
    cancelled: "text-ink-500",
  }[item.status];

  return (
    <div className="rounded-md border border-ink-700 bg-ink-900 p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-ink-800 text-ink-400">
          {item.status === "done" ? (
            <CheckIcon className="h-4 w-4 text-emerald-700" />
          ) : item.type === "VIDEO" ? (
            <VideoIcon className="h-4 w-4" />
          ) : (
            <DocumentIcon className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <input
            value={item.title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={item.status === "uploading" || item.status === "done"}
            aria-label={`Title for ${item.file.name}`}
            className="w-full truncate rounded-md bg-transparent text-[13px] font-medium text-ink-100 outline-none focus:bg-ink-800 focus:px-1.5 disabled:opacity-70"
          />
          <p className={cn("mt-0.5 truncate text-[11px]", statusColor)}>
            {item.status === "error"
              ? item.error
              : item.status === "uploading"
                ? `${item.percent.toFixed(0)}% · ${formatBytes(item.file.size)}`
                : item.status === "done"
                  ? "Uploaded"
                  : item.status === "cancelled"
                    ? "Cancelled"
                    : formatBytes(item.file.size)}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled && item.status !== "uploading"}
          aria-label="Remove from queue"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-ink-500 transition-colors hover:bg-ink-800 hover:text-red-700 disabled:opacity-40"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {(item.status === "uploading" || item.status === "done") && (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-800">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-200",
              item.status === "done" ? "bg-emerald-600" : "bg-brand-500",
            )}
            style={{ width: `${item.percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
