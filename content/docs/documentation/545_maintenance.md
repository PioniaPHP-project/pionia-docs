---
title: "Maintenance mode"
slug: "maintenance"
description: "HTTP 503 gate, bypass tokens, and CLI toggles."
summary: "Take the app offline for deploys without stopping RoadRunner."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 545
toc: true
parent: "documentation"
seo:
  title: "Pionia maintenance mode"
  description: "Enable and bypass application maintenance mode."
  canonical: ""
  noindex: false
---

Maintenance mode returns **HTTP 503** for all routes except framework assets at `/__pionia/*`. Visitors see a configurable message; API clients get a JSON envelope.

## CLI

```bash
php pionia maintenance:on --message="Deploying" --retry-after=300 --bypass="$(openssl rand -hex 16)"
php pionia maintenance:off
```

{{<callout context="warning" icon="outline/alert-triangle">}}
Use a **unique random bypass token** each time. Do not copy example tokens from documentation into production.
{{</callout>}}

Aliases: `down` / `up`.

## Configuration

`environment/settings.ini`:

```ini
[maintenance]
ENABLED = true
MESSAGE = We will be back shortly.
RETRY_AFTER = 120
; Set MAINTENANCE_BYPASS in environment/.env — do not commit the real value
BYPASS =
```

```env
# environment/.env (gitignored)
MAINTENANCE_BYPASS=your-generated-random-string
```

Map `MAINTENANCE_BYPASS` into settings in your provider, or set `BYPASS` locally only on machines that need it.

| Setting | Purpose |
|---------|---------|
| `ENABLED` | Gate active when `true` |
| `MESSAGE` | Body text / JSON message |
| `RETRY_AFTER` | `Retry-After` header (seconds) |
| `BYPASS` | Query `?bypass=<token>` or header `X-Maintenance-Bypass: <token>` |

Or set `MAINTENANCE_MODE=true` in `.env`.

## RoadRunner

Workers **re-read `settings.ini` on each request** — toggle maintenance without restarting RR.

## What stays available

- `/__pionia/*` — framework CSS, logos, welcome assets
- Bypass URL/header when configured

Static files under `/static/` and the API are blocked while maintenance is on.

Related: [RoadRunner](/documentation/roadrunner/) · [CLI commands](/documentation/commands-pionia-cli/).
