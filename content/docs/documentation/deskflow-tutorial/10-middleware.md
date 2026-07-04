---
title: "Step 10 — Middleware"
slug: "10-middleware"
description: "Add RequestIdMiddleware for traceable support tickets."
summary: "X-Request-Id on every DeskFlow request"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 110
toc: true
doc_type: tutorial
tutorial_step: 10
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/09-authentication/
tutorial_next: /documentation/deskflow-tutorial/11-background-work/
seo:
  title: "DeskFlow tutorial — Step 10"
---

When Alex reports a bug, support needs one **request ID** across logs and curl output.

## What you will learn

- Generate middleware with `make:middleware`
- Register in `[app_middlewares]`
- See `X-Request-Id` on responses

{{< prerequisites >}}
- [Step 9](/documentation/deskflow-tutorial/09-authentication/)
{{< /prerequisites >}}

## Generate middleware

{{< terminal >}}
```bash
php pionia make:middleware RequestId
```
{{< /terminal >}}

Copy the class entry from `environment/generated.ini` into **`environment/settings.ini`**:

```ini
[app_middlewares]
request_id = Application\Middlewares\RequestIdMiddleware
```

## Verify header

{{< terminal >}}
```bash
curl -sI -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"list"}' | grep -i x-request-id
```
{{< /terminal >}}

Deep dive: [Middleware guide](/documentation/http/middleware/).

## Common mistakes

- **Middleware only in generated.ini** — copy to `settings.ini` for all environments.
- **Using middleware for auth** — use `mustAuthenticate()` on services instead.

{{< tutorial-nav >}}
