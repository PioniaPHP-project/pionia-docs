---
title: "Logging"
slug: "logging"
description: "Use logger(), report(), and [logging] in settings.ini for application and error logs."
summary: "Monolog-backed logging with channels, redaction, and the exception pipeline."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 704
toc: true
doc_type: how-to
seo:
  title: "Logging in Pionia v3"
  description: "logger() helper, LogManager channels, HIDE_IN_LOGS, report(), and storage/logs."
---

## Who this is for

You are running DeskFlow (or any Pionia app) and need to **see what happened** — action debug lines, SQL traces, or uncaught errors — without leaking passwords in log output.

## What you will learn

- Where logs go by default in v3
- How to call `logger()` and `report()` from services
- How to configure `[logging]` in `environment/settings.ini`
- How to add a file channel under `storage/logs/`

## Before you start

{{< prerequisites >}}
- A booted app (`php pionia serve`)
- Familiarity with [Exception pipeline](/documentation/http/exceptions/) (errors flow through `report()`)
{{< /prerequisites >}}

---

## How logging fits together

{{< mermaid >}}
flowchart LR
  Svc[TaskService action] --> Logger[logger]
  Err[Uncaught throwable] --> Report[report via pipeline]
  Logger --> LM[LogManager]
  Report --> LM
  LM --> Handlers[Monolog handlers]
  Handlers --> Out["stderr / storage/logs/"]
{{< /mermaid >}}

Pionia v3 uses **Monolog** behind a thin wrapper:

| Piece | Role |
|-------|------|
| `logger()` | Default application logger (PSR-3) |
| `logger('api')` | Named channel via `LogManager` |
| `report($e)` | Log throwables through the **exception pipeline** (no HTTP response) |
| `[logging]` in `settings.ini` | Format, redaction, optional response logging |
| `storage/logs/` | Where **file** channels and RoadRunner detach logs live |

{{< callout context="note" title="Not server.log" icon="outline/info-circle" >}}
Older guides referred to a `server.log` file in the project root and a `[SERVER] LOG_DESTINATION` key. **v3 apps do not use that layout.** Default output goes through Monolog's `ErrorLogHandler` (typically stderr / the PHP error log for your SAPI). For a project log file, use a **file channel** (below) or `storage/logs/roadrunner.log` when running RoadRunner detached.
{{< /callout >}}

---

## Step 1 — Log from a service

In DeskFlow's `TaskService`, log when a task is listed:

```php
protected function listAction(Arrayable $data): ApiResponse
{
    logger()->info('task.list', [
        'status_filter' => $data->get('status'),
        'user' => 'alex@northwind.studio',
    ]);

    return response(0, 'OK', ['tasks' => [/* … */]]);
}
```

Available levels (PSR-3): `debug`, `info`, `notice`, `warning`, `error`, `critical`, `alert`, `emergency`.

Example line (TEXT format):

```text
[2026-07-04 03:15:02] deskflow-api.info >> task.list  {"status_filter":"open","user":"alex@northwind.studio"}
```

The channel prefix (`deskflow-api`) comes from **`APP_NAME`** in `environment/.env`.

---

## Step 2 — Log errors with `report()`

Uncaught exceptions in HTTP and CLI should go through the **exception pipeline**, not ad-hoc `try/catch` + `logger()` in kernel code.

In **your** action code, when you catch and rethrow or need to log without rendering:

```php
try {
    // business logic
} catch (\Throwable $e) {
    report($e);
    throw $e;
}
```

Register pipeline behaviour on boot:

```php
// bootstrap/application.php or a Provider
app()->exceptions()
    ->dontReport(\Pionia\Exceptions\ValidationException::class)
    ->reportable(fn (\Throwable $e) => /* Sentry, etc. */);
```

See [Exceptions](/documentation/http/exceptions/) for maps, handlers, and debug JSON payloads.

---

## Step 3 — Configure `[logging]`

All logging keys live under **`[logging]`** in `environment/settings.ini` (not `[SERVER]` or `[LOGGER]`).

```ini
[logging]
LOG_FORMAT=TEXT
HIDE_IN_LOGS=password,pin,token,secret
HIDE_SUB=*********
```

| Key | Purpose |
|-----|---------|
| `LOG_FORMAT` | `TEXT` / `LINE` (default line), `JSON`, `SCALAR`, `HTML`, `SYSLOG` |
| `HIDE_IN_LOGS` | Comma-separated field names redacted in log **context** arrays |
| `HIDE_SUB` | Replacement string for redacted values (default `*********`) |
| `LOG_RESPONSES` | When `true`, Moonlight responses are logged at debug in `ApiSwitch` |
| `LOG_HANDLERS` | Advanced: extra Monolog handler classes (comma-separated) |
| `LOG_PROCESSORS` | Advanced: Monolog processor classes |

Redaction applies when you pass context arrays — e.g. `logger()->info('member.login', ['password' => '…'])` masks `password`.

### SQL query logging

To log every Porm query (verbose — use locally only):

```ini
[server]
LOG_QUERIES=true
```

Or in `.env`: `LOG_QUERIES=true` / `SHOW_QUERIES=true`.

---

## Step 4 — Watch logs locally

**Built-in server (`php pionia serve`)** — logs usually appear in the **same terminal** running the server.

**File channel** (recommended for tailing):

Register in an app provider:

```php
use Pionia\Logging\LogManager;

public function configureLogging(LogManager $log): void
{
    $log->extend('file', [
        'driver' => 'file',
        'path' => 'storage/logs/app.log',
        'level' => 'debug',
    ]);
}
```

Then in `.env`: `LOG_CHANNEL=file`, or call `logger('file')` explicitly.

Tail the file:

```bash
tail -f storage/logs/app.log
```

**RoadRunner detached** — background workers log to:

```bash
php pionia runserver --detach
php pionia runserver:logs   # tails storage/logs/roadrunner.log
```

---

## Named channels

```php
logger('api')->warning('Rate limit approaching', ['ip' => $request->ip()]);
```

Register channels in `Provider::configureLogging()` with `$log->extend('api', ['driver' => 'single'])` or a `file` driver as above.

---

## Production notes

| Topic | Recommendation |
|-------|----------------|
| **Secrets** | Extend `HIDE_IN_LOGS`; never log raw JWTs or passwords |
| **Volume** | Avoid `LOG_RESPONSES=true` in production — responses can be large |
| **Rotation** | Use `logrotate` on `storage/logs/*.log` |
| **External sinks** | Wire `->reportable()` to Sentry/Datadog; or add Monolog handlers via `LOG_HANDLERS` |
| **Debug mode** | `DEBUG=false` hides stack traces from **HTTP JSON** — it does not disable `logger()` |

---

## Common mistakes

- **`tail -f server.log`** — that path is v1/v2; use the terminal, `storage/logs/app.log`, or `runserver:logs`
- **Settings in `[SERVER]`** — use `[logging]` for `LOG_FORMAT`, `HIDE_IN_LOGS`, `LOG_RESPONSES`
- **Logging inside switches** — use services/actions; let the exception pipeline handle uncaught errors
- **Expecting request bodies in logs** — enable `LOG_RESPONSES` only when debugging; bodies are not logged by default

---

## What's next

{{< card-grid >}}
{{< link-card title="Exceptions" description="Pipeline, dontReport, debug payloads." href="/documentation/http/exceptions/" >}}
{{< link-card title="Developer stats" description="Request metrics at /stats." href="/documentation/operations/developer-stats/" >}}
{{< link-card title="Helpers" description="logger(), report(), shouldLogResponses()." href="/documentation/extending/helpers/" >}}
{{< /card-grid >}}
