---
title: "Exceptions & error handling"
slug: "exceptions"
description: "ExceptionPipeline, HTTP status codes, ValidationException, and debug responses."
summary: "Centralized reporting and rendering for all uncaught throwables."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 750
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Pionia exception pipeline"
  description: "Configure error handlers, mappers, and production-safe JSON errors."
  canonical: ""
  noindex: false
---

When Ada submits `product.create` without a `name`, Pionia Shop should return **HTTP 422** — not a blank 500 page. Pionia's **ExceptionPipeline** maps `ValidationException` and other throwables to consistent JSON envelopes.

## What you will learn

- Which exceptions map to which HTTP status codes
- How to configure handlers in a provider
- When to use `ValidationException` vs `HttpException`

{{< prerequisites >}}
- [Validation](/documentation/building-api/validation/) — throwing client errors from actions
- [Requests & responses](/documentation/http/requests-and-responses/) — `returnCode` in the JSON body
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  Action[product.createAction] --> Throw{Throwable?}
  Throw -->|ValidationException| P422[HTTP 422]
  Throw -->|ResourceNotFoundException| P404[HTTP 404]
  Throw -->|Other| P500[HTTP 500]
  P422 --> JSON[Moonlight envelope]
  P404 --> JSON
  P500 --> JSON
{{< /mermaid >}}

Pionia routes **every uncaught throwable** through `ExceptionPipeline`. Switches and the HTTP kernel do not use ad-hoc `try/catch` for normal errors — register behavior once at bootstrap.

## Default behavior

| Exception | Typical HTTP status | Client message |
|-----------|---------------------|----------------|
| `ValidationException` | **422** | Field message (e.g. missing required column) |
| `ResourceNotFoundException` | **404** | Not found message |
| `HttpException` subclasses | As set on exception | Message or generic text |
| Other `Throwable` | **500** | Hidden in production; details when `DEBUG=true` |

GenericService `create` / `update` throws `Pionia\Exceptions\ValidationException` when a required field is missing.

## Configure in a provider

```php
// bootstrap/providers/AppProvider.php (example)
public function configureExceptions(\Pionia\Exceptions\ExceptionPipeline $pipeline): void
{
    $pipeline
        ->handler(\Application\ExceptionHandler::class) // optional custom renderer
        ->dontReport(\Pionia\Exceptions\ValidationException::class)
        ->map(\Pionia\Exceptions\ResourceNotFoundException::class, fn ($e) => response(404, $e->getMessage()));
}
```

| Method | Purpose |
|--------|---------|
| `handler()` | Replace the default renderer |
| `reportable(callable)` | Sentry, Slack, extra logging |
| `dontReport(class)` | Skip logging for expected client errors |
| `map(class, callable)` | Return a custom `Response` before the default handler |

## Helpers

```php
// Log without building a response
report($throwable);

// Full pipeline: report + render
$response = pionia_handle_exception($e, $request);
```

Use `logger()` for normal application logs; use `report()` when something failed but you are handling it elsewhere.

## Self-rendering domain errors

Implement `Pionia\Contracts\RenderableException` (or extend `HttpException`) to control the HTTP response:

```php
use Pionia\Contracts\RenderableException;
use Pionia\Http\Request\Request;
use Pionia\Http\Response\Response;

final class InsufficientCreditsException extends \RuntimeException implements RenderableException
{
    public function render(Request $request): Response
    {
        return Response::json(json_encode([
            'returnCode' => 402,
            'returnMessage' => $this->getMessage(),
            'returnData' => null,
        ]), 402);
    }
}
```

## Debug JSON shape

When `DEBUG=true` or `APP_DEBUG=true`, API errors may include `returnData` with `exception`, `file`, `line`, and optional `trace` (controlled by `[exceptions] RENDER_TRACES` in `settings.ini`). In production, generic errors return `An unexpected error occurred.` without leaking internals.

## Services and actions

In custom `Service` actions, throw `ValidationException` for client mistakes and `HttpException` for auth/domain errors. Avoid catching and swallowing errors in switches — let the pipeline handle them.

## Common mistakes

- **Catching all exceptions in actions** — let the pipeline render consistent JSON; use `map()` for domain errors instead.
- **Expecting HTTP 200 on validation errors** — v3 uses real status codes; `returnCode` in the body is separate.
- **Leaking stack traces in production** — keep `DEBUG=false`; use `report()` + external monitoring for 500s.
- **Using plain `Exception` for missing fields** — use `ValidationException` so clients get **422**.

## What's next

{{< card-grid >}}
{{< link-card title="Validation" description="Rules and attributes before exceptions fire." href="/documentation/building-api/validation/" >}}
{{< link-card title="Requests & responses" description="Envelope fields and status codes together." href="/documentation/http/requests-and-responses/" >}}
{{< link-card title="Logging" description="report() and logger() channels." href="/documentation/operations/logging/" >}}
{{< /card-grid >}}
