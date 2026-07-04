---
title: "Database (Porm)"
description: "Query the database with Porm — Pionia's fluent SQL layer."
summary: "Configuration, CRUD, filtering, joins, pagination, connections, and the full Porm API."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 400
url: /documentation/database/
toc: true
parent: "documentation"
seo:
  title: "Porm — Pionia database layer"
  description: "Complete guide to Porm: table(), filter(), joins, WHERE DSL, pagination, and connections."
  canonical: ""
  noindex: false
---

Pionia includes **Porm** (Pionia ORM) — a Medoo-inspired **query builder**, not a full ORM. There are no models or migrations in the framework; you work with tables, arrays, and a fluent API.

## Quick start

```php
// Global helpers (recommended)
$row = table('users')->get(1);
$rows = table('users')->filter(['active' => 1])->limit(10)->all();

// Named connection from environment/settings.ini
table('orders', null, 'db_pgsql')->save(['total' => 99]);
```

{{<callout context="note" icon="outline/information-circle">}}
Porm is built into your Pionia app. Use `table()` or `db()` — not legacy `Porm\Porm::from()` patterns from older tutorials.
{{</callout>}}

## Your first database steps (DeskFlow)

In [API tutorial Part 1](/documentation/getting-started/api-tutorial/) you return hardcoded tasks. Part 3 (coming in the tutorial series) persists them in SQLite:

1. Add a `tasks` table migration or SQL file under `database/`.
2. Configure `[db]` in `environment/settings.ini` (SQLite is fine for local DeskFlow).
3. In `TaskService::listAction`, replace the array with `table('tasks')->filter(['project_id' => $data->getInt('project_id')])->all()`.

```php
$tasks = table('tasks')
    ->filter(['status' => 'open'])
    ->orderBy('created_at', 'DESC')
    ->limit(20)
    ->all();
```

Try it: [Making queries](/documentation/database/making-queries/) walks through `get()`, `save()`, and `update()` on a single table.

## Guide map

| Topic | Page |
|-------|------|
| Configuration & entry points | [Getting started](/documentation/database/configuration-getting-started/) |
| CRUD & reads | [Making queries](/documentation/database/making-queries/) |
| `filter()`, `orderBy`, `limit` | [Filtering](/documentation/database/queries-with-filtering/) |
| WHERE operators & clause keys | [WHERE DSL reference](/documentation/database/where-dsl/) |
| Joins & aliases | [Relationships & joins](/documentation/database/relationships/) |
| `count`, `sum`, `Agg` builder | [Aggregation](/documentation/database/using-functions-aggregation/) |
| `PaginationCore` & list APIs | [Pagination](/documentation/database/pagination/) |
| Multi-DB & pooling | [Connections](/documentation/database/connections/) |
| Transactions & raw SQL | [Transactions & raw SQL](/documentation/database/transactions-and-raw-sql/) |
| `chunk`, `random`, `explain` | [Performance](/documentation/database/performance/) |
| Method cheat sheet | [API reference](/documentation/database/api-reference/) |

## Query modes

```text
table('users')
  ├─ Direct mode   → get(), save(), update(), delete(), has(), random(), …
  ├─ filter()      → Builder (where, orderBy, limit, all, count, …)
  └─ join()        → Join (left, inner, right, full, all, count, random, …)
```

After `filter()` or `join()`, table-level write methods (`save`, `get`, etc.) are not available on the same chain — finish with `all()`, `get()`, or `count()` on the builder.

## Related docs

- [Generic services](/documentation/building-api/generic-services/) — CRUD over Porm via `GenericService`
- [Advanced generic services](/documentation/building-api/advanced-generic-services/) — joins, column aliases, pagination from HTTP
- [RoadRunner](/documentation/operations/roadrunner/) — `ConnectionManager` keeps PDO alive across requests
- [Helpers](/documentation/extending/helpers/) — `table()`, `db()`, `connectionManager()`
