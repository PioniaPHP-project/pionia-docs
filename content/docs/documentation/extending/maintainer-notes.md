---
title: "Maintainer notes"
slug: "maintainer-notes"
description: "Contributing to PioniaCore, pionia new, and framework release workflows."
summary: "For PioniaCore contributors — not required for app developers."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 900
toc: true
doc_type: reference
sidebar:
  collapsed: true
seo:
  title: "Maintainer notes"
  description: "Framework development, pionia new, and release tooling."
  noindex: false
---

{{< callout context="warning" title="Maintainers only" icon="outline/alert-triangle" >}}
App developers should use **`composer create-project pionia/pionia-app`**. The commands on this page are for people working on **PioniaCore** or the docs repo itself.
{{< /callout >}}

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
composer document:framework  # phpDocumentor → build/docs/
```

## AI / agent contributors

Cursor rules and `AGENTS.md` describe boot order, exception pipeline, and test policy for automated PRs.

## What's next

Return to [Getting started](/documentation/getting-started/introduction/) if you are building an application, not the framework.
