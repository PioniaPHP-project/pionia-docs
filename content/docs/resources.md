---
title: "Resources"
description: "Community links and further reading for Pionia developers."
summary: "Documentation site, Packagist, and getting help."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 999
toc: true
seo:
  title: "Pionia resources"
  description: "Where to find docs, packages, and support."
  canonical: ""
  noindex: false
---

## Documentation

- [pionia.netlify.app](https://pionia.netlify.app) — this site (guides you are reading now)
- [Introduction](/documentation/introduction/) — create and run your first app
- [API reference (Moonlight)](/documentation/api-reference/) — document your services with `@moonlight-*` tags

## Packages

| Package | Role |
|---------|------|
| [pionia/pionia-app](https://packagist.org/packages/pionia/pionia-app) | Application template (`composer create-project`) |

Your generated app pulls in the framework as a Composer dependency — you work in **your** repository, not a separate “core” checkout.

## In your project

| Task | Command / path |
|------|----------------|
| List CLI commands | `php pionia list` |
| Generate API docs | `php pionia api:docs` → `docs/api/` |
| Interactive API docs | `/docs` when enabled |
| Health check | `GET /api/v1/ping` |
| Request metrics | `/stats` or `php pionia stats:view` |

## Getting help

- Review the [API tutorial](/documentation/api-tutorial/) and [Services](/documentation/services/services/) guides
- Check `storage/logs/` and enable `DEBUG=true` temporarily for error details
- Open an issue on the documentation or app template repository you installed from Packagist
