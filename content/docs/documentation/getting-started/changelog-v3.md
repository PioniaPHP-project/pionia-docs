---
title: "Pionia v3 — Release notes"
slug: "changelog-v3"
description: "Official release notes for Pionia 3.0 — platform requirements, new capabilities, and migration guidance."
summary: "What changed in Pionia v3: AppRealm, native HTTP stack, RoadRunner, production optimization, and the Moonlight async platform."
date: 2026-07-01T00:00:00.000Z
lastmod: 2026-07-04
draft: false
weight: 110
toc: true
seo:
  title: "Pionia v3 release notes"
  description: "Complete changelog for Pionia 3.0 — PHP 8.5, AppRealm, native routing, RoadRunner workers, and production tooling."
  canonical: ""
  noindex: false
---

---

## Who this is for

You are planning a **v3 upgrade** for an existing Pionia app or starting fresh with DeskFlow. This page lists platform requirements, breaking changes, and links to detailed guides.

## What you will learn

- PHP 8.5 requirements and the `pionia/pionia-app` template split
- Major v3 capabilities: AppRealm, native HTTP stack, RoadRunner, async Moonlight
- Where to read migration steps vs feature deep dives

## Before you start

{{< prerequisites >}}
- Read [Why Pionia?](/documentation/getting-started/why-pionia/) for the product fit
- Upgrading an existing app? Start [Upgrading from v2](/documentation/getting-started/upgrading-from-v2/) in parallel
{{< /prerequisites >}}

## How it works

v3 preserves the Moonlight contract Northwind clients already know — `{ "service", "action" }` on `/api/v1/` with the same envelope. The **platform underneath** changed: bootstrap, routing, CLI, caching, and deploy tooling are now native to Pionia.

Pionia **3.0** is a major release that modernizes the framework kernel, reduces third-party dependencies, and adds first-class tooling for production deployment, persistent workers, and full-stack applications.

This document summarizes what is new, what changed, and where to read the detailed guides. For step-by-step migration from v2, see [Upgrading from v2](/documentation/getting-started/upgrading-from-v2/).

## Release overview

| | |
|---|---|
| **Release** | `pionia/pionia-core` **3.0** |
| **Application template** | [`pionia/pionia-app`](https://packagist.org/packages/pionia/pionia-app) |
| **PHP requirement** | **8.5+** |
| **Documentation** | This site (`/`) |

v3 preserves the Moonlight contract: versioned API paths, `{ "service", "action" }` dispatch, and a consistent response envelope. What changed is the **platform underneath** — bootstrap, HTTP stack, CLI, caching, exception handling, and deploy-time optimization are now native to Pionia.

## Platform requirements

### PHP 8.5

v3 targets **PHP 8.5** as the minimum supported version. The framework uses modern language features throughout the kernel:

| Feature | Usage in v3 |
|---------|-------------|
| `#[\NoDiscard]` | Helpers such as `response()`, `app()`, and `async()` |
| Pipe operator `\|>` | Request preparation in `WebKernel` |
| `array_find` / `array_any` | Collection utilities |
| `renderToString()` | Test-safe rendering without `exit()` |

Upgrade PHP before updating Composer dependencies. Older runtimes are not supported on the 3.x line.

### Package split

v3 introduces a clear separation between the **framework library** and the **application template**:

| Package | Role |
|---------|------|
| `pionia/pionia-core` | Framework library (Packagist) |
| `pionia/pionia-app` | Application scaffold (`composer create-project`) |

Create a new project:

```bash
composer create-project pionia/pionia-app my-api
cd my-api && php pionia serve
```

## Architecture

### AppRealm bootstrap

`PioniaApplication` is replaced by **`AppRealm`** — a singleton application container booted once per process.

| Concern | v2 | v3 |
|---------|----|----|
| Bootstrap | `new PioniaApplication(BASEPATH)` | `return AppRealm::create(__DIR__)` |
| HTTP entry | `handleRequest()` | `bootHttp()` / `handleRequest()` |
| CLI entry | ad-hoc wiring | `bootConsole()` |
| Helpers | mixed | `app()`, `realm()`, `container()` → same instance |

API switches register through **`[app_switches]`** in `environment/settings.ini` instead of imperative router wiring in bootstrap files.

### Request lifecycle

HTTP handling separates **boot** from **dispatch** — required for RoadRunner workers and testable in isolation:

| Method | Purpose |
|--------|---------|
| `WebApplication::bootOnce()` | Run `powerUp()` once per process |
| `WebApplication::handleRequest(Request)` | Match route and return `Response` (no `send()`) |
| `WebApplication::fly()` | FPM entry: globals → handle → send |
| `WebApplication::resetBetweenRequests()` | Flush per-request state in worker mode |

`runtimeMode()` reports `fpm`, `cli`, `worker`, or `testing` so components can adapt behavior without environment checks scattered through application code.

### Naming conventions

Framework base types use **short names** — no `Base*` prefix. Application code uses descriptive names (`MainSwitch`, `JwtAuthentication`, `RequestIdMiddleware`).

| Layer | Framework type | Application example |
|-------|------------------|---------------------|
| Switch | `Pionia\Http\Switches\ApiSwitch` | `MainSwitch` |
| Service | `Pionia\Http\Services\Service` | `AuthService` |
| Response envelope | `Pionia\Http\Response\ApiResponse` | `response()` helper |
| HTTP response | `Pionia\Http\Response\Response` | `Response::fromEnvelope()` |
| Authentication | `Pionia\Auth\Authentication` | `JwtAuthentication` |
| Middleware | `Pionia\Middlewares\Middleware` | `RequestIdMiddleware` |
| Command | `Pionia\Console\Command` | `SyncOrdersCommand` |
| Provider | `Pionia\Base\Provider\Provider` | `AppProvider` |

`ApiSwitch` retains the `Api` prefix because `Switch` is a PHP reserved keyword.

## Native HTTP stack

v3 removes Symfony Routing, HttpFoundation, and HttpKernel from the runtime dependency graph. Routing and dispatch are implemented in `Pionia\Http\Routing` and `Pionia\Http`.

| Removed dependency | Native replacement |
|--------------------|--------------------|
| `symfony/routing` | `RouteTable`, `RouteMatcher`, `RouteDefinition` |
| `symfony/http-kernel` | `RouteDispatcher` |
| `symfony/http-foundation` | `Request`, `Response`, `ParameterBag`, `UploadedFile` |
| `symfony/mime` | `Pionia\Http\Mime\MimeType` |
| `symfony/asset` | `asset()` helper |
| `symfony/filesystem` | `Pionia\Utils\Filesystem` |
| `symfony/dotenv` | `Pionia\Utils\Dotenv` |
| `symfony/uid` | `Pionia\Utils\Ulid` |
| `symfony/event-dispatcher` | `Pionia\Events\PioniaEventDispatcher` (PSR-14) |
| `symfony/cache` | `CacheManager` + PSR-16 adapters |
| `symfony/process` | `Pionia\Process\Process` |
| `symfony/console` | `Pionia\Console\Application` |

Switches still register under `/api/{version}/` via `[app_switches]`. The kernel matches routes, serves static assets, applies SPA fallback, and dispatches Moonlight POST bodies to services.

Production deployments can compile routes into bootstrap caches with `php pionia optimize --production`. See [HTTP routing](/documentation/http/http-routing/).

## RoadRunner and persistent workers

v3 adds first-class **RoadRunner** integration for persistent PHP workers — boot the framework once, serve many requests.

| Capability | Detail |
|------------|--------|
| Worker entry | `worker.php` + `.rr.yaml` in the application template |
| CLI | `php pionia runserver`, `stopserver`, `runserver:logs`, `rr:setup` |
| Connection pooling | `ConnectionManager` reuses PDO across requests; `disconnect()` on worker shutdown only |
| Listen address | Resolved from CLI flags → `.env` → `settings.ini` → `.rr.yaml` → default **8000** |
| Maintenance mode | Workers re-read `settings.ini` without restart |

RoadRunner is optional. `php pionia serve` remains the zero-config development server.

See [RoadRunner](/documentation/operations/roadrunner/).

## Background work and async Moonlight

v3 formalizes post-response work and durable job dispatch:

| API | When to use |
|-----|-------------|
| `defer(Closure)` | Fire-and-forget after the HTTP response (logging, webhooks) |
| `async(Closure)` | Same timing, with promise chaining |
| `async('service', 'action', $payload)` | Durable work via RoadRunner Jobs |
| `moonlight()->async(...)` | API-style **202 Accepted** with `job_id` |

All transports share the same `{ service, action, ...params }` envelope — HTTP POST, programmatic dispatch, queued jobs, and WebSocket RPC (Centrifugo via RoadRunner) invoke the same service actions.

Enable jobs in `settings.ini` when RoadRunner is running with a jobs pool:

```ini
[jobs]
ENABLED = true
PIPELINE = moonlight
RPC = tcp://127.0.0.1:6001
```

See [Background work](/documentation/operations/background-work/).

## Production performance

Deploy-time optimization is **opt-in** — readable PHP source ships by default; warm OPcache and bootstrap caches at cutover.

```bash
composer install --no-dev -o
php pionia optimize --production
```

The `--production` preset enables:

- Authoritative Composer classmap
- Bootstrap caches (`storage/bootstrap/routes.php`, `providers.php`)
- Hybrid OPcache preload (framework manifest from Packagist + app paths + optional stats snapshot)

Framework maintainers generate a portable preload manifest at release time; consumer apps merge it during `php pionia optimize`. Monitor hit rates on `/stats` when `STATS_ENABLED` or `DEBUG` is active.

See [Production performance](/documentation/operations/production-performance/).

## Native CLI and code generation

v3 ships a **native console** at `Pionia\Console\Application` — no Symfony Console in the framework runtime.

| Area | Detail |
|------|--------|
| Entry | `./pionia` → `bootConsole()` (same bootstrap as HTTP) |
| Commands | Extend `Pionia\Console\Command` |
| REPL | `php pionia shell` (aliases: `tinker`, `repl`) |
| Generators | `make:service`, `make:switch`, `make:command`, `make:middleware`, `make:auth`, `make:provider` |
| Version banner | Shows installed `pionia/pionia-core` version from Composer |

See [Commands (Pionia CLI)](/documentation/operations/commands/).

## Caching

v3 replaces Symfony Cache with a native **PSR-16** layer (`PioniaCache` + `CacheManager`).

| Store | `STORE` value | Best for |
|-------|---------------|----------|
| Filesystem | `filesystem` (default) | Single server |
| Array | `array` | Tests, per-worker memory |
| Null | `null` | Disable without code changes |
| Database | `database` | Shared cache via PDO |
| APCu | `apcu` | RoadRunner / FPM on one host |
| Redis | `redis` | Production clusters |

Custom stores register through `CacheManager::extend()` in a provider. CLI: `cache:clear`, `cache:prune`, `cache:delete {key}`.

See [Caching in Pionia](/documentation/operations/caching/).

## Exception pipeline

All uncaught throwables flow through **`ExceptionPipeline`** — switches and the HTTP kernel do not use ad-hoc `try/catch` for normal errors.

Configure once at bootstrap or in a provider:

```php
$app->exceptions()
    ->handler(App\ExceptionHandler::class)
    ->reportable(fn (Throwable $e) => /* Sentry */)
    ->dontReport(ValidationException::class)
    ->map(ResourceNotFoundException::class, fn ($e) => response(404, $e->getMessage()));
```

| Helper | Purpose |
|--------|---------|
| `report($e)` | Log via the pipeline without rendering |
| `pionia_handle_exception($e, $request)` | Full report + render |
| `RenderableException` | Domain errors that control their own HTTP response |

Debug JSON includes exception details when `DEBUG=true`; production responses hide internals.

See [Exceptions & error handling](/documentation/http/exceptions/).

## Security utilities

v3 adds **`Pionia\Security\Security`** — a single cryptography and randomness surface with matching global helpers:

```php
$token = secure_token();
$hash  = secure_hash_password('secret');
$plain = secure_decrypt($cipher);
```

Covers CSPRNG tokens, OTPs, ULIDs, password hashing (Argon2id / bcrypt), HMAC, symmetric encryption (libsodium), and hybrid RSA for large payloads. Set `APP_KEY` in `.env` for encryption at rest.

See [Security utilities](/documentation/security/security-utilities/).

## Validation

Action methods support declarative validation via **`#[Validated]`** and **`#[ValidateField]`** attributes — rules run automatically before the action body. Imperative `rules()` and `validate()` chains remain available for complex cases.

`ValidationException` maps to **HTTP 422** through the exception pipeline.

See [Validations](/documentation/building-api/validation/).

## API documentation and observability

| Feature | Detail |
|---------|--------|
| Moonlight OpenAPI | `@moonlight-*` PHPDoc tags → `php pionia api:docs` |
| Interactive UI | `/docs` (Scalar) when `DOCS_ENABLED` or `DEBUG` |
| JSON catalog | `/api/v1/__catalog` and `php pionia api:catalog` |
| Request metrics | `/stats`, `/stats.json`, `php pionia stats:view` |
| Token gates | `DOCS_TOKEN`, `STATS_TOKEN` for staging without `DEBUG` |

See [API reference (Moonlight)](/documentation/building-api/api-reference/) and [Developer stats](/documentation/operations/developer-stats/).

## Frontend integration (Vite)

v3 scaffolds **Vite** SPAs alongside the Moonlight API:

```bash
composer create-project pionia/pionia-app my-app -- --react-ts
php pionia frontend:scaffold --framework=vue-ts --yes
php pionia frontend:dev    # dev proxy to /api
php pionia frontend:build  # dist/ → public/
```

Supported templates: React, Vue, and Svelte (TypeScript). When `SPA_FALLBACK=true` or `public/index.html` exists, client routes fall back to the SPA shell.

See [Frontend integration (Vite)](/documentation/frontend/vite-integration/).

## Service providers

Packages and applications extend Pionia through **`Provider`** (`ProviderContract`):

| Hook | Use for |
|------|---------|
| `middlewares()` | Global middleware chain |
| `authentications()` | Auth backends |
| `commands()` | CLI command registration |
| `routes()` | Package API switches |
| `configureLogging()` | Custom log channels |
| `configureCaching()` | Custom cache stores |
| `configureExceptions()` | Pipeline handlers and maps |
| `configureValidations()` | Custom validation rules |
| `onBooted()` | Container bindings after stack registration |

Register in `[app_providers]` in `settings.ini` or via `pionia()->addAppProvider()` in bootstrap.

See [App providers](/documentation/extending/app-providers/).

## Operations

| Feature | Command / path |
|---------|----------------|
| Maintenance mode | `php pionia maintenance:on` / `maintenance:off` (aliases: `down` / `up`) |
| Framework assets | `/__pionia/{path}` (favicon, welcome page CSS) |
| User static files | `/static/{path}` from `public/static/` |
| Media uploads | `/media/{path}` from `storage/media/` |
| Welcome page | `GET /` → `public/index.html` if present, else framework welcome |

Maintenance returns **HTTP 503** for all routes except `/__pionia/*`. Bypass with `?bypass=` or `X-Maintenance-Bypass`.

See [Maintenance mode](/documentation/operations/maintenance/).

## Breaking changes from v2

The following require attention when upgrading existing applications:

| Area | v2 | v3 |
|------|----|----|
| Bootstrap | `PioniaApplication` | `AppRealm::create()` |
| Switch registration | Imperative `PioniaRouter` wiring | `[app_switches]` in `settings.ini` |
| `registerServices()` return type | array | `Arrayable` (`arr([...])`) |
| Static assets | `static/` at repo root | `public/static/` |
| HTTP routing | Symfony Routing | Native `RouteTable` / `RouteMatcher` |
| Console | Symfony Console (transitive) | Native `Pionia\Console\Application` |
| Cache | Symfony Cache | Native `CacheManager` (PSR-16) |
| PHP version | 8.x (varies) | **8.5+** required |

Framework class renames follow the v3 naming table above (`ApiSwitch`, `ApiResponse`, etc.). A fresh scaffold plus porting `services/`, `switches/`, and `environment/` is often faster than incremental migration.

See [Upgrading from v2](/documentation/getting-started/upgrading-from-v2/) for a complete checklist.

## Documentation map

| Topic | Guide |
|-------|-------|
| First project | [Introduction](/documentation/getting-started/introduction/) |
| Folder layout | [Application structure](/documentation/getting-started/application-structure/) |
| Moonlight model | [Moonlight architecture](/documentation/building-api/moonlight-overview/) |
| Database | [Porm (database)](/documentation/database/) |
| Deploy checklist | [Documentation hub — Production checklist](/documentation/) |

## Getting help

- [Resources](/resources/) — community links and in-project commands
- Enable `DEBUG=true` temporarily and inspect `storage/logs/` for error details
- Open an issue on the repository you installed from Packagist

## Common mistakes

- **Upgrading Composer before PHP 8.5** — v3 will not boot on older runtimes.
- **Keeping Symfony route files** — v3 uses native `RouteTable`; remove dead `routes.php` wiring.
- **Assuming v2 `PioniaApplication` still exists** — rename to `AppRealm::create()` everywhere.
- **Skipping `php pionia optimize --production`** — deploy works without it, but you miss preload and route caches.

## What's next

{{< card-grid >}}
{{< link-card title="Upgrading from v2" description="Step-by-step migration checklist." href="/documentation/getting-started/upgrading-from-v2/" >}}
{{< link-card title="Introduction" description="Scaffold a fresh v3 DeskFlow app." href="/documentation/getting-started/introduction/" >}}
{{< link-card title="RoadRunner" description="Persistent workers in v3." href="/documentation/operations/roadrunner/" >}}
{{< /card-grid >}}

---

*Pionia v3 release notes — last updated for `pionia/pionia-core` 3.0.*
