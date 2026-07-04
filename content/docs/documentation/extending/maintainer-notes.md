---
title: "Maintainer notes"
slug: "maintainer-notes"
description: "Contributing to PioniaCore, pionia new, and framework release workflows."
summary: "For PioniaCore contributors — not required for app developers."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 900
toc: true
doc_type: reference
parent: "extending"
sidebar:
  collapsed: true
seo:
  title: "Maintainer notes"
  description: "Framework development, pionia new, and release tooling."
  noindex: false
---

## Who this is for

**Framework contributors only** — people working on **PioniaCore**, the docs repo, or release tooling. App developers should use `composer create-project pionia/pionia-app`; DeskFlow examples are optional here.

## What you will learn

- How to scaffold apps from a local PioniaCore tree (`php example/pionia new`)
- Release verification and `bin/release` workflow
- Where `AGENTS.md`, tests, and framework documentation commands live

## Before you start

{{< prerequisites >}}
- Local clone of [PioniaCore](https://github.com/PioniaPHP-project/PioniaCore) with PHP 8.5+
- Not required: DeskFlow or `pionia/pionia-app` — this page is maintainer-focused
{{< /prerequisites >}}

{{< callout context="warning" title="Maintainers only" icon="outline/alert-triangle" >}}
App developers should use **`composer create-project pionia/pionia-app`**. The commands on this page are for people working on **PioniaCore** or the docs repo itself.
{{< /callout >}}

## How it works

Maintainer workflows sit **outside** the normal app bootstrap path: monorepo scaffolds, example app smoke tests, release archives, and contributor docs (`AGENTS.md`).

```text
PioniaCore repo
  ├── example/pionia     → local CLI + sample app
  ├── bin/release        → tag + Packagist archive
  ├── bin/test           → PHPUnit (PHP 8.5+)
  └── AGENTS.md          → agent / contributor policy
```

## Scaffold from a local PioniaCore tree

When developing the framework monorepo:

```bash
php example/pionia new my-app --install
```

This mirrors the Packagist template using core stubs in `src/Pionia/Resources/scaffolds/app/`.

## Running the example app

```bash
cd PioniaCore/example
php pionia serve
php pionia runserver
bin/test
```

## Release workflow

See `AGENTS.md` in PioniaCore:

```bash
bin/release v3.0.0 --dry-run
composer release:verify
```

## Documenting the framework

```bash
composer document:api          # example app OpenAPI
composer document:framework    # phpDocumentor → build/docs/
```

## AI / agent contributors

Cursor rules and `AGENTS.md` describe boot order, exception pipeline, and test policy for automated PRs.

## Common mistakes

- Documenting `php example/pionia` on app-developer tutorial pages — belongs here only
- Running `bin/release` without `composer release:verify` and passing tests
- Committing generated `framework-preload.php` — release tooling generates it for the archive only
- Skipping tests (`bin/test`) when changing core boot order or provider hooks

## What's next

{{< card-grid >}}
{{< link-card title="Getting started" description="Build an application, not the framework." href="/documentation/getting-started/introduction/" >}}
{{< link-card title="Extending overview" description="Packages and AppProvider for app authors." href="/documentation/extending/" >}}
{{< link-card title="Helpers reference" description="Global shortcuts after boot." href="/documentation/extending/helpers/" >}}
{{< /card-grid >}}
