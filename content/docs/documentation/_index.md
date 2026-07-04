---
title: "Documentation"
description: "Official guides for building applications with Pionia v3."
summary: "From first API call to production: DeskFlow tutorial, Porm, RoadRunner, and frontend."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 10
url: /documentation/
toc: true
doc_type: topic
seo:
  title: "Pionia Framework documentation"
  description: "Learn Pionia v3 — Moonlight API, Porm database layer, GenericService CRUD, RoadRunner, and Vite frontend."
---

Everything you need to build **versioned JSON APIs** with Pionia v3.

### The example app: DeskFlow

Hands-on pages follow **one fictional product** so names stay consistent:

- **Northwind Studio** — a made-up digital agency (not a real company)
- **DeskFlow** — their internal task board API; you build it in the [tutorial](/documentation/deskflow-tutorial/)
- **deskflow-api** — the Composer project name used in commands

Requires **PHP 8.5+**. Tutorial services: `task`, `member`, `project`. Sample login: `alex@northwind.studio`.

## Pick your learning path

{{< card-grid >}}
{{< link-card title="Getting started" description="Install Pionia and meet DeskFlow." href="/documentation/getting-started/introduction/" >}}
{{< link-card title="DeskFlow tutorial" description="15 steps — scaffold through deploy." href="/documentation/deskflow-tutorial/" >}}
{{< link-card title="Browse examples" description="Copy-paste curl payloads and JSON envelopes." href="/documentation/examples/" >}}
{{< /card-grid >}}

## First steps

New to PHP or Pionia? Start here — **tutorial comes after install**.

| Order | Guide | Description |
|-------|-------|-------------|
| 1 | [Introduction](/documentation/getting-started/introduction/) | Install with Composer, first ping, meet DeskFlow |
| 2 | [PHP basics](/documentation/getting-started/php-basics/) | Minimum PHP (optional) |
| 3 | [DeskFlow tutorial](/documentation/deskflow-tutorial/) | Build the task board API step by step |
| 4 | [Glossary](/documentation/getting-started/glossary/) | service, action, switch, envelope |

## How the documentation is organized

| Type | Reader goal | Examples |
|------|-------------|----------|
| **Tutorials** | Hands-on; build DeskFlow step by step | [API tutorial](/documentation/deskflow-tutorial/) |
| **Topic guides** | Understand concepts | [Moonlight overview](/documentation/building-api/moonlight-overview/), [Auth](/documentation/security/security-authentication-and-authorization/) |
| **Reference** | Look up APIs and config | [Helpers](/documentation/extending/helpers/), [Porm API](/documentation/database/api-reference/) |
| **How-to guides** | One task, one recipe | [RoadRunner](/documentation/operations/roadrunner/), [Maintenance](/documentation/operations/maintenance/) |

## What these docs cover

| Layer | Topics |
|-------|--------|
| **Getting started** | Composer install, PHP basics, DeskFlow tutorial, app structure, v3 changelog |
| **Building your API** | Moonlight, services, actions, validation, generic CRUD, API docs |
| **Database (Porm)** | Configuration, queries, filtering, joins, pagination, connections |
| **HTTP** | Envelopes, middleware, exceptions, routing, collections |
| **Security** | Authentication backends, JWT, authorization in services |
| **Frontend** | Vite SPA scaffold, dev proxy, production build |
| **Operations** | CLI, RoadRunner, caching, logging, maintenance, production optimize |
| **Extending** | App providers, Composer packages, helpers, maintainer notes |

## The API layer

[Services](/documentation/building-api/services/) · [Actions](/documentation/building-api/actions/) · [Validation](/documentation/building-api/validation/) · [Generic services](/documentation/building-api/generic-services/) · [Moonlight overview](/documentation/building-api/moonlight-overview/) · [Documenting your API](/documentation/building-api/api-reference/)

## The data layer (Porm)

[Getting started](/documentation/database/configuration-getting-started/) · [Making queries](/documentation/database/making-queries/) · [Filtering](/documentation/database/queries-with-filtering/) · [Joins](/documentation/database/relationships/) · [Pagination](/documentation/database/pagination/)

## The HTTP layer

[Requests & responses](/documentation/http/requests-and-responses/) · [Middleware](/documentation/http/middleware/) · [Exceptions](/documentation/http/exceptions/) · [Routing](/documentation/http/http-routing/)

## Security

[Authentication](/documentation/security/security-authentication-and-authorization/) · [Security utilities](/documentation/security/security-utilities/)

## Frontend & operations

[Vite integration](/documentation/frontend/vite-integration/) · [RoadRunner](/documentation/operations/roadrunner/) · [Production performance](/documentation/operations/production-performance/) · [CLI](/documentation/operations/commands/) · [Caching](/documentation/operations/caching/) · [Logging](/documentation/operations/logging/)

## Extending Pionia

[App providers](/documentation/extending/app-providers/) · [Composer packages](/documentation/extending/composer-packages/) · [Maintainer notes](/documentation/extending/maintainer-notes/)

## Getting help

- **Common mistakes** — each guide ends with a troubleshooting section
- **Logs** — `storage/logs/` with `DEBUG=true` in `.env`
- **Examples** — [curl snippets](/documentation/examples/) for DeskFlow actions
- **Resources** — [packages, CLI, and links](/resources/)

## Community

- [GitHub — PioniaPHP-project](https://github.com/PioniaPHP-project) — core, app template, docs
- [Packagist — pionia/pionia-app](https://packagist.org/packages/pionia/pionia-app) — `composer create-project` template
- [pionia-docs on GitHub](https://github.com/PioniaPHP-project/pionia-docs) — contribute to this site
- [OSCA Kampala Chapter](https://oscakampala.org/) — local open-source community
- **Stats** — `/stats` when `DEBUG` or `STATS_ENABLED` is on

## Common mistakes

- **Starting with advanced topics** — follow [Introduction](/documentation/getting-started/introduction/) → [DeskFlow tutorial](/documentation/deskflow-tutorial/) before auth or RoadRunner.
- **Skipping the glossary** — terms like *switch*, *envelope*, and *action* are defined in [Glossary](/documentation/getting-started/glossary/).
- **Using maintainer commands** — `php pionia new` is for framework contributors only; apps install via `composer create-project pionia/pionia-app`.
- **Old flat URLs** — bookmark `/documentation/getting-started/introduction/` not `/documentation/introduction/` (redirects exist but paths moved).
