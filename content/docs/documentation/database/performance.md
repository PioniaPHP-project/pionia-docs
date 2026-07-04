---
title: "Performance"
description: "chunk, explain, random strategies, index hints, and list caps."
summary: "Patterns for large tables and efficient reads."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 820
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm performance"
  description: "Optimize Porm queries for large datasets."
  canonical: ""
  noindex: false
---

This guide helps **Northwind Studio** keep **DeskFlow** fast as task volume grows — batch exports, cached pagination totals, and avoiding N+1 queries when listing projects with assignees on port **8000**.

## What you will learn

- Paginate large task lists without repeated `COUNT(*)`
- Batch-process rows with `chunk()` and eager-load with `JoinLoader`
- Inspect query plans with `explain()` during development

{{< prerequisites >}}
- [Making queries](/documentation/database/making-queries/) — `chunk()`, `random()`, and `explain()`
- [Pagination](/documentation/database/pagination/) — `paginateApproximate()`
{{< /prerequisites >}}

## How it works

```text
Large task table
  ├─ chunk(500)        → process in PK batches
  ├─ JoinLoader        → one WHERE IN vs N+1 loops
  ├─ paginateApproximate → cached total_count
  └─ explain()         → verify indexes before ship
```

## Approximate pagination

`PaginationCore::paginateApproximate()` caches total row counts so list pages avoid `COUNT(*)` on every request. Enable on services with `$approximatePagination = true`. See [Pagination](/documentation/database/pagination/).

## Eager loading — `JoinLoader`

When you already have parent rows and need related data without N+1 queries:

```php
use Pionia\Porm\Database\Builders\JoinLoader;

$tasks = table('tasks')->filter(['status' => 'open'])->all();
$tasks = JoinLoader::eager($tasks, 'project_id', 'projects', 'id', 'project', 'default');
// each task now has ->project (or ['project'] when rows are arrays)
```

One extra `WHERE IN` query loads all related rows and attaches them by foreign key.

## Batch processing — `chunk()`

Avoid `all()` on huge tables. `chunk()` walks the table in PK order:

```php
table('tasks')->chunk(500, function (array $batch, int $page): void {
    foreach ($batch as $task) {
        // process
    }
}, ['status' => 'open']);
```

Each batch is at most `$size` rows. The callback runs until an empty batch is returned.

## Random rows without `ORDER BY RAND()`

`random()` defaults to **ID sampling** when there is no WHERE clause:

1. Read `MIN(id)` and `MAX(id)` (indexed)
2. Pick random IDs in range and fetch rows
3. Fall back to native `RAND()` if sampling fails or `strategy` is `native`

```php
table('tasks')->random(5);                              // sample strategy
table('tasks')->random(5, ['status' => 'open']);             // may use native when filtered
table('tasks')->random(5, null, 'id', 'native');      // force ORDER BY RAND()
```

Joined random:

```php
table('tasks')
    ->join()
    ->inner('projects', 'tasks.project_id = projects.id')
    ->random(3);
```

## Query plans — `explain()`

```php
$plan = table('tasks')->explain(['status' => 'open']);
```

Use during development to verify index usage before shipping heavy list endpoints.

## Index hints — `useIndex()`

MySQL only — suggests an index for the next query on that `Porm` instance:

```php
table('tasks')
    ->useIndex('idx_status_created')
    ->filter(['status' => 'open'])
    ->orderBy(['created_at' => 'DESC'])
    ->limit(50)
    ->all();
```

## Skip re-fetch after insert

```php
table('tasks')->save($row, returnRow: false);
$id = table('tasks')->lastSaved();
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
table('tasks')->filter([...])->all();
logger()->debug(table('tasks')->lastQuery());
```

Enable `[db] logging = true` or `LOG_QUERIES=true` for Piql-level logs.

Related: [Making queries](/documentation/database/making-queries/) · [Pagination](/documentation/database/pagination/).

## Common mistakes

- **Loading every DeskFlow task with `all()` for nightly exports** — use `chunk()` on `tasks` instead.
- **Querying `projects` inside a foreach over tasks** — attach with `JoinLoader::eager()` or a single join query.
- **Running exact `COUNT(*)` on every infinite-scroll fetch** — enable `$approximatePagination` on `TaskService`.
- **Shipping list endpoints without `explain()`** — verify indexes on `status` and `project_id` before Northwind production cutover.

## What's next

{{< card-grid >}}
{{< link-card title="Pagination" description="Approximate totals in list APIs." href="/documentation/database/pagination/" >}}
{{< link-card title="Relationships" description="Joins vs JoinLoader trade-offs." href="/documentation/database/relationships/" >}}
{{< link-card title="Connections" description="PDO reuse under RoadRunner." href="/documentation/database/connections/" >}}
{{< /card-grid >}}
