"use client";

import { useEffect, useState } from "react";
import { SpinnerIcon } from "./icons";
import { apiGet, ApiError } from "@/lib/client";

/**
 * Fetches a short-lived signed URL from the API, then points a plain <video>
 * at object storage directly.
 *
 * Going direct matters: range requests for seeking and buffering hit storage,
 * not the API container, so scrubbing stays instant no matter how many students
 * are watching at once.
 */
export function VideoPlayer({
  itemId,
  title,
  poster,
}: {
  itemId: string;
  title: string;
  poster?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setError(null);

    apiGet<{ url: string }>(`/api/files/${itemId}/url`)
      .then((data) => {
        if (!cancelled) setSrc(data.url);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "This video couldn't be loaded.");
      });

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
      {src ? (
        <video
          key={itemId}
          src={src}
          poster={poster}
          controls
          controlsList="nodownload"
          preload="metadata"
          playsInline
          className="h-full w-full"
          aria-label={title}
          onError={() => setError("Playback failed. The link may have expired — reload the page.")}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {error ? (
            <p className="px-6 text-center text-sm text-ink-400">{error}</p>
          ) : (
            <SpinnerIcon className="h-7 w-7 text-ink-500" />
          )}
        </div>
      )}
    </div>
  );
}
