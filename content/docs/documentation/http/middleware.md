---
title: "Middleware"
slug: "middleware"
description: "Request and response middleware chains in Pionia v3."
summary: "Global middleware runs before dispatch and after the response is built."
date: 2026-06-25T00:00:00.000Z
lastmod: 2026-07-02T00:00:00.000Z
draft: false
weight: 650
toc: true
doc_type: topic
seo:
  title: "Middleware in Pionia v3"
  description: "Create middleware, register in settings.ini or providers, and use onRequest / onResponse hooks."
  noindex: false
---

This guide is for DeskFlow developers who need **cross-cutting HTTP logic** — request IDs, security headers, or metrics — without duplicating code in every `*Action` method.

## What you will learn

- How middleware runs **before and after** dispatch (not inside actions)
- How to add `RequestIdMiddleware` so support tickets reference one ID
- Where to register middleware (`settings.ini` vs providers)

{{< prerequisites >}}
- [DeskFlow tutorial Step 1](/documentation/deskflow-tutorial/01-create-project/) — a running DeskFlow app
- [Application structure](/documentation/getting-started/application-structure/) — `middlewares/` folder
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
sequenceDiagram
  participant Client
  participant MW as Middleware chain
  participant Auth as Authentication
  participant API as Switch / Service
  Client->>MW: POST /api/v1/
  MW->>MW: onRequest (set X-Request-Id)
  MW->>Auth: identify caller
  Auth->>API: task.create
  API-->>MW: Response
  MW->>MW: onResponse (echo X-Request-Id)
  MW-->>Client: JSON envelope
{{< /mermaid >}}

Middleware runs **twice per HTTP request** — once on the incoming request (before routing and authentication) and once on the outgoing response (after the controller or exception handler builds it).

Use middleware for cross-cutting concerns: request IDs, security headers, response shaping, metrics headers, and similar logic that should not live in every service action.

**Authentication** is separate: backends in `authentications/` run after the request middleware chain. See [Security](/documentation/security/security-authentication-and-authorization/).

## Request lifecycle

```text
WebKernel::handle()
  → maintenance / CORS preflight (early exit)
  → WebKernel::boot()
      → MiddlewareChain::handle($request)     ← onRequest phase
      → AuthenticationChain::handle($request)
  → route match + dispatch (switch / static / docs)
  → WebKernel::terminate()
      → CORS response headers
      → MiddlewareChain::handle($request, $response)  ← onResponse phase
      → Response::prepare()
```

Middleware does **not** wrap individual service actions. To limit logic to specific Moonlight services, override `limitServicesTo()` (see below).

## Create a middleware

Extend `Pionia\Middlewares\Middleware` and implement `onRequest` and `onResponse`:

```php
namespace Application\Middlewares;

use Pionia\Http\Request\Request;
use Pionia\Http\Response\Response;
use Pionia\Middlewares\Middleware;

class RequestIdMiddleware extends Middleware
{
    public function onRequest(Request $request): void
    {
        $id = $request->headers->get('X-Request-Id') ?: bin2hex(random_bytes(8));
        $request->headers->set('X-Request-Id', $id);
    }

    public function onResponse(Response $response, Request $request): void
    {
        $id = $request->headers->get('X-Request-Id');
        if ($id) {
            $response->headers->set('X-Request-Id', $id);
        }
    }
}
```

### `onResponse` and the request

`onResponse` **does** receive the same `Request` instance from the current HTTP cycle. The framework passes both arguments:

```php
public function onResponse(Response $response, Request $request): void
```

Use `$request` to read headers or attributes you set in `onRequest`, inspect the Moonlight `service` / `action` from the JSON body, or branch on the request path. The response phase runs in `WebKernel::terminate()` after dispatch (or after the exception pipeline renders an error).

{{< callout note >}}
Older docs and generated stubs omitted the `$request` parameter on `onResponse`. The contract and runtime always passed both — update any middleware that only declared `onResponse(Response $response)`.
{{</ callout >}}

### Optional hooks

`MiddlewareTrait` also exposes empty hooks you can override:

| Hook | When |
|------|------|
| `beforeRequest()` | Immediately before `onRequest()` |
| `afterRequest()` | Immediately after `onRequest()` |
| `beforeResponse()` | Immediately before `onResponse()` |
| `afterResponse()` | Immediately after `onResponse()` |

Return types for `onRequest` / `onResponse` are `void`. Mutate `$request` and `$response` in place.

### Service-scoped middleware

By default middleware runs on **every** request. Override `limitServicesTo()` to run only when the JSON body `service` key matches:

```php
use Pionia\Collections\Arrayable;

public function limitServicesTo(): Arrayable
{
    return new Arrayable(['billing', 'reports']);
}
```

When the list is empty (default), middleware runs for all services.

## Registration

### settings.ini (app middleware)

```ini
[app_middlewares]
request_id = "Application\Middlewares\RequestIdMiddleware"
```

Keys are aliases (for ordering and stats); values are middleware class names. Entries merge with framework built-ins (for example `CacheMiddleware`).

### Service provider (packages)

```php
use Pionia\Middlewares\MiddlewareChain;

public function middlewares(MiddlewareChain $chain): MiddlewareChain
{
    return $chain->add(RequestIdMiddleware::class);
}
```

Provider middleware merges during boot. Use `addBefore()` / `addAfter()` for position relative to another class:

```php
return $chain
    ->add(LoggingMiddleware::class)
    ->addAfter(LoggingMiddleware::class, MetricsMiddleware::class);
```

### CLI generator

```bash
php pionia make:middleware RequestId
```

Creates `middlewares/RequestIdMiddleware.php` and appends the class to `environment/generated.ini` under `[app_middlewares]`. Move or copy the entry to `settings.ini` when you want it active in all environments.

## Middleware vs authentication

| | Middleware | Authentication |
|---|------------|----------------|
| **Purpose** | Cross-cutting request/response logic | Identify the caller (`ContextUserObject`) |
| **Directory** | `middlewares/` | `authentications/` |
| **INI section** | `[app_middlewares]` | `[app_authentications]` |
| **Runs** | Before and after dispatch | After request middleware, before dispatch |
| **Generator** | `make:middleware` | `make:auth` |

Protect actions with `mustAuthenticate()` / `can()` on services — not by throwing from middleware alone.

## Events

The chain dispatches PSR-14 events:

| Event | Phase |
|-------|--------|
| `PreMiddlewareChainRunEvent` | Start of `onRequest` chain |
| `PostMiddlewareChainRunEvent` | Start of `onResponse` chain |

Listen via your event provider or `onBooted()` registrations.

## Inspecting the stack

```php
middlewares(); // Arrayable of registered middleware class strings
```

The developer stats page (`/stats` when enabled) lists the active middleware stack.

## Common mistakes

- **Throwing from middleware to block auth** — use `mustAuthenticate()` on services instead; middleware should mutate request/response, not replace authorization.
- **Forgetting `onResponse` receives `$request`** — read headers you set in `onRequest` from the second parameter.
- **Editing `generated.ini` only** — copy `[app_middlewares]` entries to `settings.ini` for all environments.
- **Heavy DB work in middleware** — keep it fast; use `defer()` for slow logging after the response.

## What's next

{{< card-grid >}}
{{< link-card title="Exceptions" description="How errors become HTTP 422/404/500 JSON." href="/documentation/http/exceptions/" >}}
{{< link-card title="Security" description="Authentication backends run after middleware." href="/documentation/security/security-authentication-and-authorization/" >}}
{{< link-card title="App providers" description="Register middleware from Composer packages." href="/documentation/extending/app-providers/" >}}
{{< /card-grid >}}
