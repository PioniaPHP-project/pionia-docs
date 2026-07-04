---
title: "Maintenance mode"
slug: "maintenance"
description: "HTTP 503 gate, bypass tokens, and CLI toggles."
summary: "Take the app offline for deploys without stopping RoadRunner."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 545
toc: true
doc_type: how-to
parent: "documentation"
seo:
  title: "Pionia maintenance mode"
  description: "Enable and bypass application maintenance mode."
  canonical: ""
  noindex: false
---

This guide is for Northwind Studio operators who need to **take DeskFlow offline during deploys** — visitors get HTTP 503, while Alex can still reach the API with a bypass token.

## What you will learn

- How to enable and disable maintenance mode from the CLI
- Where bypass tokens live (`environment/.env`, not committed docs)
- Why RoadRunner picks up toggles without a restart

{{< prerequisites >}}
- DeskFlow running on port **8000** ([Introduction](/documentation/getting-started/introduction/))
- [Commands](/documentation/operations/commands/) — `maintenance:on` / `maintenance:off`
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart TD
  Req[Incoming request] --> Gate{Maintenance enabled?}
  Gate -->|No| App[DeskFlow API / static]
  Gate -->|Yes| Bypass{Bypass token valid?}
  Bypass -->|Yes| App
  Bypass -->|No| Block[HTTP 503 JSON or HTML]
  Assets["/__pionia/* assets"] --> Always[Always served]
{{< /mermaid >}}

Maintenance mode returns **HTTP 503** for all routes except framework assets at `/__pionia/*`. Visitors see a configurable message; API clients get a JSON envelope.

## CLI

```bash
php pionia maintenance:on --message="Deploying" --retry-after=300 --bypass="$(php -r 'require "vendor/autoload.php"; echo (new Pionia\Security\Security())->randomHex(16);')"
php pionia maintenance:off
```

Or generate a token in `php pionia shell` with `secure_random_hex(16)` and pass it to `--bypass=` manually.

{{< callout context="warning" title="Unique bypass tokens" icon="outline/alert-triangle" >}}
Use a **unique random bypass token** each time. Do not copy example tokens from documentation into production.
{{< /callout >}}

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

## Common mistakes

- **Committing bypass tokens to git** — generate per deploy with `secure_random_hex(16)` ([Security utilities](/documentation/security/security-utilities/)) and store in `.env` only.
- **Copying doc example tokens into production** — treat every published token as compromised.
- **Expecting `/static/` to stay up** — only `/__pionia/*` framework assets bypass the gate.
- **Restarting RoadRunner to toggle maintenance** — not required; settings reload per request.

## What's next

{{< card-grid >}}
{{< link-card title="RoadRunner" description="Workers that re-read settings.ini." href="/documentation/operations/roadrunner/" >}}
{{< link-card title="Production performance" description="Deploy optimize after maintenance:off." href="/documentation/operations/production-performance/" >}}
{{< link-card title="Commands" description="Full CLI reference." href="/documentation/operations/commands/" >}}
{{< /card-grid >}}
