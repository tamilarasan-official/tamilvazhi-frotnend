/**
 * Browser-side API client.
 *
 * Every call sets `credentials: "include"` so the session cookie issued by the
 * API is sent along. The cookie is scoped to the parent domain, which makes
 * portal.yoursite.com -> api.yoursite.com a same-site request — no third-party
 * cookie blocking in Safari or Chrome.
 *
 * Login and access-code redemption go straight from the browser to the API so
 * the browser stores the Set-Cookie itself; no relaying through Next.js.
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection and try again.", 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status);
  }

  return body as T;
}

export const apiGet = <T>(path: string) => api<T>(path);

export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

export const apiPatch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export const apiDelete = <T>(path: string) => api<T>(path, { method: "DELETE" });

/**
 * Direct link to a file download.
 *
 * Points at the API rather than going through Next.js: the API redirects to a
 * presigned storage URL, so the bytes never touch either server.
 */
export const downloadUrl = (itemId: string) => `${API_URL}/api/files/${itemId}/download`;
