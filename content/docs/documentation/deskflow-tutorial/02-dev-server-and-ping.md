---
title: "Step 2 — Dev server and ping"
slug: "02-dev-server-and-ping"
description: "Run php pionia serve and call your first API endpoints."
summary: "GET /api/v1/ping and welcome.ping"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 102
toc: true
doc_type: tutorial
tutorial_step: 2
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/01-create-project/
tutorial_next: /documentation/deskflow-tutorial/03-your-first-service/
seo:
  title: "DeskFlow tutorial — Step 2"
---

Your app exists on disk; now prove it **responds over HTTP**.

## What you will learn

- Start the built-in dev server on port **8000**
- Call `GET /api/v1/ping` and a Moonlight `welcome.ping` action

{{< prerequisites >}}
- [Step 1 — Create project](/documentation/deskflow-tutorial/01-create-project/) completed
{{< /prerequisites >}}

## Start the server

From **`deskflow-api/`**:

{{< terminal >}}
```bash
php pionia serve
```
{{< /terminal >}}

In a **second terminal** (same project root):

{{< terminal >}}
```bash
curl -s http://127.0.0.1:8000/api/v1/ping
```
{{< /terminal >}}

{{< envelope title="Expected" >}}
```json
{ "returnCode": 0, "returnMessage": "pong", "returnData": null }
```
{{< /envelope >}}

## Your first Moonlight POST

{{< terminal >}}
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"welcome","action":"ping"}'
```
{{< /terminal >}}

Open `services/WelcomeService.php`, `switches/MainSwitch.php`, and `environment/settings.ini` — this **service → switch → INI** pattern repeats for DeskFlow.

## Common mistakes

- **Connection refused** — server not running or wrong `PORT` in `.env` (default **8000**).
- **Missing Content-Type** on POST — use `application/json`.

{{< tutorial-nav >}}
