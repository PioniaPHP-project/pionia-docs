---
title: "Background work"
slug: "background-work"
description: "defer(), async(), and Moonlight jobs after the HTTP response."
summary: "Defer work until after the HTTP response without blocking the client."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 725
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Pionia background work — defer and async"
  description: "Post-response closures with defer() and durable Moonlight jobs with async()."
  canonical: ""
  noindex: false
---

This guide is for Pionia Shop developers who need **post-response work** — log activity after Ada gets a JSON response, or queue welcome emails without blocking the `customer.register` action.

## What you will learn

- When to use `defer()` vs closure `async()` vs Moonlight job strings
- Execution order: response sent first, then deferred closures run
- How RoadRunner Jobs change behaviour vs `php pionia serve`

{{< prerequisites >}}
- [Services](/documentation/building-api/services/) — Pionia Shop actions that return envelopes
- `composer require react/promise` in your app (for `defer()` / closure `async()`)
- Optional: [RoadRunner](/documentation/operations/roadrunner/) with `[jobs] ENABLED`
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
sequenceDiagram
  participant Client
  participant Action as "product.create action"
  participant Resp as HTTP response
  participant Defer as Deferred buffer
  participant Job as RR jobs pool
  Client->>Action: POST /api/v1/
  Action->>Defer: defer(closure) queued
  Action->>Resp: return response(0, OK)
  Resp-->>Client: JSON envelope
  alt Closure defer
    Defer->>Defer: run closure in same worker
  else Moonlight job + RR
    Defer->>Job: async(mail, send_welcome)
    Job-->>Client: 202 + job_id (via moonlight()->async)
  end
{{< /mermaid >}}

PHP is **single-threaded**. Pionia does not spawn OS threads. **`defer()`** and closure **`async()`** run work **after the HTTP response is sent** so the client is not blocked — but the closure still executes in the **same PHP worker** until it finishes.

## Quick choice

| You want… | Use |
|-----------|-----|
| Fire-and-forget after the client gets JSON | **`defer(function () { … })`** |
| Same, plus promises (`.then()`, `await()`) | **`async(function () { … })`** |
| Durable email, reports, heavy jobs | **`async('service', 'action', $payload)`** + RoadRunner Jobs |
| HTTP **202** + `job_id` in the API response | **`moonlight()->async(...)`** |

{{< callout context="warning" title="Not a new thread" icon="outline/alert-triangle" >}}
**Do not use `async(closure)` expecting a new thread.** For post-response logging or webhooks, use **`defer()`**. Long `sleep()` or CPU-heavy closures still block that worker — use Moonlight jobs instead.
{{< /callout >}}

## `defer()` — recommended for post-response work

```php
defer(function () use ($user) {
    logger()->info('Welcome email queued', ['email' => 'ada@pionia.shop']);
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
async('mail', 'send_welcome', ['email' => 'ada@pionia.shop']);
// or API-style 202:
moonlight()->async('mail', 'send_welcome', ['email' => 'ada@pionia.shop']);
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

## Common mistakes

- **Using closure `async()` for heavy CPU work** — still blocks the worker; queue a Moonlight job instead.
- **Expecting jobs to run in parallel on `php pionia serve`** — without RR, string `async()` runs sync after the response.
- **Forgetting `react/promise`** — `defer()` requires it in your app's `composer.json`.
- **Assuming `moonlight()->async()` waits for job completion** — fulfillment means **accepted** by the queue (202), not finished processing.

## What's next

{{< card-grid >}}
{{< link-card title="RoadRunner" description="Jobs pool and worker.php modes." href="/documentation/operations/roadrunner/" >}}
{{< link-card title="Logging" description="Post-response logger() in defer()." href="/documentation/operations/logging/" >}}
{{< link-card title="Helpers" description="defer(), async(), await() reference." href="/documentation/extending/helpers/" >}}
{{< /card-grid >}}
