---
title: "Caching in Pionia"
slug: "caching-in-pionia"
description: "PSR-16 cache layer, stores, and GenericService response caching."
summary: "Native CacheManager with filesystem, Redis, APCu, database, and array stores."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 2000
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Caching in Pionia"
  description: "Configure and use PioniaCache with multiple backends."
  canonical: ""
  noindex: false
---

This guide is for DeskFlow developers who need **application-level caching** — Moonlight APIs use POST for reads, so HTTP caches do not help; cache expensive `task.list` results in Redis or filesystem instead.

## What you will learn

- How to pick a cache store in `environment/settings.ini`
- How to read and write keys from services with `app()->cacheInstance()`
- When `GenericService` list/retrieve TTL applies to DeskFlow endpoints

{{< prerequisites >}}
- [Generic services](/documentation/building-api/generic-services/) — DeskFlow `task` service patterns
- [Commands](/documentation/operations/commands/) — `cache:clear`, `cache:prune`
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  Action[task.list action] --> CM[CacheManager]
  CM --> Hit{Key exists?}
  Hit -->|Yes| Return[Cached JSON rows]
  Hit -->|No| DB[(Porm / tasks table)]
  DB --> Store[Write cache with TTL]
  Store --> Return
  CM --> Backend[filesystem / redis / apcu / database]
{{< /mermaid >}}

Pionia v3 ships a **native PSR-16 cache layer** (`PioniaCache` + `CacheManager`).

Because Moonlight APIs use **POST** for reads and writes, HTTP caches do not apply — use application-level caching instead.

## Choose a store

`environment/settings.ini`:

```ini
[cache]
STORE=filesystem
TTL=3600

[cache_filesystem]
path=storage/cache

[cache_redis]
host=127.0.0.1
port=6379
prefix=pionia:
```

| Store | `STORE` value | Best for |
|-------|---------------|----------|
| Filesystem | `filesystem` (default) | Single server, no extensions |
| Array | `array` | Tests, per-worker memory |
| Null | `null` | Disable caching without code changes |
| Database | `database` | Shared cache via PDO |
| APCu | `apcu` | RoadRunner / FPM workers on one host |
| Redis | `redis` | Production clusters |

Aliases: `file`, `memory`, `void`, `db`.

## Use in code

```php
app()->cacheInstance()->set('deskflow:project:1:tasks', $rows, 300);
$value = app()->cacheInstance()->get('deskflow:project:1:tasks');

// Named store
app()->cache()->store('redis')->set('session:alex@northwind.studio', $payload, 900);
```

## CLI

```bash
php pionia cache:clear
php pionia cache:prune
php pionia cache:delete my_key
```

## GenericService list/retrieve cache

On services extending `GenericService`:

```php
public ?int $cacheListTtl = 60;      // seconds, null = off
public ?int $cacheRetrieveTtl = 300;
```

Cache keys include table, filters, pagination, and request parameters. Use for expensive list/retrieve endpoints; invalidate with `recached()` on the service when data changes (see [Actions](/documentation/building-api/actions/)).

## Custom adapters

Register in a `Provider`:

```php
public function configureCaching(\Pionia\Cache\CacheManager $cache): void
{
    $cache->extend('memcached', function ($app, array $config) {
        return new MemcachedCacheAdapter(/* ... */);
    });
}
```

## RoadRunner note

Each worker has its own memory. Use **Redis**, **database**, or **filesystem** stores when cache must be shared across workers.

## Common mistakes

- **Using array cache with multiple RoadRunner workers** — each worker has isolated memory; use Redis or filesystem.
- **Caching without invalidation** — call `recached()` after `task.create` / `task.update` or stale lists appear.
- **Expecting CDN/browser cache on POST** — only application-level PSR-16 caching applies to Moonlight reads.
- **Forgetting `cache:clear` after deploy** — old serialized payloads can linger in filesystem/Redis stores.

## What's next

{{< card-grid >}}
{{< link-card title="Generic services" description="List/retrieve TTL on DeskFlow services." href="/documentation/building-api/generic-services/" >}}
{{< link-card title="Performance (Porm)" description="Query-level optimization." href="/documentation/database/performance/" >}}
{{< link-card title="RoadRunner" description="Shared cache across workers." href="/documentation/operations/roadrunner/" >}}
{{< /card-grid >}}
