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
parent: "documentation"
seo:
  title: "Pionia exception pipeline"
  description: "Configure error handlers, mappers, and production-safe JSON errors."
  canonical: ""
  noindex: false
---

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

Related: [Validations](/documentation/services/validation/) · [Requests & responses](/documentation/requests-and-responses/) · [Database transactions](/documentation/database/transactions-and-raw-sql/).
