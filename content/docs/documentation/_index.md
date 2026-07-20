---
title: "Documentation"
description: "Official guides for building applications with Pionia v3."
summary: "From first API call to production: Pionia Shop tutorial, Porm, RoadRunner, and frontend."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 10
url: /documentation/
toc: true
doc_type: topic
seo:
  title: "Pionia Framework documentation"
  description: "Learn Pionia v3 — Moonlight API, Porm, Pionia Shop tutorial, RoadRunner, and Vite."
---

Everything you need to build **versioned JSON APIs** with Pionia v3.

### The example app: Pionia Shop

Hands-on pages follow **one small store** so names stay consistent:

- **Pionia Shop** — a fictional online store + wallet (named after the framework)
- **pionia-shop** — the Composer project name used in commands
- **ada@pionia.shop** — sample customer in curl examples

Requires **PHP 8.5+**. Tutorial services: `product`, `customer`, `order`, `wallet`.

| Table | What it stores |
|-------|----------------|
| `products` | Catalog (`name`, `price`, `stock`) |
| `customers` | Shoppers (`email`, `password_hash`) |
| `orders` / `order_items` | Checkouts and line items |
| `wallets` / `wallet_transactions` | Balance and top-ups / payments |

Build it in the [Pionia Shop tutorial](/documentation/shop-tutorial/).

## Pick your learning path

{{< card-grid >}}
{{< link-card title="Getting started" description="Install Pionia and meet Pionia Shop." href="/documentation/getting-started/introduction/" >}}
{{< link-card title="Pionia Shop tutorial" description="15 steps — scaffold through deploy." href="/documentation/shop-tutorial/" >}}
{{< link-card title="Browse examples" description="Copy-paste curl payloads and JSON envelopes." href="/documentation/examples/" >}}
{{< /card-grid >}}

## First steps

| Order | Guide | Description |
|-------|-------|-------------|
| 1 | [Introduction](/documentation/getting-started/introduction/) | Install with Composer, first ping, meet Pionia Shop |
| 2 | [PHP basics](/documentation/getting-started/php-basics/) | Minimum PHP (optional) |
| 3 | [Pionia Shop tutorial](/documentation/shop-tutorial/) | Catalog, checkout, and wallet step by step |
| 4 | [Glossary](/documentation/getting-started/glossary/) | service, action, switch, envelope |

## How the documentation is organized

| Type | Reader goal | Examples |
|------|-------------|----------|
| **Tutorials** | Hands-on; build Pionia Shop | [Shop tutorial](/documentation/shop-tutorial/) |
| **Topic guides** | Understand concepts | [Moonlight overview](/documentation/building-api/moonlight-overview/), [Auth](/documentation/security/security-authentication-and-authorization/) |
| **Reference** | Look up APIs and config | [Helpers](/documentation/extending/helpers/), [Porm API](/documentation/database/api-reference/) |
| **How-to guides** | One task, one recipe | [RoadRunner](/documentation/operations/roadrunner/), [Maintenance](/documentation/operations/maintenance/) |

## What these docs cover

| Layer | Topics |
|-------|--------|
| **Getting started** | Composer install, PHP basics, Pionia Shop tutorial, app structure, v3 changelog |
| **Building your API** | Moonlight, services, actions, validation, generic CRUD, API docs |
| **Database (Porm)** | Migrations, configuration, queries, filtering, joins, pagination, connections |
| **HTTP** | Envelopes, welcome page, middleware, exceptions, routing, collections |
| **Security** | JWT, authentication backends, authorization in services |
| **Frontend** | Vite SPA scaffold, dev proxy, production build |
| **Operations** | CLI, bench, RoadRunner, caching, logging, maintenance, production optimize |
| **Extending** | App providers, Composer packages, helpers, maintainer notes |

## The API layer

[Services](/documentation/building-api/services/) · [Actions](/documentation/building-api/actions/) · [Validation](/documentation/building-api/validation/) · [Generic services](/documentation/building-api/generic-services/) · [Moonlight overview](/documentation/building-api/moonlight-overview/) · [Documenting your API](/documentation/building-api/api-reference/)

## The data layer (Porm)

[Migrations](/documentation/database/migrations/) · [Getting started](/documentation/database/configuration-getting-started/) · [Making queries](/documentation/database/making-queries/) · [Filtering](/documentation/database/queries-with-filtering/) · [Joins](/documentation/database/relationships/) · [Pagination](/documentation/database/pagination/)

## The HTTP layer

[Requests & responses](/documentation/http/requests-and-responses/) · [Welcome page & branding](/documentation/http/welcome-page-and-branding/) · [Middleware](/documentation/http/middleware/) · [Exceptions](/documentation/http/exceptions/) · [Routing](/documentation/http/http-routing/)

## Security

[JWT authentication](/documentation/security/jwt-authentication/) · [Protecting actions](/documentation/security/protecting-actions/) · [Authentication](/documentation/security/security-authentication-and-authorization/) · [Security utilities](/documentation/security/security-utilities/)

## Frontend & operations

[Vite integration](/documentation/frontend/vite-integration/) · [RoadRunner](/documentation/operations/roadrunner/) · [Production performance](/documentation/operations/production-performance/) · [CLI](/documentation/operations/commands/) · [Benchmarking](/documentation/operations/benchmarking/) · [Caching](/documentation/operations/caching/) · [Logging](/documentation/operations/logging/)

## Extending Pionia

[App providers](/documentation/extending/app-providers/) · [Composer packages](/documentation/extending/composer-packages/) · [Maintainer notes](/documentation/extending/maintainer-notes/)

## Getting help

- **Common mistakes** — each guide ends with a troubleshooting section
- **Logs** — `storage/logs/` with `DEBUG=true` in `.env`
- **Examples** — [curl snippets](/documentation/examples/) for Pionia Shop actions
- **Resources** — [packages, CLI, and links](/resources/)

## Community

- [GitHub — PioniaPHP-project](https://github.com/PioniaPHP-project) — core, app template, docs
- [Packagist — pionia/pionia-app](https://packagist.org/packages/pionia/pionia-app) — `composer create-project` template
- [pionia-docs on GitHub](https://github.com/PioniaPHP-project/pionia-docs) — contribute to this site
- [OSCA Kampala Chapter](https://oscakampala.org/) — local open-source community
- **Stats** — `/stats` when `DEBUG` or `STATS_ENABLED` is on

## Common mistakes

- **Starting with advanced topics** — follow [Introduction](/documentation/getting-started/introduction/) → [Pionia Shop tutorial](/documentation/shop-tutorial/) before auth or RoadRunner.
- **Skipping the glossary** — terms like *switch*, *envelope*, and *action* are defined in [Glossary](/documentation/getting-started/glossary/).
- **Using maintainer commands** — `php pionia new` is for framework contributors only; apps install via `composer create-project pionia/pionia-app`.
- **Old flat URLs** — bookmark `/documentation/getting-started/introduction/` not `/documentation/introduction/` (redirects exist but paths moved).
