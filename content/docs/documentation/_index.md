---
title: "Documentation"
description: "Official guides for building applications with Pionia v3."
summary: "From first API call to production: DeskFlow tutorial, Porm, RoadRunner, and frontend."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 10
url: /documentation/
toc: true
doc_type: topic
seo:
  title: "Pionia Framework documentation"
  description: "Learn Pionia v3 — Moonlight API, Porm database layer, GenericService CRUD, RoadRunner, and Vite frontend."
---

Everything you need to build **versioned JSON APIs** with Pionia v3 — using the **DeskFlow** task board as our running example.

## First steps

New to PHP or Pionia? Start here.

| Guide | Description |
|-------|-------------|
| [Introduction](/documentation/getting-started/introduction/) | Install with Composer, first ping |
| [PHP basics](/documentation/getting-started/php-basics/) | Minimum PHP before the tutorial |
| [API tutorial Part 1](/documentation/getting-started/api-tutorial/) | `task.list` for Northwind Studio |
| [Glossary](/documentation/getting-started/glossary/) | service, action, switch, envelope |

## Pick your learning path

{{< card-grid >}}
{{< link-card title="Try the tutorial" description="Build DeskFlow hands-on from Part 1." href="/documentation/getting-started/api-tutorial/" >}}
{{< link-card title="Read the guides" description="Moonlight overview → Services → Validation." href="/documentation/building-api/moonlight-overview/" >}}
{{< link-card title="Browse examples" description="Copy-paste curl payloads and JSON." href="/documentation/examples/" >}}
{{< /card-grid >}}

## How the documentation is organized

| Type | Reader goal | Examples |
|------|-------------|----------|
| **Tutorials** | Hands-on; build DeskFlow step by step | [API tutorial](/documentation/getting-started/api-tutorial/) |
| **Topic guides** | Understand concepts | [Moonlight overview](/documentation/building-api/moonlight-overview/), [Auth](/documentation/security/security-authentication-and-authorization/) |
| **Reference** | Look up APIs and config | [Helpers](/documentation/extending/helpers/), [Porm API](/documentation/database/api-reference/) |
| **How-to guides** | One task, one recipe | [RoadRunner](/documentation/operations/roadrunner/), [Maintenance](/documentation/operations/maintenance/) |

## Getting help

- **Common mistakes** — each guide ends with a troubleshooting section
- **Logs** — `storage/logs/` with `DEBUG=true` in `.env`
- **GitHub** — [PioniaPHP-project](https://github.com/PioniaPHP-project)
- **Stats** — `/stats` when `DEBUG` or `STATS_ENABLED` is on

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
