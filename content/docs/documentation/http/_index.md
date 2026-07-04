---
title: "HTTP & middleware"
description: "Requests, responses, middleware, exceptions, routing, and collections."
summary: "How Pionia maps Moonlight envelopes to real HTTP status codes and headers."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 300
url: /documentation/http/
toc: true
doc_type: topic
sidebar:
  collapsed: true
seo:
  title: "HTTP layer in Pionia"
  description: "Requests, middleware, exceptions, routing, and Arrayable collections."
---

The Moonlight API uses one versioned URL, but Pionia still speaks **real HTTP** — status codes, headers, and middleware chains matter for production apps like DeskFlow.

## Guide map

| Topic | Page |
|-------|------|
| Envelopes & status codes | [Requests & responses](/documentation/http/requests-and-responses/) |
| Working with JSON payloads | [Collections](/documentation/http/collections/) |
| Global request pipeline | [Middleware](/documentation/http/middleware/) |
| Errors & validation | [Exceptions](/documentation/http/exceptions/) |
| Static routes & SPA fallback | [HTTP routing](/documentation/http/http-routing/) |

## DeskFlow example

When Alex creates a task without a title, DeskFlow returns **HTTP 422** with `returnCode` in the JSON body — see [Validation](/documentation/building-api/validation/) and [Exceptions](/documentation/http/exceptions/).

Add `RequestIdMiddleware` so support tickets reference a single request ID — covered in [Middleware](/documentation/http/middleware/).

## Suggested order

1. [Requests & responses](/documentation/http/requests-and-responses/) — envelopes first
2. [Collections](/documentation/http/collections/) — read JSON in actions
3. [Exceptions](/documentation/http/exceptions/) — 422 when title is missing
4. [Middleware](/documentation/http/middleware/) — request IDs for support
5. [HTTP routing](/documentation/http/http-routing/) — static files and SPA fallback

{{< card-grid >}}
{{< link-card title="Building your API" description="Services that produce these responses." href="/documentation/building-api/" >}}
{{< link-card title="Security" description="Auth runs after middleware." href="/documentation/security/" >}}
{{< /card-grid >}}

## Common mistakes

- **Debugging in actions before reading envelopes** — start with [Requests & responses](/documentation/http/requests-and-responses/) so status codes make sense.
- **Adding middleware for auth** — authentication backends run after middleware; use `mustAuthenticate()` on services.
- **Expecting RESTful paths per action** — Moonlight uses `POST /api/v1/` with a JSON body, not `/api/v1/task/list`.
