---
title: "Performance"
description: "chunk, explain, random strategies, index hints, and list caps."
summary: "Patterns for large tables and efficient reads."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 820
toc: true
parent: "database"
seo:
  title: "Porm performance"
  description: "Optimize Porm queries for large datasets."
  canonical: ""
  noindex: false
---

## Approximate pagination

`PaginationCore::paginateApproximate()` caches total row counts so list pages avoid `COUNT(*)` on every request. Enable on services with `$approximatePagination = true`. See [Pagination](/documentation/database/pagination/).

## Eager loading — `JoinLoader`

When you already have parent rows and need related data without N+1 queries:

```php
use Pionia\Porm\Database\Builders\JoinLoader;

$orders = table('orders')->filter(['status' => 'paid'])->all();
$orders = JoinLoader::eager($orders, 'user_id', 'users', 'id', 'user', 'default');
// each order now has ->user (or ['user'] when rows are arrays)
```

One extra `WHERE IN` query loads all related rows and attaches them by foreign key.

## Batch processing — `chunk()`

Avoid `all()` on huge tables. `chunk()` walks the table in PK order:

```php
table('events')->chunk(500, function (array $batch, int $page): void {
    foreach ($batch as $event) {
        // process
    }
}, ['processed' => 0]);
```

Each batch is at most `$size` rows. The callback runs until an empty batch is returned.

## Random rows without `ORDER BY RAND()`

`random()` defaults to **ID sampling** when there is no WHERE clause:

1. Read `MIN(id)` and `MAX(id)` (indexed)
2. Pick random IDs in range and fetch rows
3. Fall back to native `RAND()` if sampling fails or `strategy` is `native`

```php
table('users')->random(5);                              // sample strategy
table('users')->random(5, ['active' => 1]);             // may use native when filtered
table('users')->random(5, null, 'id', 'native');      // force ORDER BY RAND()
```

Joined random:

```php
table('products')
    ->join()
    ->inner('categories', 'products.category_id = categories.id')
    ->random(3);
```

## Query plans — `explain()`

```php
$plan = table('orders')->explain(['status' => 'pending']);
```

Use during development to verify index usage before shipping heavy list endpoints.

## Index hints — `useIndex()`

MySQL only — suggests an index for the next query on that `Porm` instance:

```php
table('orders')
    ->useIndex('idx_status_created')
    ->filter(['status' => 'open'])
    ->orderBy(['created_at' => 'DESC'])
    ->limit(50)
    ->all();
```

## Skip re-fetch after insert

```php
table('logs')->save($row, returnRow: false);
$id = table('logs')->lastSaved();
```

## List caps in services

`GenericService::$maxListRows` (default 1000) caps unbounded `list_*` responses when the client omits pagination. Set per service:

```php
public int $maxListRows = 250;
```

## Connection pooling

Reuse PDO via `connectionManager()` — do not open a new connection per query. See [Connections](/documentation/database/connections/).

## Debugging slow queries

```php
table('posts')->filter([...])->all();
logger()->debug(table('posts')->lastQuery());
```

Enable `[db] logging = true` or `LOG_QUERIES=true` for Piql-level logs.

Related: [Making queries](/documentation/database/making-queries/) · [Pagination](/documentation/database/pagination/).
