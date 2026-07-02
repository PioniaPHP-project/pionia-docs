---
title: "Frontend Integration (Vite)"
slug: "frontend-integration-vite"
parent: "documentation"
description: "Scaffold and deploy a Vite SPA alongside the Moonlight API."
date: 2024-05-24T13:45:48.890Z
lastmod: 2026-06-25T00:00:00.000Z
draft: false
weight: 900
toc: true
seo:
  title: "Vite frontend integration"
  noindex: false
---

Pionia is API-first. v3 adds first-class **Vite** scaffolding — React, Vue, and Svelte templates with a dev proxy to `/api/v1/`.

## Scaffold on new project

When creating an app you can pick a frontend template interactively or pass a flag:

```bash
php pionia new my-app --install --vue-ts
composer create-project pionia/pionia-app my-api -- --react-ts
```

| Framework flag | Stack |
|----------------|-------|
| `react-ts` | React + TypeScript (default when prompted) |
| `vue-ts` | Vue + TypeScript |
| `svelte-ts` | Svelte + TypeScript |

`--with-frontend=react-ts` is an alias for the framework flag. Non-TTY environments (CI, tests) skip prompts unless a flag is passed.

## Scaffold in existing project

```bash
php pionia frontend:scaffold --framework=react-ts --yes
```

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
