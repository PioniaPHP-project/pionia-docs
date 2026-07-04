---
title: "Step 1 — Create your project"
slug: "01-create-project"
description: "Scaffold deskflow-api with Composer."
summary: "composer create-project pionia/pionia-app"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 101
toc: true
doc_type: tutorial
tutorial_step: 1
tutorial_total: 15
tutorial_next: /documentation/deskflow-tutorial/02-dev-server-and-ping/
seo:
  title: "DeskFlow tutorial — Step 1"
---

You are building **DeskFlow** for the fictional agency **Northwind Studio** — an internal task board API. [Read the full project intro](/documentation/deskflow-tutorial/#meet-the-project-we-are-building) if you skipped it.

This step creates the empty **`deskflow-api`** folder on your machine. About five minutes.

## What you will learn

- Install the official app template with Composer
- Recognize the top-level folders you will use in every later step

{{< prerequisites >}}
- [Introduction](/documentation/getting-started/introduction/) — install PHP 8.5+ and Composer; read [Meet DeskFlow](/documentation/getting-started/introduction/#what-you-are-building-deskflow)
{{< /prerequisites >}}

## Create deskflow-api

{{< terminal >}}
```bash
composer create-project pionia/pionia-app deskflow-api
cd deskflow-api
```
{{< /terminal >}}

Composer writes `APP_NAME=deskflow-api` into `environment/.env`.

You should see:

```text
deskflow-api/
├── bootstrap/
├── environment/     # .env + settings.ini
├── public/          # index.php
├── services/        # WelcomeService.php (template)
├── switches/        # MainSwitch.php
├── storage/
└── pionia           # CLI
```

Open the folder in your editor — **keep this terminal path** for all remaining steps.

## Common mistakes

- **Running commands outside the project root** — every `php pionia` command runs from `deskflow-api/`.
- **Editing files inside `vendor/`** — your code lives in `services/`, `switches/`, `database/`.

{{< tutorial-nav >}}
