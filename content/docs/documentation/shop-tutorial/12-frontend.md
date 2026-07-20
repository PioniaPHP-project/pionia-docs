---
title: "Step 12 — Frontend (optional)"
slug: "12-frontend"
description: "What a frontend is, how it talks to your API, and optional Vite for Pionia Shop."
summary: "Browser UI + JSON API — same shop, two layers"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 112
toc: true
doc_type: tutorial
tutorial_step: 12
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/11-background-work/
tutorial_next: /documentation/shop-tutorial/13-deploy/
aliases:
  - /documentation/deskflow-tutorial/12-frontend/
seo:
  title: "Pionia Shop tutorial — Step 12 (Frontend)"
---

So far you have built the **API**: JSON in, JSON out. Ada’s real shopping experience is usually a **website or mobile app** that *calls* that API. This step explains what “frontend” means, then optionally scaffolds a Vite UI for Pionia Shop.

**You can skip this step** if you only care about the backend.

## What is a frontend? (in general)

| Layer | Runs where | Job in Pionia Shop |
|-------|------------|--------------------|
| **Backend / API** | Your PHP server | Products, login, orders, wallet |
| **Frontend** | Browser or phone | Screens, buttons, forms Ada taps |

The frontend does **not** replace your services. It is a client:

1. Show a product list page.
2. `POST /api/v1/` with `{ "service": "product", "action": "list" }`.
3. Render the JSON as cards and prices.
4. On checkout, send Ada’s Bearer token with `order.place`.

```text
┌──────────────────────┐         ┌──────────────────────┐
│  Browser (React/Vue) │  HTTP   │  Pionia (PHP)        │
│  “frontend”          │ ──────► │  product / order / … │
│  buttons & pages     │ ◄────── │  JSON envelopes      │
└──────────────────────┘         └──────────────────────┘
```

### Why a separate Vite app?

Modern UIs are often built with **React**, **Vue**, or similar, and a bundler called **Vite** for fast local reload. In development you typically run:

- **Terminal 1:** Pionia API on port `8000`
- **Terminal 2:** Vite on port `5173`

The browser talks to Vite; Vite **proxies** `/api` to Pionia so you avoid messy CORS setup while learning. In production you **build** the frontend into static files under `public/`, and one server can serve both the HTML and the API.

## What you will learn

- How frontend and API split responsibilities
- Scaffold a React (TypeScript) storefront
- Run API + Vite together; know how production build works

{{< prerequisites >}}
- [Step 3](/documentation/shop-tutorial/03-your-first-service/) — `product.list` works with curl
- Node.js installed (for Vite)
{{< /prerequisites >}}

## Scaffold and run

{{< step >}}
**1. Create the frontend folder**

{{< terminal >}}
```bash
php pionia frontend:scaffold --framework=react-ts --yes
```
{{< /terminal >}}

This adds a `frontend/` app configured to call your Moonlight API.
{{< /step >}}

{{< step >}}
**2. Run both processes**

```bash
php pionia serve          # terminal 1 — API (e.g. :8000)
php pionia frontend:dev   # terminal 2 — Vite (e.g. :5173)
```

Open the Vite URL in the browser. Pages that fetch `/api/...` are forwarded to Pionia.
{{< /step >}}

{{< step >}}
**3. Production build (when you deploy)**

```bash
php pionia frontend:build
```

Built assets land in `public/` so visitors hit one origin. Details: [Vite integration](/documentation/frontend/vite-integration/).
{{< /step >}}

## What to build first in the UI

Keep the first screen tiny:

1. List products from `product.list` (no login).
2. Login form → store the token (memory or `localStorage` for learning).
3. “Add product” only when a token exists (calls `product.create` with Bearer).

You already proved those curls in earlier steps — the UI is only a nicer client.

## Common mistakes

- Expecting PHP to “render React” without a build step — Vite produces static JS/CSS
- Calling `http://127.0.0.1:8000` from the browser in dev without proxy/CORS — prefer the `/api` proxy
- Putting secrets (JWT signing key) in frontend code — only the **token** belongs in the browser, never `JWT_SECRET`

## What's next

Deploy the API (and optional built UI) in the next step — or skip straight there if you stayed API-only.

{{< tutorial-nav >}}
