---
title: "Step 15 — Contribute to PioniaCore"
slug: "15-contribute-to-core"
description: "From DeskFlow app developer to Pionia framework contributor."
summary: "Clone PioniaCore, run tests, open PRs"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 115
toc: true
doc_type: tutorial
tutorial_step: 15
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/14-app-provider/
seo:
  title: "DeskFlow tutorial — Step 15"
---

You built an app on Packagist; some teams **fix bugs or add features in the framework itself**.

## What you will learn

- Clone PioniaCore and run the test suite
- Scaffold apps from the monorepo for framework work
- Where docs, AGENTS.md, and release tooling live

{{< prerequisites >}}
- Completed Steps **1–14** (or equivalent DeskFlow app experience)
- GitHub account and comfort with pull requests
{{< /prerequisites >}}

## Clone and test

```bash
git clone https://github.com/PioniaPHP-project/PioniaCore.git
cd PioniaCore
composer install
bin/test
```

Every framework change needs tests on **PHP 8.5+**. Read **`AGENTS.md`** in the repo root before editing `src/Pionia/`.

## Local app from monorepo

Framework maintainers scaffold with the example CLI (not `composer create-project`):

```bash
php example/pionia new my-fix-app --install
```

Use this when you need to reproduce a bug against your local `pionia/pionia-core` checkout.

## Contribute docs

This tutorial lives in **[pionia-docs](https://github.com/PioniaPHP-project/pionia-docs)**. Fix typos or add steps via PR — follow `content/docs/DOCUMENTATION_STYLE.md`.

## Contribute code

| Area | Start here |
|------|------------|
| HTTP / Moonlight | `src/Pionia/Http/` |
| Porm | `src/Pionia/Porm/` + `docs/PORM.md` |
| Console | `src/Pionia/Console/` |
| Release | `bin/release`, `bin/test` |

Full maintainer reference: [Maintainer notes](/documentation/extending/maintainer-notes/).

## You finished DeskFlow

```text
Step 1  → project on disk
Step 7  → SQLite CRUD
Step 9  → authenticated writes
Step 13 → production workers
Step 14 → provider hooks
Step 15 → framework contribution path
```

## Common mistakes

- **Using `pionia new` as an app developer** — Packagist `pionia/pionia-app` is the supported app path; monorepo scaffolds are for core contributors.
- **PRs without tests** — CI enforces coverage on `src/Pionia/`.

{{< tutorial-nav >}}

## What's next

{{< card-grid >}}
{{< link-card title="Composer packages" description="Ship a reusable DeskFlow billing module." href="/documentation/extending/composer-packages/" >}}
{{< link-card title="Maintainer notes" description="Release workflow and AGENTS.md." href="/documentation/extending/maintainer-notes/" >}}
{{< link-card title="Documentation hub" description="Topic guides and reference." href="/documentation/" >}}
{{< /card-grid >}}
