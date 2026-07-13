---
title: "Frontend"
description: "Vite SPA integration with the Moonlight API."
summary: "Scaffold React or Vue, proxy /api in dev, and deploy from public/."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 600
url: /documentation/frontend/
toc: true
doc_type: topic
sidebar:
  collapsed: true
seo:
  title: "Frontend integration"
  description: "Vite SPA alongside your Pionia API."
---

## Who this is for

You have DeskFlow's Moonlight API running on port **8000** and want a React or Vue task board that calls `task.list` and `member.login` — same origin in production, proxied `/api` during local dev.

## What you will learn

- When to run `frontend:scaffold` vs `composer create-project … --react-ts`
- How Vite dev (`:5173`) proxies to Pionia (`:8000`)
- Where built assets land (`public/`) and how SPA fallback works

## Before you start

{{< prerequisites >}}
- [DeskFlow tutorial Step 1](/documentation/deskflow-tutorial/01-create-project/) — `task.list` returns data on **8000**
- Node.js 18+ for Vite
- Optional: [Authentication](/documentation/security/security-authentication-and-authorization/) — Bearer JWT from `member.login` in the SPA
{{< /prerequisites >}}

## How it works

Pionia ships optional **Vite** scaffolding so DeskFlow can have a React or Vue task board calling `task.list` over the same origin in production.

{{< mermaid >}}
flowchart LR
  Dev["Vite :5173"] -->|proxy /api| API["Pionia :8000"]
  API --> Moonlight["POST task.list"]
  Build["frontend:build"] --> Public["public/index.html + assets"]
  Browser[Production browser] --> Public
  Public --> Moonlight2["same-origin /api/v1/"]
{{< /mermaid >}}

## Guide

| Page | What you build |
|------|----------------|
| [Vite integration](/documentation/frontend/vite-integration/) | Dev proxy, build to `public/`, SPA fallback |

Quick start:

```bash
php pionia frontend:scaffold --framework=react-ts --yes
php pionia serve          # terminal 1 — API on :8000
php pionia frontend:dev   # terminal 2 — Vite on :5173
```

## Common mistakes

- Running only Vite without `php pionia serve` — API calls to `/api` fail with connection errors
- Hard-coding `http://127.0.0.1:8000` in frontend fetch URLs — use relative `/api/v1/` so production same-origin works
- Forgetting `frontend:build` before deploy — production serves from `public/`, not `frontend/`
- Missing `[cors]` for `:5173` when testing auth headers from the browser

## What's next

{{< card-grid >}}
{{< link-card title="Vite integration" description="Scaffold, dev, build, and CORS setup." href="/documentation/frontend/vite-integration/" >}}
{{< link-card title="API path helpers" description="apiVersionPath() for frontend config." href="/documentation/extending/helpers/" >}}
{{< link-card title="Authentication" description="Send Bearer JWT from the SPA." href="/documentation/security/security-authentication-and-authorization/" >}}
{{< /card-grid >}}
