---
title: "App Providers"
slug: "app-providers"
description: "Extend Pionia through Composer packages and application service providers."
summary: "Register middleware, auth, routes, and commands via Provider hooks."
date: 2024-10-28 07:23:58.954 +0300
lastmod: 2026-07-04 12:00:00.000 +0000
draft: false
weight: 6002
toc: true
doc_type: topic
parent: "extending"
seo:
  title: "App Providers"
  description: "Extend Pionia through Composer packages and application service providers."
  canonical: ""
  noindex: false
---

## Who this is for

You need a central place to wire DeskFlow — register JWT auth from a package, add billing middleware, or bind services in **`AppProvider`** without scattering boot logic across actions.

## What you will learn

- How `Provider` hooks map to middleware, auth, routes, and commands
- Boot order relative to `[app_switches]` and `WebApplication::bootOnce()`
- Registration via `[app_providers]` in `settings.ini` vs `addAppProvider()` in bootstrap

## Before you start

{{< prerequisites >}}
- [Extending Pionia overview](/documentation/extending/) — plugins vs providers
- DeskFlow or any app with `bootstrap/application.php` and `environment/settings.ini`
- Optional: [Authentication](/documentation/security/security-authentication-and-authorization/) — `authentications()` hook
{{< /prerequisites >}}

## How it works

Pionia separates **plugins** (Composer libraries that do not hook into boot) from **providers** (packages or app classes that register middleware, authentication, routes, commands, logging, cache, or exception behavior).

{{< mermaid >}}
flowchart TD
  Boot[AppRealm boot] --> Resolve[Resolve providers]
  Resolve --> Stacks[middlewares + authentications + commands]
  Stacks --> Configure[configureLogging Caching Exceptions]
  Configure --> OnBooted[onBooted container bindings]
  OnBooted --> Routes[Provider routes switches]
  INI["[app_switches]"] --> AppRoutes[App switches at boot]
{{< /mermaid >}}

Providers implement `Pionia\Contracts\ProviderContract` by extending `Pionia\Base\Provider\Provider`. The legacy name `Pionia\Base\Provider\AppProvider` is a deprecated alias of `Provider`.

## Creating a provider

DeskFlow might register Northwind-specific wiring in `Application\Providers\AppProvider`:

```php
use Pionia\Auth\AuthenticationChain;
use Pionia\Base\Provider\Provider;
use Pionia\Http\Routing\PioniaRouter;
use Pionia\Middlewares\MiddlewareChain;

class AppProvider extends Provider
{
    public function middlewares(MiddlewareChain $chain): MiddlewareChain
    {
        return $chain->add(RequestIdMiddleware::class);
    }

    public function authentications(AuthenticationChain $chain): AuthenticationChain
    {
        return $chain->addAuthentication(JwtAuthBackend::class);
    }

    public function commands(): array
    {
        return [
            'deskflow:sync' => SyncProjectsCommand::class,
        ];
    }

    public function configureExceptions(\Pionia\Exceptions\ExceptionPipeline $exceptions): void
    {
        $exceptions->dontReport(ValidationException::class);
    }

    public function onBooted(): void
    {
        app()->set('northwind.client', fn () => new NorthwindClient());
    }
}
```

Scaffold an app provider:

```bash
php pionia make:provider AppProvider
```

Package authors use the same pattern — see [BillingProvider example](/documentation/extending/composer-packages/#package-with-a-provider) in Composer packages.

## Provider hooks

| Method | Purpose |
|--------|---------|
| `middlewares()` | Add middleware to the global chain (`add`, `addBefore`, `addAfter`) |
| `authentications()` | Register auth backends (`addAuthentication`) |
| `commands()` | Return `alias => Command::class` map |
| `routes()` | Register API switches on the shared router |
| `configureLogging()` | Extend `LogManager` channels |
| `configureCaching()` | Register cache stores via `CacheManager::extend()` |
| `configureExceptions()` | Customize `ExceptionPipeline` |
| `configureValidations()` | Register custom validation rules |
| `onBooted()` | Container bindings after all stacks are built |
| `onTerminate()` | Cleanup on CLI shutdown |

### Boot order

1. Resolve registered providers
2. Merge middleware, authentication, and commands from **new** providers
3. Run `configureLogging`, `configureCaching`, `configureExceptions`, and `onBooted` on **all** providers
4. Register provider API routes (switches)

App switches from `[app_switches]` in `settings.ini` register during `AppRealm::boot()`. Provider routes register during `WebApplication::bootOnce()`.

## Registering a provider

**Recommended — bootstrap:**

```php
// bootstrap/application.php
return AppRealm::create(__DIR__)
    ->web()
    ->addAppProvider(\Application\Providers\AppProvider::class);
```

**INI — environment/settings.ini:**

```ini
[app_providers]
app=Application\Providers\AppProvider
billing=Vendor\Billing\BillingProvider
```

Both methods can be combined. `addAppProvider()` is chainable.

## Performance and cache

Pionia tracks fully booted providers in the `bootstrapped_providers` cache entry. When you add a provider, only that provider's hooks run on the next request. When you **remove** a provider, run:

```bash
php pionia cache:clear
```

Optional TTL in bootstrap:

```php
pionia()->appItemsCacheTTL = 3600; // seconds; 0 = indefinite (default)
```

## Package authors

1. Ship a `Provider` subclass in your package namespace.
2. Document the FQCN for consumers to add under `[app_providers]` or `addAppProvider()`.
3. Prefer unique API version strings in `routes()` (e.g. your package name) to avoid switch collisions.
4. Keep `onBooted()` lean — heavy work belongs in commands or async jobs.

## Common mistakes

- Calling `logger()` or `table()` inside `middlewares()` before the container is ready — use `onBooted()` for bindings that need a fully booted app
- Duplicating JWT registration in both `[app_authentications]` and `authentications()` without documenting order — backend order matters
- Heavy database migrations in `onBooted()` — slows every worker boot; use CLI commands instead
- Removing a provider without `cache:clear` — stale middleware or routes may persist

## What's next

{{< card-grid >}}
{{< link-card title="Composer packages" description="Publish a provider on Packagist." href="/documentation/extending/composer-packages/" >}}
{{< link-card title="Middleware" description="Global pipeline after provider registration." href="/documentation/http/middleware/" >}}
{{< link-card title="Authentication" description="JwtAuthBackend via authentications()." href="/documentation/security/security-authentication-and-authorization/" >}}
{{< /card-grid >}}
