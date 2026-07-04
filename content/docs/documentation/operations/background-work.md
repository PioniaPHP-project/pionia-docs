---
title: "Background work"
slug: "background-work"
description: "defer(), async(), and Moonlight jobs after the HTTP response."
summary: "Defer work until after the HTTP response without blocking the client."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 725
toc: true
parent: "documentation"
seo:
  title: "Pionia background work — defer and async"
  description: "Post-response closures with defer() and durable Moonlight jobs with async()."
  canonical: ""
  noindex: false
---

PHP is **single-threaded**. Pionia does not spawn OS threads. **`defer()`** and closure **`async()`** run work **after the HTTP response is sent** so the client is not blocked — but the closure still executes in the **same PHP worker** until it finishes.

## Quick choice

| You want… | Use |
|-----------|-----|
| Fire-and-forget after the client gets JSON | **`defer(function () { … })`** |
| Same, plus promises (`.then()`, `await()`) | **`async(function () { … })`** |
| Durable email, reports, heavy jobs | **`async('service', 'action', $payload)`** + RoadRunner Jobs |
| HTTP **202** + `job_id` in the API response | **`moonlight()->async(...)`** |

{{<callout context="warning" icon="outline/alert-triangle">}}
**Do not use `async(closure)` expecting a new thread.** For post-response logging or webhooks, use **`defer()`**. Long `sleep()` or CPU-heavy closures still block that worker — use Moonlight jobs instead.
{{</callout>}}

## `defer()` — recommended for post-response work

```php
defer(function () use ($user) {
    logger()->info('Welcome email queued', ['id' => $user->id]);
});

return response(0, 'OK', $rows);
```

- Closure is **queued during the action** and runs **after** `fly()` sends the response (`php pionia serve`, FPM) or after RoadRunner `respond()`.
- Requires `composer require react/promise` in your application.
- On the built-in dev server, Pionia sets `Connection: close` and flushes output so `curl` returns before deferred work runs.

## `async()` — promises and Moonlight jobs

### Closure form (same timing as `defer`)

```php
(void) async(function () use ($user) {
    logger()->info('Post-response via promise API');
});
```

On PHP 8.5+, `async()` is `#[NoDiscard]` — use the return value or `(void) async(...)`. Prefer **`defer()`** when you do not need a promise.

### Moonlight job form

```php
async('mail', 'send_welcome', ['email' => $user->email]);
// or API-style 202:
moonlight()->async('mail', 'send_welcome', ['email' => $user->email]);
```

| Context | Behaviour |
|---------|-----------|
| RoadRunner + `[jobs] ENABLED` | Job queued on worker pool |
| `php pionia serve` / FPM without jobs | Runs **after response**, synchronously in same process |
| Tests (`PIONIA_TESTING`) | Sync unless `PIONIA_JOBS_QUEUE=1` |

Enable jobs in `environment/settings.ini`:

```ini
[jobs]
ENABLED = true
PIPELINE = moonlight
RPC = tcp://127.0.0.1:6001
```

See [RoadRunner](/documentation/operations/roadrunner/) for `.rr.yaml` `rpc` + `jobs` sections.

## Execution order (closure defer)

```text
1. Action body runs (including defer() call — closure NOT executed yet)
2. return response(...) builds JSON
3. Response sent to client
4. Deferred closure(s) run
5. Script / worker ready for next request
```

Log order for:

```php
logger()->info('A — before return');
defer(fn () => logger()->info('C — after response'));
logger()->info('B — still before return');
return response(0, 'OK', $data);
```

→ **A**, **B**, then client receives JSON, then **C**.

## `await()` and promises

```php
$result = await(async(fn () => expensive_local_work()));
```

`await()` triggers the deferred buffer when waiting on a pending closure promise.

## Related

- [Helpers](/documentation/extending/helpers/) — full helper list
- [RoadRunner](/documentation/operations/roadrunner/) — persistent workers and jobs
- [Services](/documentation/building-api/services/) — Moonlight actions
