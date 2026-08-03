import { API_URL, apiPost } from "./client";

/**
 * Browser-side multipart upload.
 *
 * The file is sliced and PUT straight to object storage using presigned URLs
 * obtained from the API. Nothing streams through Next.js OR the API process, so
 * uploading a 3 GB lecture never touches a server's memory or request timeout.
 *
 * Parts upload a few at a time — enough to saturate a normal connection without
 * a flaky uplink dropping all of them at once.
 */

const CONCURRENCY = 3;
const MAX_RETRIES = 3;
const URL_BATCH = 100;

export type UploadProgress = { uploadedBytes: number; totalBytes: number; percent: number };

type PresignedPart = { partNumber: number; url: string };

export async function uploadFile(opts: {
  file: File;
  moduleId: string;
  title: string;
  type: "VIDEO" | "DOCUMENT";
  durationSec?: number | null;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}): Promise<{ id: string }> {
  const { file, moduleId, title, type, durationSec, onProgress, signal } = opts;

  const init = await apiPost<{
    key: string;
    uploadId: string;
    partSize: number;
    totalParts: number;
    urls: PresignedPart[];
  }>("/api/uploads/init", {
    moduleId,
    fileName: file.name,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });

  const { key, uploadId, partSize, totalParts } = init;

  const signedUrls = new Map<number, string>();
  for (const p of init.urls) signedUrls.set(p.partNumber, p.url);

  /** Signs the next window of parts lazily so huge files need no giant response. */
  async function ensureUrl(partNumber: number): Promise<string> {
    const existing = signedUrls.get(partNumber);
    if (existing) return existing;

    const end = Math.min(totalParts, partNumber + URL_BATCH - 1);
    const partNumbers = Array.from({ length: end - partNumber + 1 }, (_, i) => partNumber + i);

    const data = await apiPost<{ urls: PresignedPart[] }>("/api/uploads/parts", {
      key,
      uploadId,
      partNumbers,
    });
    for (const p of data.urls) signedUrls.set(p.partNumber, p.url);

    const url = signedUrls.get(partNumber);
    if (!url) throw new Error("Storage did not return an upload URL.");
    return url;
  }

  const uploaded: { partNumber: number; etag: string }[] = [];
  const progressByPart = new Map<number, number>();
  let cancelled = false;

  function reportProgress() {
    let uploadedBytes = 0;
    for (const bytes of progressByPart.values()) uploadedBytes += bytes;
    onProgress?.({
      uploadedBytes,
      totalBytes: file.size,
      percent: file.size > 0 ? Math.min(99.9, (uploadedBytes / file.size) * 100) : 0,
    });
  }

  async function uploadPart(partNumber: number): Promise<void> {
    const start = (partNumber - 1) * partSize;
    const blob = file.slice(start, Math.min(start + partSize, file.size));

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (cancelled || signal?.aborted) throw new DOMException("Aborted", "AbortError");
      try {
        const url = await ensureUrl(partNumber);
        const etag = await putWithProgress(url, blob, signal, (loaded) => {
          progressByPart.set(partNumber, loaded);
          reportProgress();
        });
        uploaded.push({ partNumber, etag });
        progressByPart.set(partNumber, blob.size);
        reportProgress();
        return;
      } catch (error) {
        if (signal?.aborted || (error as Error)?.name === "AbortError") throw error;
        if (attempt === MAX_RETRIES) throw error;
        // Presigned URLs can expire mid-upload on a slow link — drop the cached
        // one so the retry signs a fresh URL rather than replaying a dead one.
        signedUrls.delete(partNumber);
        progressByPart.set(partNumber, 0);
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }

  try {
    let next = 1;
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, totalParts) }, async () => {
        while (true) {
          const partNumber = next++;
          if (partNumber > totalParts) return;
          await uploadPart(partNumber);
        }
      }),
    );

    const completed = await apiPost<{ item: { id: string } }>("/api/uploads/complete", {
      key,
      uploadId,
      moduleId,
      title,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      durationSec: durationSec ?? null,
      type,
      parts: uploaded,
    });

    onProgress?.({ uploadedBytes: file.size, totalBytes: file.size, percent: 100 });
    return { id: completed.item.id };
  } catch (error) {
    cancelled = true;
    // Release the partial upload so it doesn't sit in the bucket accruing cost.
    fetch(`${API_URL}/api/uploads/abort`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId }),
      keepalive: true,
    }).catch(() => {});
    throw error;
  }
}

/**
 * XHR rather than fetch: we need per-chunk upload progress, and fetch still has
 * no request-body progress event in browsers.
 */
function putWithProgress(
  url: string,
  blob: Blob,
  signal: AbortSignal | undefined,
  onProgress: (loaded: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag");
        if (!etag) {
          reject(
            new Error(
              "Storage did not return an ETag. Add ETag to the bucket's CORS ExposeHeaders.",
            ),
          );
          return;
        }
        resolve(etag);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Network error during upload. Check the bucket's CORS rules."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    xhr.send(blob);
  });
}

/** Reads a video's duration locally so students see the length before playing. */
export function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("video/")) return resolve(null);

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    const done = (value: number | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };

    video.onloadedmetadata = () =>
      done(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
    video.onerror = () => done(null);
    setTimeout(() => done(null), 8000);

    video.src = url;
  });
}

export function detectType(file: File): "VIDEO" | "DOCUMENT" {
  return file.type.startsWith("video/") ? "VIDEO" : "DOCUMENT";
}

/** "lecture-01_final.mp4" → "Lecture 01 Final" */
export function titleFromFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  return (
    withoutExt
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || fileName
  );
}
