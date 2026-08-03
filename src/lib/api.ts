import { cookies } from "next/headers";

/**
 * Server-side API client, for use in server components and route handlers.
 *
 * Cookies live on the parent domain (".yoursite.com") and are set by the API
 * directly in the browser. When this server renders a page it must forward the
 * visitor's cookies onward, otherwise every request would look anonymous and
 * the student would be asked for their access code on every page load.
 *
 * INTERNAL_API_URL lets server-to-server calls go over Dokploy's private
 * network (http://portal24-api:4000), skipping the public internet and TLS
 * termination. Falls back to the public URL when unset.
 */

const SERVER_BASE = (
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

export async function serverApi<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const cookieHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(`${SERVER_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(init.headers ?? {}),
      },
      // Course content changes whenever the instructor uploads; never serve a
      // student a cached tree.
      cache: "no-store",
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await res.json() : null;

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: body?.error ?? `Request failed (${res.status})`,
      };
    }

    return { ok: true, status: res.status, data: body as T };
  } catch (error) {
    // A dead API shouldn't render a stack trace at the student.
    console.error(`[web] ${path} failed:`, error instanceof Error ? error.message : error);
    return { ok: false, status: 503, error: "The course service is unavailable. Please try again shortly." };
  }
}

/** Convenience wrapper: returns null instead of an error shape. */
export async function serverApiOrNull<T>(path: string): Promise<T | null> {
  const result = await serverApi<T>(path);
  return result.ok ? result.data : null;
}

/** The signed-in instructor, or null. Used to gate /admin pages. */
export async function getAdminSession(): Promise<{ id: string; email: string; name: string } | null> {
  const result = await serverApi<{ admin: { id: string; email: string; name: string } }>("/api/auth/me");
  return result.ok ? result.data.admin : null;
}
