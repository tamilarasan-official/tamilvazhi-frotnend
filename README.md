# portal24-web

Frontend for the course portal. **Next.js 15 (App Router) + TypeScript + Tailwind v4.**

Pairs with [`portal24-api`](../backend) — deploy each as its own Dokploy application. This repo holds no database and no business logic; it renders the UI and calls the API.

---

## What's in it

**Student side** (no account, no password)
- `/` — enter an access code, or see your unlocked courses
- `/access` — add another course
- `/course/[slug]` — video player, module playlist, search, download buttons

**Instructor side**
- `/admin/login` — email + password
- `/admin` — dashboard: courses, file counts, storage used, download totals
- `/admin/courses/[id]` — modules, drag-and-drop uploads with progress, publish toggle

---

## How it talks to the API

Two paths, deliberately:

**Server components → API** (`src/lib/api.ts`)
Page rendering forwards the visitor's cookies to the API so content is server-rendered. Set `INTERNAL_API_URL` to the Dokploy internal hostname and these calls skip the public internet and TLS entirely.

**Browser → API** (`src/lib/client.ts`)
Logins, access codes, uploads and mutations go straight from the browser to the API with `credentials: "include"`, so the browser stores the session cookie itself — nothing is relayed through Next.js.

**File bytes never touch this server.** Uploads go browser → object storage via presigned URLs; downloads are a link to the API, which redirects to a signed storage URL.

### The cookie setup

The API issues cookies on the **parent domain** (`COOKIE_DOMAIN=.yoursite.com`). With the frontend on `portal.yoursite.com` and the API on `api.yoursite.com`, requests between them are **same-site**, so ordinary `SameSite=Lax` cookies work and nothing is affected by Safari's ITP or Chrome's third-party cookie restrictions.

If you ever move the two to unrelated domains, you'd need `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true` on the API — and you'd be relying on third-party cookies, which browsers are actively restricting. Subdomains are the durable choice.

---

## Local development

Start the API first (see `../backend`), then:

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

On localhost, cookies set by `localhost:4000` are sent to `localhost:3000` — ports are not part of cookie scope — so leave `COOKIE_DOMAIN` **blank** on the API in development. Browsers reject a `Domain` attribute on a bare hostname, and setting one makes login silently fail.

---

## Deploying to Dokploy

**Create → Application → Dockerfile**, pointed at this repo.

**Environment tab:**

```
NEXT_PUBLIC_API_URL=https://api.yoursite.com
NEXT_PUBLIC_SITE_NAME=Your Academy
INTERNAL_API_URL=http://portal24-api:4000
```

**Build Arguments tab** — this is the step that catches people out:

```
NEXT_PUBLIC_API_URL=https://api.yoursite.com
NEXT_PUBLIC_SITE_NAME=Your Academy
```

> `NEXT_PUBLIC_*` values are **inlined into the JavaScript bundle at build time**. Setting them only as runtime environment variables leaves the deployed browser bundle calling `http://localhost:4000`, and every student sees a connection error. They must be set in **both** tabs.

**Domains:** `portal.yoursite.com`, port `3000`, HTTPS enabled.

Deploy the API first so `INTERNAL_API_URL` resolves.

---

## Project structure

```
src/lib/api.ts            server-side API client, forwards cookies
src/lib/client.ts         browser API client, credentials: include
src/lib/upload-client.ts  chunked multipart uploader with retry + progress
src/lib/format.ts         bytes, durations, dates, file extensions

src/app/page.tsx          student home
src/app/course/[slug]/    student course viewer
src/app/admin/            instructor dashboard and editor

src/components/           UI (no data fetching except via lib/client)
```

---

## Design notes

- **Dark, single-theme.** Course video is the focus; a dark surface keeps the player the brightest thing on screen.
- **No icon or UI library.** Icons are inline SVG and primitives live in `components/ui.tsx`, so the shared bundle stays ~103 kB.
- **Documents don't get an inline preview.** Embedded PDF viewers are unreliable on mobile browsers, and the goal is getting the file onto the student's device anyway — so documents get a large download target plus "Open in browser".
- **`prefers-reduced-motion` is respected** throughout.
- **The whole site sends `noindex`** so paid course material stays out of search results.
