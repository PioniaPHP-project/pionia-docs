---
title: "Step 13 — Deploy"
slug: "13-deploy"
description: "What deploy means, then migrate, optimize, and run RoadRunner for Pionia Shop."
summary: "Leave laptop serve; run a real server process"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 113
toc: true
doc_type: tutorial
tutorial_step: 13
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/12-frontend/
tutorial_next: /documentation/shop-tutorial/14-app-provider/
aliases:
  - /documentation/deskflow-tutorial/13-deploy/
seo:
  title: "Pionia Shop tutorial — Step 13 (Deploy)"
---

`php pionia serve` is for learning. Real customers need a process that stays up, uses production secrets, and runs your migrations on a real database.

## What does “deploy” mean? (in general)

**Deploy** = put your app on a machine (or container) the public can reach, with:

1. **Code** installed (`composer install --no-dev`)
2. **Config** for that environment (`.env` with real `JWT_SECRET`, DB password)
3. **Schema** applied (`migrate`)
4. **A long-running HTTP server** (PHP-FPM behind Nginx, or RoadRunner workers)

Local `serve` starts a tiny built-in server and exits when you close the terminal. Production uses a **worker** or FPM pool that handles many requests.

RoadRunner is optional but nice for Pionia: boot PHP once, handle many HTTP requests in a loop (faster than starting PHP from scratch each time).

## What you will learn

- A minimal production checklist for Pionia Shop
- Where to put secrets
- How to smoke-test with ping

{{< prerequisites >}}
- Shop API works locally through at least [Step 9](/documentation/shop-tutorial/09-authentication/)
{{< /prerequisites >}}

## Minimal checklist

```bash
composer install --no-dev -o
php pionia migrate
php pionia optimize --production
php pionia runserver --detach
curl -s http://127.0.0.1:8000/api/v1/ping
```

Put real `JWT_SECRET` and database credentials in the server `.env` — never in git.

If you built a frontend (Step 12), run `frontend:build` on the server (or in CI) so `public/` has the storefront assets.

Guides: [RoadRunner](/documentation/operations/roadrunner/) and [Production performance](/documentation/operations/production-performance/).

## Common mistakes

- Shipping with `DEBUG=true` and a toy JWT secret
- Forgetting `migrate` on the new host — empty database, confusing 500s
- Pointing DNS at the machine but never opening the firewall / reverse proxy to the app port

{{< tutorial-nav >}}
