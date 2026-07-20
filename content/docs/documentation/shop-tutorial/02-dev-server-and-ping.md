---
title: "Step 2 — Dev server and ping"
slug: "02-dev-server-and-ping"
description: "Start the server and confirm the API is alive."
summary: "php pionia serve + GET /api/v1/ping"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 102
toc: true
doc_type: tutorial
tutorial_step: 2
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/01-create-project/
tutorial_next: /documentation/shop-tutorial/03-your-first-service/
aliases:
  - /documentation/deskflow-tutorial/02-dev-server-and-ping/
seo:
  title: "Pionia Shop tutorial — Step 2"
---

Before you sell mugs, prove the store’s API process is running.

## What you will learn

- Start the built-in PHP server
- Hit the health endpoint and open the welcome page

{{< prerequisites >}}
- [Step 1](/documentation/shop-tutorial/01-create-project/)
{{< /prerequisites >}}

## Start the server

{{< terminal >}}
```bash
php pionia serve
```
{{< /terminal >}}

Leave that terminal open. In another terminal:

```bash
curl -s http://127.0.0.1:8000/api/v1/ping
```

You should see `returnCode: 0` and a small `pong` payload. Open `http://127.0.0.1:8000/` in a browser — the welcome page should say **Pionia Shop** if you set `APP_NAME`.

## Common mistakes

- Port already in use — change `PORT` in `.env` or stop the other process
- Curling the wrong host — use `127.0.0.1:8000` unless you changed `PORT`

{{< tutorial-nav >}}
