---
title: "Why Pionia?"
slug: "why-pionia"
description: "When Moonlight APIs, Porm, and optional Vite frontends fit your project."
summary: "Opinionated JSON APIs without controllers, models, or route files."
date: 2024-05-24T13:45:48.890Z
lastmod: 2026-07-04
draft: false
weight: 102
toc: true
doc_type: topic
seo:
  title: "Why Pionia?"
  description: "Moonlight envelope, Porm query builder, API versioning, and RoadRunner workers."
  noindex: false
---

## Who this is for

You are choosing a PHP framework for **Northwind Studio's DeskFlow** — or any mobile/SPA backend — and want to know whether Moonlight's `{ service, action }` model beats dozens of REST controllers.

## What you will learn

- What Pionia optimizes for (versioned JSON APIs, small teams)
- How DeskFlow maps to services, switches, and Porm queries
- When to pick something else (server-rendered HTML, GraphQL-first)

## Before you start

No install required. For a hands-on comparison, scaffold DeskFlow in [Introduction](/documentation/getting-started/introduction/) first.

## How it works

Pionia targets teams shipping **versioned JSON APIs** without Symfony-sized boilerplate. You write **services** and register them on **switches**; clients POST `{ "service", "action" }` to **`http://127.0.0.1:8000/api/v1/`**.

{{< deskflow >}}
**DeskFlow** — Northwind Studio's internal task board. Services: `task`, `member`, `project`. Sample user: **alex@northwind.studio**.
{{< /deskflow >}}

## What you get

1. **Services, not controllers** — business logic lives in `services/TaskService.php`. Moonlight dispatch replaces per-route controllers.
2. **Porm, not ORM** — `table('tasks')->filter(...)->all()` returns arrays; no model hydration overhead. See [Database](/documentation/database/).
3. **Real HTTP semantics** — validation errors are **422**, auth failures **401**; the JSON body still uses `returnCode`. See [Requests & responses](/documentation/http/requests-and-responses/).
4. **Versioned switches** — add `v2` in `settings.ini` without rewriting `v1`. See [API versioning](/documentation/building-api/api-versioning/).
5. **Flexible auth** — pluggable backends and per-action checks. See [Security](/documentation/security/).
6. **Optional Vite SPA** — scaffold React/Vue beside the API. See [Frontend integration](/documentation/frontend/vite-integration/).
7. **Production workers** — RoadRunner, OPcache preload, maintenance mode. See [Operations](/documentation/operations/).

## When Pionia fits

| Good fit | Less ideal |
|----------|------------|
| Mobile or SPA backends with stable JSON contracts | Server-rendered HTML as the primary UI |
| Small teams who want one envelope shape | GraphQL-first APIs |
| CRUD plus custom actions on the same switch | Plugin-heavy CMS-style admin |

## Moonlight in one paragraph

[Moonlight](/documentation/building-api/moonlight-overview/) is the `{ service, action }` contract: one POST target per API version, predictable JSON envelopes, and switches that map aliases to PHP classes. Pionia implements that contract with real HTTP status codes, OpenAPI export, and first-class tooling.

## Common mistakes

- **Expecting Laravel-style Eloquent models** — Porm queries tables directly; there is no built-in ORM layer.
- **Treating Moonlight as RPC over HTTP 200 only** — v3 uses real status codes for auth and validation failures.
- **Choosing Pionia for a Blade-only admin site** — you can, but server-rendered HTML is not the sweet spot.

## What's next

{{< card-grid >}}
{{< link-card title="DeskFlow tutorial" description="Build DeskFlow hands-on." href="/documentation/deskflow-tutorial/" >}}
{{< link-card title="Moonlight overview" description="Architecture deep dive." href="/documentation/building-api/moonlight-overview/" >}}
{{< link-card title="Upgrading from v2" description="Migration checklist." href="/documentation/getting-started/upgrading-from-v2/" >}}
{{< /card-grid >}}
