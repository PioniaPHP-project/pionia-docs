---
title: "HTTP routing"
slug: "http-routing"
description: "Native routing in Pionia v3 — switches via settings.ini, RouteTable, matching, and bootstrap caches."
summary: "How switches register routes and how the kernel dispatches HTTP requests."
date: 2026-07-02
lastmod: 2026-07-02
draft: false
weight: 572
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "HTTP routing in Pionia v3"
  description: "Register API switches in settings.ini, RouteTable, RouteMatcher, and production bootstrap caches."
  noindex: false
---

You register Pionia Shop's API at `/api/v1/` without maintaining a routes file — **`[app_switches]`** in `settings.ini` tells Pionia which switch class handles each version.

## What you will learn

- How HTTP paths map to switches, static files, and `/docs`
- Where Moonlight POST dispatch fits in the kernel
- How production bootstrap caches speed up matching

{{< prerequisites >}}
- [Introduction](/documentation/getting-started/introduction/) — first ping against `/api/v1/ping`
- [Application structure](/documentation/getting-started/application-structure/) — `switches/` folder
{{< /prerequisites >}}

## How it works

Pionia v3 ships a **native routing layer** — no Symfony Routing dependency. Routes are collected in a `RouteTable`, matched by `RouteMatcher`, and dispatched through `RouteDispatcher`.

## Mental model

```text
public/index.php  (or pionia / worker.php)
  → require bootstrap/application.php
  → AppRealm::create() boots once (singleton)
  → [app_switches] in settings.ini → router()->switch(...)
  → framework default routes (/docs, /stats, static, SPA fallback)
  → provider routes (optional, during bootOnce)
  → WebKernel → CompiledRouteMatcher → RouteDispatcher
```

Moonlight API traffic still flows **Switch → Service → Action**. Routing decides which controller handles the HTTP path (API switch, static files, `/docs`, `/stats`, etc.).

## Registering API switches (default)

New apps scaffold **`[app_switches]`** in `environment/settings.ini`. No `bootstrap/routes.php` file is required.

```ini
[app_switches]
v1=Application\Switches\MainSwitch
```

During `AppRealm::boot()`, the framework reads this section and calls `router($app)->switch(MainSwitch::class, 'v1')` for each entry.

| INI key | INI value | Result |
|---------|-----------|--------|
| `v1` | `Application\Switches\MainSwitch` | Routes under `/api/v1/` |
| `v2` | `Application\Switches\V2Switch` | Routes under `/api/v2/` |

Keys are **API version segments**; values are **switch class names** (must implement `SwitchContract` / extend `ApiSwitch`).

### Multiple versions

```ini
[app_switches]
v1=Application\Switches\MainSwitch
v2=Application\Switches\V2Switch
```

Each switch registers:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/ping` | GET | Health check |
| `/api/v1/` | POST | `{ "service", "action", ... }` dispatch |
| `/api/v1/{service}/{action}/` | GET | Optional query-string dispatch |
| `/api/v1/__catalog` | GET | JSON action catalog (debug/docs gate) |

Version `v2` gets the same pattern under `/api/v2/`.

See [API versioning in Moonlight](/documentation/building-api/api-versioning/) for when to add a version.

## Bootstrap entry points

All HTTP, CLI, and worker processes boot the same realm:

```php
// bootstrap/application.php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Pionia\Realm\AppRealm;

return AppRealm::create(__DIR__);
```

```php
// public/index.php
(require __DIR__ . '/../bootstrap/application.php')->bootHttp();
```

```php
// pionia (CLI)
exit((require __DIR__.'/bootstrap/application.php')->bootConsole());
```

`AppRealm::create()` is a **singleton** — repeated `require` of `application.php` returns the same instance. Helpers (`app()`, `realm()`, `router()`) are available after the realm boots.

## Other ways to register routes

| Approach | When to use |
|----------|-------------|
| **`[app_switches]` in `settings.ini`** | Default for app API versions (scaffolded) |
| **`Provider::routes()`** | Composer packages or shared app hooks |
| **`router($app)->switch()` in code** | Rare; dynamic registration in a provider `onBooted()` hook |

### Package / provider routes

```php
public function routes(PioniaRouter $router): PioniaRouter
{
    return $router->switch(BillingSwitch::class, 'v1');
}
```

Provider routes register during `WebApplication::bootOnce()` after app switches from settings are already wired.

### Programmatic switches (advanced)

If you must register switches in PHP (not INI), do it from a [service provider](/documentation/extending/app-providers/) — not a separate `routes.php` file:

```php
public function onBooted(): void
{
    router(app())->switch(LegacySwitch::class, 'v1');
}
```

## Core classes

| Class | Role |
|-------|------|
| `RouteDefinition` | Single route (path, methods, defaults, requirements) |
| `RouteTable` | Named collection of routes |
| `RouteMatcher` | Compiles regexes and matches path + HTTP method |
| `CompiledRouteMatcher` | Singleton matcher; prefers bootstrap cache when enabled |
| `RouteDispatcher` | Invokes the matched controller |
| `PioniaRouter` | Fluent API for switches and custom routes |

### Exceptions

| Exception | HTTP |
|-----------|------|
| `RouteNotFoundException` | 404 |
| `MethodNotAllowedException` | 405 |
| `ResourceNotFoundException` | 404 (domain resources) |

## Production bootstrap cache

When `[performance] BOOTSTRAP_CACHE=true` (or `php pionia optimize --production`), `php pionia optimize` writes:

| File | Contents |
|------|----------|
| `storage/bootstrap/routes.php` | Serialized `RouteTable` |
| `storage/bootstrap/providers.php` | Resolved provider class map |

At boot:

- `CompiledRouteMatcher` loads `storage/bootstrap/routes.php` when present
- `AppMixin::resolveProviders()` loads `storage/bootstrap/providers.php` when present

Regenerate after changing **`[app_switches]`**, provider routes, or framework route defaults:

```bash
php pionia optimize --no-scaffold --no-preload
# or full production preset:
php pionia optimize --production
```

Both files are gitignored — generate them on each deploy.

{{< callout note >}}
`storage/bootstrap/routes.php` is a **generated route cache**, not the old app bootstrap file. Application switches are configured in `settings.ini`.
{{< /callout >}}

## Migrating from `bootstrap/routes.php`

Older v3 apps (or tutorials) may still have:

```php
// bootstrap/routes.php  ← removed in current scaffolds
$app = require __DIR__ . '/application.php';
router($app)->switch(MainSwitch::class, 'v1');
return $app;
```

**Migrate:**

1. Add to `environment/settings.ini`:

```ini
[app_switches]
v1=Application\Switches\MainSwitch
```

2. Point entry points at `bootstrap/application.php` only (`public/index.php`, `pionia`, `worker.php`).
3. Delete `bootstrap/routes.php`.

## v2 → v3 routing changes

| v2 | v3 |
|----|-----|
| Symfony Routing (`symfony/routing`) | Native `RouteTable` + `RouteMatcher` |
| Symfony HttpKernel dispatch | `RouteDispatcher` |
| `PioniaRouter::wireTo()` | `router($app)->switch()` (via `[app_switches]` or providers) |
| `bootstrap/routes.php` for switches | `[app_switches]` in `settings.ini` |
| Route collection in Symfony format | `RouteDefinition` objects in `RouteTable` |

Symfony HttpFoundation, HttpKernel, and Routing packages are **removed** from framework `require`. Pionia implements `Request`, `Response`, routing, and dispatch natively.

<details>
<summary>Advanced — kernel classes (maintainers)</summary>

Classes like `RouteTable`, `RouteMatcher`, `CompiledRouteMatcher`, and `RouteDispatcher` live in `Pionia\Http\Routing`. App developers rarely touch them directly — switches and `settings.ini` are enough for Pionia Shop.

</details>

## Common mistakes

- **Adding routes in PHP when INI suffices** — prefer `[app_switches]` for API versions.
- **Expecting `/api/v1/task/list` paths for Moonlight** — dispatch is usually `POST /api/v1/` with JSON body.
- **Forgetting SPA fallback** — client-side routes need `public/index.html` or `[frontend] SPA_FALLBACK=true`.
- **Editing routes without clearing bootstrap cache** — run `php pionia optimize:clear` after route changes in production.

## What's next

{{< card-grid >}}
{{< link-card title="API versioning" description="When Pionia Shop adds v2." href="/documentation/building-api/api-versioning/" >}}
{{< link-card title="Requests & responses" description="Moonlight envelopes after routing." href="/documentation/http/requests-and-responses/" >}}
{{< link-card title="Production performance" description="Bootstrap cache and preload." href="/documentation/operations/production-performance/" >}}
{{< /card-grid >}}
