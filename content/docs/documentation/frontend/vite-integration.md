---
title: "Frontend Integration (Vite)"
slug: "vite-integration"
description: "Scaffold Vite React/Vue/Svelte, proxy /api in dev, and deploy from public/."
summary: "First-class Vite scaffolding with dev proxy and SPA fallback."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 601
toc: true
doc_type: how-to
parent: "frontend"
seo:
  title: "Vite frontend integration"
  description: "Vite SPA alongside your Pionia Moonlight API."
  noindex: false
---

## Who this is for

You want DeskFlow's task board UI in `frontend/` — calling `task.list` through Vite's dev proxy and shipping a production build into `public/` beside the Moonlight API.

## What you will learn

- Scaffold commands for new and existing apps (`--react-ts`, `frontend:scaffold`)
- The two-terminal dev workflow (API **8000**, Vite **5173**)
- Production build, cleanup commands, and default CORS for local SPA

## Before you start

{{< prerequisites >}}
- Booted DeskFlow API (`php pionia serve` on port **8000**)
- Node.js 18+ installed
- [Frontend overview](/documentation/frontend/) — when to add a SPA to an API-first app
{{< /prerequisites >}}

## How it works

Pionia is API-first. v3 adds first-class **Vite** scaffolding — React, Vue, and Svelte templates with a dev proxy to `/api/v1/`.

{{< mermaid >}}
flowchart TB
  subgraph dev [Development]
    Vite["Vite dev server :5173"]
    Pionia["Pionia php pionia serve :8000"]
    Vite -->|"/api/* proxy"| Pionia
  end
  subgraph prod [Production]
    Build["php pionia frontend:build"]
    Build --> Index["public/index.html"]
    Index --> API2["/api/v1/ same host"]
  end
{{< /mermaid >}}

## Scaffold on a new project

Create the app, then add a frontend in the same session:

```bash
composer create-project pionia/pionia-app my-api -- --react-ts
cd my-api
php pionia serve
```

Or scaffold the frontend after the API exists:

```bash
composer create-project pionia/pionia-app my-api
cd my-api
php pionia frontend:scaffold --framework=react-ts --yes
```

Pass a framework flag to `composer create-project` after `--` (e.g. `-- --vue-ts`), or use `frontend:scaffold` on an existing app.

| Framework flag | Stack |
|----------------|-------|
| `react-ts` | React + TypeScript |
| `vue-ts` | Vue + TypeScript |
| `svelte-ts` | Svelte + TypeScript |

Creates `frontend/` with Vite config proxying API calls to your Pionia dev server.

## Development

Terminal 1 — API:

```bash
php pionia serve
```

Terminal 2 — Vite:

```bash
php pionia frontend:dev
```

DeskFlow SPA example — list tasks via relative path (works in dev proxy and production):

```typescript
const res = await fetch('/api/v1/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ service: 'task', action: 'list', status: 'open' }),
});
```

After `member.login`, attach the JWT:

```typescript
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
}
```

## Production build

```bash
php pionia frontend:build
```

Assets land in `public/assets/`; SPA entry is served via SPA fallback when `public/index.html` exists (see `[frontend] SPA_FALLBACK` in `settings.ini`).

## Cleanup

```bash
php pionia frontend:clean   # remove build output
php pionia frontend:drop    # remove frontend/ tree
```

## CORS

Default scaffold includes `[cors]` for `http://localhost:5173` in `settings.ini`.

## Common mistakes

- Using absolute `http://127.0.0.1:8000/api/v1/` in fetch — breaks after `frontend:build` on another host; prefer `/api/v1/`
- Skipping `frontend:build` before deploy — visitors get the API welcome page instead of the SPA
- Running `frontend:drop` without backing up custom components — the command removes the entire `frontend/` tree
- Testing authenticated routes without CORS headers for `Authorization` — verify `[cors]` allows your dev origin

## What's next

{{< card-grid >}}
{{< link-card title="Authentication" description="member.login and Bearer tokens in the SPA." href="/documentation/security/security-authentication-and-authorization/" >}}
{{< link-card title="API path helpers" description="apiPingPath() and apiVersionPath()." href="/documentation/extending/helpers/" >}}
{{< link-card title="RoadRunner" description="Run API + workers in production." href="/documentation/operations/roadrunner/" >}}
{{< /card-grid >}}
