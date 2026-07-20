---
title: "Welcome page and branding"
slug: "welcome-page-and-branding"
description: "How GET / chooses the welcome page or SPA shell, and how APP_NAME brands your app."
summary: "Name your app with APP_NAME; framework welcome at / until you ship public/index.html."
date: 2026-07-20
lastmod: 2026-07-20
draft: false
weight: 215
toc: true
doc_type: topic
parent: "http"
seo:
  title: "Welcome page and branding — Pionia"
  description: "Configure APP_NAME and the framework welcome page vs public/index.html SPA shell."
  noindex: false
---

## Who this is for

You just created **pionia-shop** and opened `http://127.0.0.1:8000/` — you want the page to say **Pionia Shop** (or your product name), not a generic placeholder, and you need to know when the framework welcome page goes away.

## What you will learn

- How `GET /` chooses between the framework welcome page and your SPA
- Where `APP_NAME` is used (welcome, docs title, logger)
- Optional `[welcome]` toggles to hide sections

## Before you start

{{< prerequisites >}}
- [Introduction](/documentation/getting-started/introduction/) — project created
- Optional: [Vite integration](/documentation/frontend/vite-integration/) if you plan a SPA
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart TD
  Get["GET /"] --> Spa{"public/index.html exists?"}
  Spa -->|yes| Index[Serve SPA shell]
  Spa -->|no| Welcome[FrameworkWelcomePage]
  Welcome --> Assets["/__pionia/* assets"]
{{< /mermaid >}}

| URL | What serves it |
|-----|----------------|
| `/` | `public/index.html` if present, otherwise the framework welcome page |
| `/__pionia/{path}` | Framework assets (CSS, logo, favicon) — do not copy into `public/static/` |
| `/static/{path}` | Your files under `public/static/` |
| `/media/{path}` | Uploads under `storage/media` |

The welcome page is **framework-owned**. Brand it with config; do not fork the HTML into your app.

## Set your app name

In `environment/.env` (preferred) or settings:

```env
APP_NAME=Pionia Shop
```

Pionia humanizes the value for display (e.g. `pionia-shop` → a readable title). The welcome navbar leads with this name, and Moonlight docs / logger naming pick it up too.

{{< callout context="tip" title="IDE Workspace Trust" icon="outline/bulb" >}}
VS Code and JetBrains may ask you to **trust the folder** the first time you open a new project. That is expected — accept once so the PHP language server and Composer tooling work. New scaffolds mention this in the generated README.
{{< /callout >}}

## Optional welcome sections

`environment/settings.ini`:

```ini
[welcome]
HIDE_CONTEXT=false
HIDE_QUICK_START=false
HIDE_ENV=false
HIDE_PORT=false
```

Set any flag to `true` to hide that block on the welcome page (useful for demos).

## When the welcome page disappears

After `php pionia frontend:build` (or any process that writes `public/index.html`), `/` serves your SPA. API routes under `/api/` are unchanged. Framework assets remain at `/__pionia/`.

## Environment directory

Pionia loads `.env` and `settings.ini` from the app's `environment/` directory (resolved from the application base path). Running the CLI from a subdirectory still finds the correct `environment/` — you do not need to `cd` for config to load.

## Common mistakes

- **Leaving `APP_NAME` as the Composer package slug** — set a product name people recognize on the welcome page.
- **Copying `/__pionia` assets into `public/static/`** — they are served from the framework package; duplication goes stale on upgrades.
- **Expecting the welcome page after deploying a Vite build** — `public/index.html` wins by design.

## What's next

{{< card-grid >}}
{{< link-card title="Requests & responses" description="Static, media, and HTTP basics." href="/documentation/http/requests-and-responses/" >}}
{{< link-card title="Vite integration" description="Scaffold a frontend and ship public/index.html." href="/documentation/frontend/vite-integration/" >}}
{{< link-card title="Application structure" description="Where environment/ and public/ live." href="/documentation/getting-started/application-structure/" >}}
{{< /card-grid >}}
