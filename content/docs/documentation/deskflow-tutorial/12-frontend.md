---
title: "Step 12 — Frontend (optional)"
slug: "12-frontend"
description: "Scaffold a Vite React task board that proxies /api to DeskFlow."
summary: "frontend:scaffold and frontend:dev"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 112
toc: true
doc_type: tutorial
tutorial_step: 12
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/11-background-work/
tutorial_next: /documentation/deskflow-tutorial/13-deploy/
seo:
  title: "DeskFlow tutorial — Step 12"
---

Optional but recommended: a **React task board** that talks to the same Moonlight API.

## What you will learn

- Scaffold Vite in `frontend/`
- Proxy `/api` to port **8000** during dev
- Build into `public/` for production

{{< prerequisites >}}
- [Step 7+](/documentation/deskflow-tutorial/07-create-tasks/) — working task API
- Node.js **20+** for Vite
{{< /prerequisites >}}

## Scaffold

Terminal 1 — API:

```bash
php pionia serve
```

Terminal 2 — frontend:

```bash
php pionia frontend:scaffold --framework=react-ts --yes
php pionia frontend:dev
```

Open **http://127.0.0.1:5173** — Vite proxies `/api/v1/` to your Pionia server.

Fetch tasks from your React app:

```typescript
const res = await fetch('/api/v1/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ service: 'task', action: 'list' }),
});
```

Production build:

```bash
php pionia frontend:build
```

Full guide: [Vite integration](/documentation/frontend/vite-integration/).

## Common mistakes

- **CORS errors when calling :8000 from :5173** — use Vite proxy, not hard-coded API URL in dev.
- **Forgetting JWT header on create** — pass `Authorization` from login state.

{{< tutorial-nav >}}
