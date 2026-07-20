---
title: "Developer stats & metrics"
slug: "developer-stats"
description: "/stats dashboard, JSON export, and request metrics."
summary: "Inspect health, latency, and API usage during development."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 565
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Pionia developer stats"
  description: "Stats page, stats.json, and stats:view CLI."
  canonical: ""
  noindex: false
---

This guide is for Pionia Shop developers who want **visibility into API usage** — slow `product.list` calls, OPcache hit rate, and framework health at `/stats` on port **8000**.

## What you will learn

- How to open `/stats` and `/stats.json` with a token when `DEBUG=false`
- What `php pionia stats:view` prints from `storage/metrics/requests.jsonl`
- How OPcache snapshots feed [Production performance](/documentation/operations/production-performance/)

{{< prerequisites >}}
- Pionia Shop running (`php pionia serve` or `runserver`)
- Familiarity with [Logging](/documentation/operations/logging/) — complementary, not a replacement
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  API["POST /api/v1/ task.*"] --> Metrics[Request metrics writer]
  Metrics --> File["storage/metrics/requests.jsonl"]
  File --> Web["/stats + /stats.json"]
  File --> CLI["php pionia stats:view"]
  Workers[RoadRunner workers] --> Snap["opcache-snapshot.json"]
  Snap --> Preload["optimize:preload --snapshot"]
{{< /mermaid >}}

Pionia records per-request metrics for Moonlight API calls and exposes them through a **web dashboard** and **CLI**.

## Web dashboard

| URL | Format |
|-----|--------|
| `/stats` | HTML health dashboard |
| `/stats.json` | Same data as JSON |

Enabled when `DEBUG=true` by default, or explicitly:

```ini
# environment/settings.ini
STATS_ENABLED = true
```

```env
# environment/.env — generate your own token; never commit a shared docs example
STATS_TOKEN=
```

Generate a token locally ([Security utilities](/documentation/security/security-utilities/)):

```bash
php pionia shell
```

```php
secure_random_hex(32); // paste into STATS_TOKEN= in environment/.env
```

Access the dashboard with `?token=<your-token>` or header `X-Stats-Token: <your-token>`.

{{< callout context="warning" title="Lock down production" icon="outline/alert-triangle" >}}
Disable stats in production or require a strong `STATS_TOKEN`. Do not leave `/stats` open without authentication when `DEBUG=false`.
{{< /callout >}}

## CLI snapshot

```bash
php pionia stats:view              # human-readable table
php pionia stats:view --json       # JSON export
php pionia stats:view --reset      # clear storage/metrics/requests.jsonl
```

Aliases: `stats`, `viewstats`.

## Disabling writes

To stop writing metrics while keeping the stats page:

```ini
[metrics]
ENABLED = false
```

## What is collected

- Request count, average duration, slow endpoints
- Grouping by service/action where applicable
- Framework static assets (`/__pionia/*`) are excluded
- **OPcache** — hit rate, cached scripts, preload memory, JIT status
- **Framework version** — resolved from installed `pionia/pionia-core` Composer package

When `[performance] RECORD_OPCACHE_SNAPSHOT=true`, workers also write `storage/metrics/opcache-snapshot.json` for stats-driven preload generation (see [Production performance](/documentation/operations/production-performance/)).

## Common mistakes

- **Leaving `/stats` public in production** — set `STATS_TOKEN` or disable with `STATS_ENABLED=false`.
- **Using stats as audit logging** — metrics are aggregated; use [Logging](/documentation/operations/logging/) for per-request detail.
- **Resetting metrics during an investigation** — `stats:view --reset` clears history; export with `--json` first.
- **Expecting static asset hits in API metrics** — `/__pionia/*` routes are excluded from Moonlight grouping.

## What's next

{{< card-grid >}}
{{< link-card title="Production performance" description="optimize --production and preload." href="/documentation/operations/production-performance/" >}}
{{< link-card title="Logging" description="logger(), report(), storage/logs/." href="/documentation/operations/logging/" >}}
{{< link-card title="HTTP routing" description="Bootstrap route cache." href="/documentation/http/http-routing/" >}}
{{< /card-grid >}}
