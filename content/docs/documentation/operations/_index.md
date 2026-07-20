---
title: "Operations & deploy"
description: "CLI, RoadRunner, caching, logging, maintenance, and production optimization."
summary: "Run Pionia Shop in development and ship it with workers and OPcache preload."
date: 2026-07-01
lastmod: 2026-07-20
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

Once Pionia Shop works locally, this section covers **how to run and ship it** — from `php pionia serve` on port **8000** to RoadRunner workers, OPcache preload, and zero-downtime deploys for Pionia Shop.

## Who this is for

You have a working Pionia Shop API (`product`, `customer`, `order`, `wallet` services) and need to **operate it in dev and production** — CLI commands, persistent workers, logs under `storage/logs/`, and deploy-time optimization without rewriting application code.

## What you will learn

- Which CLI commands you run daily vs only on deploy
- How to move from the built-in server to RoadRunner workers
- Where to configure caching, logging, maintenance mode, and `/stats` metrics

{{< prerequisites >}}
- [Pionia Shop tutorial Step 1](/documentation/shop-tutorial/01-create-project/) — Pionia Shop running locally
- [Application structure](/documentation/getting-started/application-structure/) — `storage/`, `environment/settings.ini`
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  Dev["php pionia serve :8000"] --> RR[php pionia runserver]
  RR --> Opt[php pionia optimize --production]
  Opt --> Ship[Deploy + restart workers]
  Ship --> Obs["Logs / stats / cache"]
{{< /mermaid >}}

Development uses a single-process PHP server. Production adds persistent workers, optional OPcache preload, shared cache stores, and observability — all configured in your app, not in framework vendor code.

## Daily commands

| Task | Guide |
|------|-------|
| CLI overview | [Commands](/documentation/operations/commands/) |
| Schema changes | [Migrations](/documentation/database/migrations/) |
| Warm microbenchmarks | [Benchmarking](/documentation/operations/benchmarking/) |
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
php pionia migrate
php pionia optimize --production
php pionia runserver --detach
curl -s http://127.0.0.1:8000/api/v1/ping
```

## Common mistakes

- **Running `optimize` on every code change** — use it at deploy time; local dev does not need preload or bootstrap caches.
- **Expecting `php pionia serve` to match production** — HTTP/1 only, no job queue; use RoadRunner for production-like testing.
- **Forgetting to restart workers** after deploy when `opcache.validate_timestamps=0` — stale bytecode until FPM/RR reload.
- **Leaving `/stats` open in production** without `STATS_TOKEN` — see [Developer stats](/documentation/operations/developer-stats/).

## What's next

{{< card-grid >}}
{{< link-card title="Commands" description="Daily CLI and make:* scaffolds." href="/documentation/operations/commands/" >}}
{{< link-card title="Benchmarking" description="php pionia bench microbenchmarks." href="/documentation/operations/benchmarking/" >}}
{{< link-card title="RoadRunner" description="Persistent workers and Moonlight jobs." href="/documentation/operations/roadrunner/" >}}
{{< /card-grid >}}
