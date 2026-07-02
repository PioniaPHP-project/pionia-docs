---
title: "Documentation"
description: "Official guides for building applications with Pionia v3."
summary: "From first API call to production: services, Porm, RoadRunner, frontend, and operations."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 800
toc: true
seo:
  title: "Pionia Framework documentation"
  description: "Learn Pionia v3 — Moonlight API, Porm database layer, GenericService CRUD, RoadRunner, and Vite frontend."
  canonical: ""
  noindex: false
---

Pionia is a PHP 8.5+ framework for **versioned JSON APIs** (`POST /api/v1/` with `{ "service", "action" }`), optional **Vite SPAs**, and **persistent workers** via RoadRunner. Business logic lives in **services** in your app; the database layer is **Porm** (fluent SQL in your project).

## Start here

| Step | Guide |
|------|--------|
| 1 | [Introduction](/documentation/introduction/) — install, scaffold, first ping |
| 2 | [Application structure](/documentation/application-structure/) — folders, bootstrap, `[app_switches]` |
| 3 | [API tutorial](/documentation/api-tutorial/) — first switch, service, and Moonlight call |
| 4 | [Services](/documentation/services/services/) — actions, envelopes, registration |
| 5 | [Database (Porm)](/documentation/database/) — queries, filters, joins, pagination |

## Core topics

| Area | Guides |
|------|--------|
| **API & Moonlight** | [Actions](/documentation/services/actions/) · [Generic services](/documentation/services/generic-services/) · [Documenting your API](/documentation/api-reference/) |
| **Data** | [Making queries](/documentation/database/making-queries/) · [Filtering](/documentation/database/queries-with-filtering/) · [Joins](/documentation/database/relationships/) · [Pagination](/documentation/database/pagination/) |
| **HTTP** | [HTTP routing](/documentation/http-routing/) · [Requests & responses](/documentation/requests-and-responses/) · [Collections](/documentation/collections/) · [Middleware](/documentation/middleware/) · [Exceptions](/documentation/exceptions/) |
| **Operations** | [CLI commands](/documentation/commands-pionia-cli/) · [RoadRunner](/documentation/roadrunner/) · [Production performance](/documentation/production-performance/) · [Maintenance mode](/documentation/maintenance/) · [Developer stats](/documentation/developer-stats/) |
| **Platform** | [Caching](/documentation/caching-in-pionia/) · [Logging](/documentation/logging-in-pionia/) · [Background work](/documentation/background-work/) · [Helpers](/documentation/helpers/) · [Frontend (Vite)](/documentation/frontend-integration-vite/) |

## Production checklist

1. **Environment** — configure `environment/settings.ini` and `.env` (`DEBUG`, database, cache, tokens).
2. **Deploy optimization** — `composer install --no-dev -o` then `php pionia optimize --production`.
3. **RoadRunner** — `php pionia runserver` for worker mode; enable `[jobs]` when using queued work.
4. **Maintenance** — `php pionia maintenance:on` during deploys; workers re-read settings without restart.
5. **Observability** — `/stats` dashboard, `stats:view` CLI, and `logger()` / `report()` for errors.
6. **API docs** — `php pionia api:docs` for OpenAPI; expose `/docs` with `DOCS_ENABLED` or `DEBUG`.

## Quick start (existing project)

```bash
php pionia serve
curl -s http://127.0.0.1:8003/api/v1/ping
```

New project? Start with the [Introduction](/documentation/introduction/) — `composer create-project pionia/pionia-app my-api` or `php pionia new my-api --install`.

## Related

- [Moonlight architecture](/moonlight/introduction-to-moonlight-architecture/) — switches, versioning, security model
- [Upgrading from v2](/documentation/upgrading-from-v2/) — migration notes for older apps
- [Frontend (Vite)](/documentation/frontend-integration-vite/) — scaffold, dev proxy, production build
