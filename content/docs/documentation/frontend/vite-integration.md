---
title: "Frontend Integration (Vite)"
slug: "vite-integration"
weight: 601
toc: true
seo:
  title: "Vite frontend integration"
  noindex: false
---

Pionia is API-first. v3 adds first-class **Vite** scaffolding — React, Vue, and Svelte templates with a dev proxy to `/api/v1/`.

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
