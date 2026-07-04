---
title: "RoadRunner"
slug: "roadrunner"
description: "Persistent PHP workers with RoadRunner in Pionia v3."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 550
toc: true
doc_type: how-to
parent: "documentation"
seo:
  title: "RoadRunner in Pionia"
  description: "Run Pionia with persistent workers, jobs, and formatted access logs."
  noindex: false
---

This guide is for DeskFlow developers who outgrow `php pionia serve` and need **persistent PHP workers** — same Moonlight API on port **8000**, but boot once and handle many requests with reused database connections.

## What you will learn

- How to install RoadRunner and run `php pionia runserver` for DeskFlow
- Where HTTP listen address, TLS, and HTTP/2 are configured
- How Moonlight jobs and optional WebSockets fit the worker model

{{< prerequisites >}}
- DeskFlow running locally ([API tutorial](/documentation/deskflow-tutorial/))
- [Commands](/documentation/operations/commands/) — `rr:setup`, `runserver`, `stopserver`
- Optional: `composer require spiral/roadrunner-http nyholm/psr7`
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
sequenceDiagram
  participant RR as RoadRunner
  participant W as PHP worker
  participant API as DeskFlow API
  Note over W: bootOnce() once per worker
  RR->>W: PSR-7 request
  W->>API: handleRequest()
  API-->>W: Response
  W-->>RR: JSON envelope
  RR-->>Client: HTTP response
  Note over W: PDO pool reused; no exit()
{{< /mermaid >}}

PHP-FPM boots the framework on every request. RoadRunner keeps workers alive — **boot once**, handle many requests. `ConnectionManager` reuses PDO across requests; call `disconnect()` only on worker shutdown.

## Setup

```bash
composer require spiral/roadrunner-http nyholm/psr7
composer require --dev spiral/roadrunner-cli
php pionia rr:setup
php pionia runserver
```

For production deploy, run `php pionia optimize --production` and configure OPcache preload — see [Production performance](/documentation/operations/production-performance/).

## HTTP listen address

Resolved in order:

1. CLI `--port` / `--host`
2. `PORT` / `SERVER_PORT` in `.env`
3. `[roadrunner]` or `[server]` in `settings.ini`
4. `.rr.yaml` → `http.address`
5. Default **8000** (same as `php pionia serve` and the frontend API proxy)

`runserver` passes `-o http.address=…` when the resolved address differs from the file.

## TLS/SSL (application config)

TLS (often called SSL) is configured in **your app** — not in Pionia framework code. It encrypts traffic between clients and your server and proves server identity via certificates.

| TLS provides | Does *not* replace |
|--------------|-------------------|
| Encryption on the wire | JWT, API keys, or `mustAuthenticate()` |
| Server identity (certificate) | Moonlight `returnCode` / response envelope |
| Integrity (tamper detection) | Input validation (`rules()`, attributes) |

RoadRunner or Nginx terminates TLS **before** PHP runs. Workers still receive normal HTTP requests via PSR-7 — no changes to services, switches, or actions.

For production APIs on the public internet, terminate TLS at **Nginx/Caddy** (recommended) or on **RoadRunner** directly — see below and [Production behind Nginx](/documentation/getting-started/introduction/#production-behind-nginx).

## HTTP/2 and TLS on RoadRunner

Default `.rr.yaml` in a new app listens on plain HTTP (`127.0.0.1:8000`) — fine for local dev. For HTTPS and HTTP/2, edit **your app’s** `.rr.yaml` (in the project root, not in `vendor/`):

```yaml
http:
  address: 0.0.0.0:443
  middleware: ["gzip"]
  http2:
    h2c: false
    max_concurrent_streams: 128
  ssl:
    cert: /path/to/fullchain.pem
    key: /path/to/privkey.pem
  pool:
    num_workers: 2
```

| Setting | Purpose |
|---------|---------|
| `http2.h2c: false` | HTTP/2 over TLS (normal HTTPS) |
| `http2.h2c: true` | Cleartext HTTP/2 (H2C) — local testing only, not production |
| `ssl.cert` / `ssl.key` | PEM certificate and private key |

RoadRunner can also obtain certificates via **ACME** (Let’s Encrypt). See the [RoadRunner HTTP plugin docs](https://docs.roadrunner.dev/docs/http/http) for `ssl.acme` and advanced options.

**Requirements:**

- RoadRunner binary (`php pionia rr:setup`)
- `spiral/roadrunner-http` and `nyholm/psr7` (already required for `runserver`)
- Valid TLS certificates for HTTPS (or ACME in production)

**Verify HTTP/2:**

```bash
curl --http2 -k https://127.0.0.1/api/v1/ping
```

HTTP/2 **server push** is supported by RoadRunner via response headers but is niche for Moonlight JSON APIs — not required for typical Pionia apps.

## Commands

| Command | Purpose |
|---------|---------|
| `php pionia runserver` | Foreground RR (formatted access logs in terminal) |
| `php pionia runserver --detach` | Background; logs to `storage/logs/roadrunner.log` |
| `php pionia runserver:logs` | Tail log file (Ctrl+C to stop) |
| `php pionia stopserver` | Stop detached instance |

### Log formatting

RoadRunner emits structured HTTP lines. Pionia formats them for readability:

```text
13:18:42  GET     /api/v1/ping  200  1.2 KB   4ms
```

Use `--raw` on `runserver` or `runserver:logs` for the original JSON lines.

`runserver:logs` options: `--lines=50`, `--no-follow`, `--wait` (block until log exists), `--log=/path`.

## Worker entry

`worker.php` → `PioniaWorker` routes by `RR_MODE`:

| Mode | Handler |
|------|---------|
| `http` | HTTP request loop |
| `jobs` | Moonlight job consumer |
| `centrifuge` | WebSocket RPC (optional) |

**Never call `exit()` in route handlers** — it kills the worker process.

Use `handleRequest()` / worker-safe patterns from [request lifecycle](/documentation/http/requests-and-responses/).

## Moonlight jobs

`environment/settings.ini`:

```ini
[jobs]
ENABLED = true
PIPELINE = moonlight
RPC = tcp://127.0.0.1:6001
```

`.rr.yaml` in your app root needs `rpc` + `jobs` sections when using background jobs.

```php
moonlight()->async('mail', 'send_welcome', ['email' => 'alex@northwind.studio']);
```

Returns `returnCode: 202` with `job_id` when the queue accepts the job. See [Background work](/documentation/operations/background-work/).

## Realtime (WebSockets, optional)

RoadRunner can host a **Centrifugo** plugin for WebSocket RPC using the same Moonlight `{ service, action }` envelope as HTTP.

1. `composer require roadrunner-php/centrifugo`
2. Uncomment the `centrifuge` section in `.rr.yaml`
3. Enable in `environment/settings.ini`:

```ini
[realtime]
ENABLED = true
CHANNEL_PREFIX = moonlight
```

Frames are handled by `MoonlightFrameHandler` — responses match the HTTP JSON shape. This is optional; most apps only need HTTP + jobs.

## Built-in dev server vs RR

| | `php pionia serve` | `php pionia runserver` |
|--|-------------------|------------------------|
| Server | PHP `-S` | RoadRunner |
| HTTP version | **HTTP/1.x only** | HTTP/1 by default; HTTP/2 via `.rr.yaml` |
| TLS | No | Via `.rr.yaml` `ssl` or reverse proxy |
| Workers | New process per request | Persistent pool |
| Jobs queue | Sync fallback after response | Full RR jobs |
| Best for | Quick local API checks | Production-like testing |

`php pionia serve` cannot enable HTTP/2 or TLS — use `runserver` with `.rr.yaml` `http2`/`ssl`, or put Nginx/Caddy in front. See [HTTP/2 and TLS on RoadRunner](#http2-and-tls-on-roadrunner).

## Quick reference

| Goal | Where to configure | Pionia PHP changes |
|------|-------------------|-------------------|
| Local dev (HTTP/1) | `php pionia serve` or default `runserver` | None |
| RR HTTPS + HTTP/2 | App `.rr.yaml` → `ssl` + `http2` | None |
| Production TLS + HTTP/2 | Nginx/Caddy `listen … http2` → RR or FPM | None |

## Config reference

See `.rr.yaml` in your project root for HTTP pool, jobs pipeline, and optional Centrifugo block.

## Common mistakes

- **Calling `exit()` in a service or middleware** — kills the worker; return a response instead.
- **Enabling `[jobs] ENABLED` without RR running** — jobs fall back to sync after response; watch logs for warnings.
- **Expecting array cache to share across workers** — use Redis, database, or filesystem for cross-worker cache.
- **Editing `.rr.yaml` in `vendor/`** — TLS, pools, and jobs live in **your app root** `.rr.yaml`.

## What's next

{{< card-grid >}}
{{< link-card title="Background work" description="defer(), async(), and Moonlight jobs." href="/documentation/operations/background-work/" >}}
{{< link-card title="Production performance" description="OPcache preload for workers." href="/documentation/operations/production-performance/" >}}
{{< link-card title="Maintenance mode" description="503 gate without stopping RR." href="/documentation/operations/maintenance/" >}}
{{< /card-grid >}}
