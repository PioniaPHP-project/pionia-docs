---
title: "Resources"
description: "Community links, Packagist packages, and CLI cheatsheet for Pionia developers."
summary: "Documentation site, DeskFlow tutorial, packages, and getting help."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 999
toc: true
doc_type: reference
seo:
  title: "Pionia resources"
  description: "Where to find docs, packages, DeskFlow examples, and support."
  canonical: ""
  noindex: false
---

Quick links for **DeskFlow** developers — the task board API used in every tutorial — plus the packages and commands you run from **your** Composer project (not a separate framework checkout).

## Pick your learning path

{{< card-grid >}}
{{< link-card title="DeskFlow tutorial" description="15 steps from create-project to core contribution." href="/documentation/deskflow-tutorial/01-create-project/" >}}
{{< link-card title="Documentation hub" description="All eight topic sections in one place." href="/documentation/" >}}
{{< link-card title="API examples" description="Ping, task.list, login, and filter curl snippets." href="/documentation/examples/" >}}
{{< /card-grid >}}

## Documentation

- [Documentation home](/) — this site (guides you are reading now)
- [Documentation hub](/documentation/) — topic index for Getting Started through Operations
- [Introduction](/documentation/getting-started/introduction/) — `composer create-project` and first ping
- [API tutorial](/documentation/deskflow-tutorial/) — DeskFlow tutorial Steps 1–7
- [Pionia v3 release notes](/documentation/getting-started/changelog-v3/) — what is new in version 3.0
- [Upgrading from v2](/documentation/getting-started/upgrading-from-v2/) — migrate existing applications
- [API reference (Moonlight)](/documentation/building-api/api-reference/) — document services with `@moonlight-*` tags

## Packages

| Package | Role |
|---------|------|
| [pionia/pionia-app](https://packagist.org/packages/pionia/pionia-app) | Application template (`composer create-project pionia/pionia-app deskflow-api`) |
| [pionia/pionia-core](https://packagist.org/packages/pionia/pionia-core) | Framework library (pulled in by your app; PHP 8.5+, Moonlight, Porm, CLI) |

Your generated app pulls in the framework as a Composer dependency — you work in **your** repository, not a separate “core” checkout.

## In your project

| Task | Command / path |
|------|----------------|
| List CLI commands | `php pionia list` |
| Generate API docs | `composer document:api` → `docs/api/` |
| Interactive API docs | `/docs` when `DOCS_ENABLED` or `DEBUG` |
| Health check | `GET /api/v1/ping` |
| Request metrics | `/stats` or `php pionia stats:view` |
| Application logs | `storage/logs/` (enable `DEBUG=true` temporarily for details) |

## Getting help

- Walk through the [DeskFlow tutorial](/documentation/deskflow-tutorial/) and [Services](/documentation/building-api/services/) guides
- Copy payloads from [Examples](/documentation/examples/) and compare responses
- Check `storage/logs/` and enable `DEBUG=true` temporarily for error details
- Open an issue on [GitHub — PioniaPHP-project](https://github.com/PioniaPHP-project) (core, app template, or docs repo)
- Join the conversation via [OSCA Kampala Chapter](https://oscakampala.org/)

## Community

| Link | Purpose |
|------|---------|
| [PioniaPHP-project on GitHub](https://github.com/PioniaPHP-project) | Source, issues, and contributions |
| [pionia-docs](https://github.com/PioniaPHP-project/pionia-docs) | Documentation site repository |
| [Packagist — pionia](https://packagist.org/packages/pionia/) | Published packages |
