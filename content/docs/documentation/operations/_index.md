---
title: "Operations & deploy"
description: "CLI, RoadRunner, caching, logging, maintenance, and production optimization."
summary: "Run DeskFlow in development and ship it with workers and OPcache preload."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 700
url: /documentation/operations/
toc: true
doc_type: topic
sidebar:
  collapsed: true
seo:
  title: "Operations and deployment"
  description: "RoadRunner, optimize, maintenance mode, caching, and logging."
---

Once DeskFlow works locally, this section covers **how to run and ship it**.

## Daily commands

| Task | Guide |
|------|-------|
| CLI overview | [Commands](/documentation/operations/commands/) |
| Persistent workers | [RoadRunner](/documentation/operations/roadrunner/) |
| Deploy checklist | [Production performance](/documentation/operations/production-performance/) |
| Zero-downtime deploys | [Maintenance mode](/documentation/operations/maintenance/) |

## Observability & background work

| Task | Guide |
|------|-------|
| Logs | [Logging](/documentation/operations/logging/) |
| Request metrics | [Developer stats](/documentation/operations/developer-stats/) |
| Post-response jobs | [Background work](/documentation/operations/background-work/) |
| Cache stores | [Caching](/documentation/operations/caching/) |

## Production checklist

```bash
composer install --no-dev -o
php pionia optimize --production
php pionia runserver --detach
curl -s http://127.0.0.1:8000/api/v1/ping
```
