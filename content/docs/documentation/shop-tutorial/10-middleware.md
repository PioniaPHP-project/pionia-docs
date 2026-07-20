---
title: "Step 10 — Middleware"
slug: "10-middleware"
description: "What middleware is, why shops need it, and how to add a request ID in Pionia."
summary: "Shared steps that run on every HTTP call — before your services"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 110
toc: true
doc_type: tutorial
tutorial_step: 10
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/09-authentication/
tutorial_next: /documentation/shop-tutorial/11-background-work/
aliases:
  - /documentation/deskflow-tutorial/10-middleware/
seo:
  title: "Pionia Shop tutorial — Step 10 (Middleware)"
---

Ada’s phone says “order failed.” Support opens the logs and sees fifty lines from the same second. Without a shared ID on the HTTP response and the log line, nobody can match “her call” to “your error.”

**Middleware** is how you fix that kind of cross-cutting problem once — instead of pasting the same code into every service.

## What is middleware? (in general)

Think of every API request as a journey:

1. The request arrives (headers, body, cookies).
2. Your business code runs (`product.list`, `order.place`, …).
3. A response goes back to the client.

**Middleware** is optional code that sits **around** step 2. It can:

- Run **before** your action (read headers, start a timer, reject empty bodies early).
- Run **after** your action (add headers, write metrics, clean up).
- Apply to **many routes at once** — that is the point.

Real-world examples you already use without noticing:

| Everyday need | Typical middleware job |
|---------------|------------------------|
| Support tickets | Attach a unique `X-Request-Id` |
| CORS browser rules | Allow `https://shop.example.com` to call your API |
| Rate limits | Cap “100 requests / minute” per IP |
| Compression | Gzip large JSON responses |
| Maintenance | Return 503 while you deploy |

Middleware is **not** the place for “is Ada allowed to cancel this order?” That is **authorization** on the action (Step 9). Middleware is for **shared plumbing** on the wire.

```text
Request
   │
   ▼
┌─────────────────┐
│  Middleware A   │  e.g. request ID
│  Middleware B   │  e.g. CORS
└────────┬────────┘
         ▼
   Your service action
         │
         ▼
┌─────────────────┐
│  Middleware B   │  (on the way out)
│  Middleware A   │
└────────┬────────┘
         ▼
Response
```

## How Pionia Shop uses it

Pionia runs a **middleware chain** on each HTTP request. You register classes in `settings.ini` (or a provider). Each class can touch the request and the response.

Today you add one useful piece: **Request ID**.

## What you will learn

- Why middleware exists (shared steps, not business rules)
- Scaffold `RequestIdMiddleware`
- See `X-Request-Id` on a real `product.list` response

{{< prerequisites >}}
- [Step 9](/documentation/shop-tutorial/09-authentication/) — you already have a working API
{{< /prerequisites >}}

## Add RequestId middleware

{{< step >}}
**1. Scaffold**

{{< terminal >}}
```bash
php pionia make:middleware RequestId
```
{{< /terminal >}}

That creates a class under `middlewares/` (folder appears on first use).
{{< /step >}}

{{< step >}}
**2. Register it**

In `environment/settings.ini`:

```ini
[app_middlewares]
request_id = "Application\Middlewares\RequestIdMiddleware"
```

(Exact class namespace follows your app’s `Application\` layout — check the generated file.)
{{< /step >}}

{{< step >}}
**3. Call the catalog and read headers**

```bash
curl -si -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"list"}'
```

Look for a response header like `X-Request-Id: …`. Copy that value into a log search later when you debug checkout.
{{< /step >}}

## Auth vs middleware (do not mix them up)

| Concern | Where it lives | Example |
|---------|----------------|---------|
| “Is someone logged in?” | Authentication + `#[Authenticated]` | Step 9 |
| “May this user refund?” | `#[Can]` or a check in the action | Step 9 |
| “Stamp every response with an ID” | Middleware | This step |
| “Allow the Vite app’s origin” | Middleware / HTTP config | Frontend step |

If you put login checks only in middleware, every new action is easy to forget. Attributes on the service keep the rule next to the method.

## Try it yourself

{{< try-it >}}
1. Hit `product.list` twice — confirm two different request IDs.
2. Log `X-Request-Id` from the client (or from `curl -si`) and search your `storage/logs/` for the same string after you add `logger()->info(...)` in an action.
{{< /try-it >}}

## Common mistakes

- Using middleware for “must be logged in on this one action” — prefer `#[Authenticated]`
- Forgetting to register the class in `[app_middlewares]` — scaffold alone does nothing
- Expecting middleware to run for CLI commands — this chain is for **HTTP**

## What's next

Full guide: [Middleware](/documentation/http/middleware/). Next tutorial step keeps checkout fast with background work.

{{< tutorial-nav >}}
