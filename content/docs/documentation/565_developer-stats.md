---
title: "Developer stats & metrics"
slug: "developer-stats"
description: "/stats dashboard, JSON export, and request metrics."
summary: "Inspect health, latency, and API usage during development."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 565
toc: true
parent: "documentation"
seo:
  title: "Pionia developer stats"
  description: "Stats page, stats.json, and stats:view CLI."
  canonical: ""
  noindex: false
---

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

Generate a token locally:

```bash
openssl rand -hex 32
```

Access the dashboard with `?token=<your-token>` or header `X-Stats-Token: <your-token>`.

{{<callout context="warning" icon="outline/alert-triangle">}}
Disable stats in production or require a strong `STATS_TOKEN`. Do not leave `/stats` open without authentication when `DEBUG=false`.
{{</callout>}}

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

When `[performance] RECORD_OPCACHE_SNAPSHOT=true`, workers also write `storage/metrics/opcache-snapshot.json` for stats-driven preload generation (see [Production performance](/documentation/production-performance/)).

## Related

- [Production performance](/documentation/production-performance/) — `optimize --production`, preload strategies
- [HTTP routing](/documentation/http-routing/) — bootstrap route cache
- [Logging](/documentation/logging-in-pionia/) · [Security](/documentation/security/security-authentication-and-authorization/) · [API reference](/documentation/api-reference/).
