---
title: "RoadRunner"
slug: "roadrunner"
description: "Persistent PHP workers with RoadRunner in Pionia v3."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 550
toc: true
parent: "documentation"
seo:
  title: "RoadRunner in Pionia"
  description: "Run Pionia with persistent workers, jobs, and formatted access logs."
  noindex: false
---

## Why RoadRunner

PHP-FPM boots the framework on every request. RoadRunner keeps workers alive — **boot once**, handle many requests. `ConnectionManager` reuses PDO across requests; call `disconnect()` only on worker shutdown.

## Setup

```bash
composer require spiral/roadrunner-http nyholm/psr7
composer require --dev spiral/roadrunner-cli
php pionia rr:setup
php pionia runserver
```

For production deploy, run `php pionia optimize --production` and configure OPcache preload — see [Production performance](/documentation/production-performance/).

## HTTP listen address

Resolved in order:

1. CLI `--port` / `--host`
2. `PORT` / `SERVER_PORT` in `.env`
3. `[roadrunner]` or `[server]` in `settings.ini`
4. `.rr.yaml` → `http.address`
5. Default **8003** (same as `php pionia serve` and the frontend API proxy)

`runserver` passes `-o http.address=…` when the resolved address differs from the file.

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

Use `handleRequest()` / worker-safe patterns from [request lifecycle](/documentation/requests-and-responses/).

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
moonlight()->async('mail', 'send_welcome', ['email' => $user->email]);
```

Returns `returnCode: 202` with `job_id` when the queue accepts the job. See [Background work](/documentation/background-work/).

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
| Workers | New process per request | Persistent pool |
| Jobs queue | Sync fallback after response | Full RR jobs |
| Best for | Quick local API checks | Production-like testing |

## Config reference

See `.rr.yaml` in your project root for HTTP pool, jobs pipeline, and optional Centrifugo block.

Related: [Maintenance mode](/documentation/maintenance/) · [Database connections](/documentation/database/connections/) · [CLI](/documentation/commands-pionia-cli/).
