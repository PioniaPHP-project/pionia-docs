---
title: "Step 1 — Create your project"
slug: "01-create-project"
description: "Scaffold pionia-shop with Composer."
summary: "composer create-project → pionia-shop"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 101
toc: true
doc_type: tutorial
tutorial_step: 1
tutorial_total: 15
tutorial_next: /documentation/shop-tutorial/02-dev-server-and-ping/
aliases:
  - /documentation/deskflow-tutorial/01-create-project/
seo:
  title: "Pionia Shop tutorial — Step 1"
---

You are opening a small online store API called **Pionia Shop**. This step creates the empty project on your machine — about five minutes.

## What you will learn

- Install the official app template with Composer
- Recognize the folders you will use in every later step

{{< prerequisites >}}
- [Introduction](/documentation/getting-started/introduction/) — PHP 8.5+ and Composer
{{< /prerequisites >}}

## Create pionia-shop

{{< terminal >}}
```bash
composer create-project pionia/pionia-app pionia-shop
cd pionia-shop
```
{{< /terminal >}}

You now have:

| Path | Role |
|------|------|
| `services/` | Where `ProductService` will live |
| `switches/` | API version wiring (`MainSwitch`) |
| `environment/` | `.env` and `settings.ini` |
| `database/migrations/` | Schema changes |
| `public/` | Web entry |

Set the store name in `environment/.env`:

```env
APP_NAME=Pionia Shop
PORT=8000
```

## Common mistakes

- Creating the project in a nested folder you did not intend — check `pwd` after `cd`
- Skipping `cd pionia-shop` — later `php pionia` commands must run from the app root

{{< tutorial-nav >}}
