---
title: "Step 13 — Deploy"
slug: "13-deploy"
description: "Run DeskFlow on RoadRunner workers with optimize --production."
summary: "runserver, optimize, maintenance"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 113
toc: true
doc_type: tutorial
tutorial_step: 13
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/12-frontend/
tutorial_next: /documentation/deskflow-tutorial/14-app-provider/
seo:
  title: "DeskFlow tutorial — Step 13"
---

Move from **`php pionia serve`** to **persistent workers** suitable for staging/production.

## What you will learn

- Download RoadRunner and run detached workers
- Run `optimize --production` before cutover
- Use maintenance mode during deploy

{{< prerequisites >}}
- Steps **1–11** complete (frontend optional)
{{< /prerequisites >}}

## Production checklist

{{< terminal >}}
```bash
composer install --no-dev -o
php pionia optimize --production
php pionia rr:setup
php pionia runserver --detach
curl -s http://127.0.0.1:8000/api/v1/ping
```
{{< /terminal >}}

Zero-downtime deploy pattern:

```bash
php pionia maintenance:on --message="Deploying DeskFlow" --retry-after=120
# deploy artifacts, restart workers
php pionia maintenance:off
```

Guides: [RoadRunner](/documentation/operations/roadrunner/) · [Production performance](/documentation/operations/production-performance/) · [Maintenance](/documentation/operations/maintenance/).

## Common mistakes

- **Running optimize on every code save in dev** — reserve for deploy.
- **Forgetting `opcache.enable_cli=1`** for workers — see production PHP ini example in ops guide.

{{< tutorial-nav >}}
