---
title: "Caching in Pionia"
slug: "caching-in-pionia"
description: "PSR-16 cache layer, stores, and GenericService response caching."
summary: "Native CacheManager with filesystem, Redis, APCu, database, and array stores."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 2000
toc: true
parent: "documentation"
seo:
  title: "Caching in Pionia"
  description: "Configure and use PioniaCache with multiple backends."
  canonical: ""
  noindex: false
---

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
app()->cacheInstance()->set('rates', $rates, 300);
$value = app()->cacheInstance()->get('rates');

// Named store
app()->cache()->store('redis')->set('session:1', $payload, 900);
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

Register in a `BaseProvider`:

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

Related: [Performance (Porm)](/documentation/database/performance/) · [Generic services](/documentation/building-api/generic-services/).
