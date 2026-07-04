---
title: "Why Pionia?"
slug: "why-pionia"
description: "When Moonlight APIs, Porm, and optional Vite frontends fit your project."
summary: "Opinionated JSON APIs without controllers, models, or route files."
date: 2024-05-24T13:45:48.890Z
lastmod: 2026-07-01
draft: false
weight: 102
toc: true
doc_type: topic
seo:
  title: "Why Pionia?"
  description: "Moonlight envelope, Porm query builder, API versioning, and RoadRunner workers."
  noindex: false
---

Pionia targets teams shipping **versioned JSON APIs** — like Northwind Studio's DeskFlow task board — without Symfony-sized boilerplate. You write **services** and register them on **switches**; clients POST `{ "service", "action" }` to `/api/v1/`.

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

## Next steps

- Hands-on: [API tutorial Part 1](/documentation/getting-started/api-tutorial/)
- Concepts: [Moonlight overview](/documentation/building-api/moonlight-overview/)
- Upgrading: [From v2](/documentation/getting-started/upgrading-from-v2/)
