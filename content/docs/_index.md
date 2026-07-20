---
title: "Docs"
description: "Official Pionia v3 guides — install with Composer, build Pionia Shop, ship to production."
summary: "Entry point for the documentation site: learning paths, topic index, and community links."
date: 2023-09-07T16:12:03+02:00
lastmod: 2026-07-04T00:00:00.000Z
draft: false
weight: 999
toc: true
doc_type: topic
seo:
  title: "Pionia documentation"
  description: "Composer-first guides for Moonlight APIs, Porm, RoadRunner, and the Pionia Shop tutorial."
  canonical: ""
  noindex: false
---

Install with **Composer**, scaffold **your** app, and follow the same example throughout: **Pionia Shop** — an online store + wallet API (`product`, `customer`, `order`, `wallet` on port **8000**).

```bash
composer create-project pionia/pionia-app pionia-shop
cd pionia-shop && php pionia serve
```

## Pick your learning path

{{< card-grid >}}
{{< link-card title="Try the tutorial" description="Build Pionia Shop hands-on — from ping to product.list." href="/documentation/shop-tutorial/" >}}
{{< link-card title="Read the guides" description="Moonlight, services, Porm, and security concepts." href="/documentation/" >}}
{{< link-card title="Browse examples" description="Copy-paste curl payloads and JSON envelopes." href="/documentation/examples/" >}}
{{< /card-grid >}}

## What these docs cover

| Section | You will learn |
|---------|----------------|
| [Getting started](/documentation/getting-started/) | Composer install, PHP basics, Pionia Shop tutorial, app layout |
| [Building your API](/documentation/building-api/) | Moonlight envelopes, services, actions, validation, generic CRUD |
| [Database (Porm)](/documentation/database/) | Queries, filters, joins, pagination on `products` and related tables |
| [HTTP & middleware](/documentation/http/) | Status codes, middleware chains, exceptions, routing |
| [Security](/documentation/security/) | JWT login, `#[Authenticated]` / `#[Can]`, security utilities |
| [Frontend](/documentation/frontend/) | Vite SPA, dev proxy to `/api/v1/` |
| [Operations & deploy](/documentation/operations/) | CLI, RoadRunner, caching, logging, production optimize |
| [Extending Pionia](/documentation/extending/) | App providers, Composer packages, helpers |

Full index: [Documentation hub](/documentation/).

## Community & packages

- [Resources](/resources/) — Packagist packages, CLI cheatsheet, getting help
- [GitHub — PioniaPHP-project](https://github.com/PioniaPHP-project) — core, app template, and docs repos
- [Packagist — pionia/pionia-app](https://packagist.org/packages/pionia/pionia-app) — `composer create-project` template
- [Packagist — pionia/pionia-core](https://packagist.org/packages/pionia/pionia-core) — framework library your app depends on
- [OSCA Kampala Chapter](https://oscakampala.org/) — local open-source community

Contributions welcome: open issues or PRs on [pionia-docs](https://github.com/PioniaPHP-project/pionia-docs).
