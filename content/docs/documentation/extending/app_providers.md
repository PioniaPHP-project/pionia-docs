---
title: "App Providers"
slug: "app-providers"
description: "Extend Pionia through Composer packages and application service providers."
summary: ""
date: 2024-10-28 07:23:58.954 +0300
lastmod: 2026-07-01 12:00:00.000 +0000
draft: false
weight: 6002
toc: true
seo:
  title: "App Providers"
  description: "Extend Pionia through Composer packages and application service providers."
  canonical: ""
  noindex: false
---

## Introduction

Pionia separates **plugins** (Composer libraries that do not hook into boot) from **providers** (packages or app classes that register middleware, authentication, routes, commands, logging, cache, or exception behavior).

Providers implement `Pionia\Contracts\ProviderContract` by extending `Pionia\Base\Provider\Provider`. The legacy name `Pionia\Base\Provider\AppProvider` is a deprecated alias of `Provider`.

## Creating a provider

```php
use Pionia\Auth\AuthenticationChain;
use Pionia\Base\Provider\Provider;
use Pionia\Http\Routing\PioniaRouter;
use Pionia\Middlewares\MiddlewareChain;

class BillingProvider extends Provider
{
    public function middlewares(MiddlewareChain $chain): MiddlewareChain
    {
        return $chain->add(BillingContextMiddleware::class);
    }

    public function authentications(AuthenticationChain $chain): AuthenticationChain
    {
        return $chain->addAuthentication(BillingTokenAuthentication::class);
    }

    public function commands(): array
    {
        return [
            'billing:sync' => SyncBillingCommand::class,
        ];
    }

    public function routes(PioniaRouter $router): PioniaRouter
    {
        return $router->switch(BillingSwitch::class, 'billing');
    }

    public function configureExceptions(\Pionia\Exceptions\ExceptionPipeline $exceptions): void
    {
        $exceptions->dontReport(BillingWebhookException::class);
    }

    public function onBooted(): void
    {
        app()->set('billing.client', fn () => new BillingClient());
    }
}
```

Scaffold an app provider:

```bash
php pionia make:provider AppProvider
```

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
return AppRealm::create(__DIR__);
// Optional: chain providers — or use [app_providers] in settings.ini
```

**INI — environment/settings.ini:**

```ini
[app_providers]
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

See also: [Middleware](/documentation/middleware/), [Authentication](/documentation/security/security-authentication-and-authorization/), and [Exceptions](/documentation/exceptions/).
