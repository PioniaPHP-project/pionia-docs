---
title: "Database (Porm)"
description: "Query the database with Porm — Pionia's fluent SQL layer."
summary: "Configuration, CRUD, filtering, joins, pagination, connections, and the full Porm API."
date: 2026-03-01
lastmod: 2026-07-20
draft: false
weight: 400
url: /documentation/database/
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Porm — Pionia database layer"
  description: "Complete guide to Porm: table(), filter(), joins, WHERE DSL, pagination, and connections."
  canonical: ""
  noindex: false
---

This section is for developers building **Pionia Shop** — the store API on port **8000**. Porm is how `ProductService`, `CustomerService`, and `OrderService` query `products`, `customers`, and `orders` without Eloquent-style models.

## What you will learn

- Configure `[db]` and call `table()` from Pionia Shop services
- Filter, join, paginate, and aggregate Pionia Shop tables
- Pool PDO connections under RoadRunner and FPM

{{< prerequisites >}}
- [API tutorial](/documentation/shop-tutorial/) — Pionia Shop services before persistence
- [Helpers](/documentation/extending/helpers/) — `table()`, `db()`, and `connectionManager()`
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  ProductService --> table["table('products')"]
  CustomerService --> tm["table('customers')"]
  OrderService --> orders["table('orders')"]
  table --> Porm["Porm / Piql"]
  tm --> Porm
  orders --> Porm
  Porm --> SQLite[("SQLite / PostgreSQL")]
{{< /mermaid >}}

Pionia includes **Porm** (Pionia ORM) — a Medoo-inspired **query builder**, not a full Eloquent-style ORM. You work with tables, arrays, and a fluent API. Schema changes use **PHP migrations** (`Schema` + `Blueprint`) — see [Migrations](/documentation/database/migrations/).

## Quick start

```php
// Global helpers (recommended)
$row = table('products')->get(1);
$rows = table('products')->filter(['status' => 'open'])->limit(10)->all();

// Named connection from environment/settings.ini
table('orders', null, 'db_pgsql')->save(['customer_id' => 1, 'status' => 'pending', 'total' => 49.0]);
```

{{<callout context="note" icon="outline/information-circle">}}
Porm is built into your Pionia app. Use `table()` or `db()` — not legacy `Porm\Porm::from()` patterns from older tutorials.
{{</callout>}}

## Your first database steps (Pionia Shop)

In the [Pionia Shop tutorial](/documentation/shop-tutorial/) you start with a hardcoded catalog, then persist products in SQLite and add `product.create`:

1. Create tables with `php pionia make:table` and `php pionia migrate` — see [Migrations](/documentation/database/migrations/).
2. Configure `[db]` in `environment/settings.ini` (SQLite is fine for local Pionia Shop).
3. In `ProductService::listAction`, replace the array with `table('products')->all()`.

```php
$products = table('products')
    ->filter(['stock[>]' => 0])
    ->orderBy('created_at', 'DESC')
    ->limit(20)
    ->all();
```

Try it: [Making queries](/documentation/database/making-queries/) walks through `get()`, `save()`, and `update()` on a single table.

## Guide map

| Topic | Page |
|-------|------|
| Schema & migrations | [Migrations](/documentation/database/migrations/) |
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
table('products')
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

## Common mistakes

- **Using `Porm::from()` or `Db::from()` in Pionia Shop services** — prefer the global `table()` helper wired in bootstrap.
- **Calling `save()` after `filter()` on the same chain** — finish reads with `all()` / `get()` first, then start a new `table('products')` for writes.
- **Skipping `[db]` in `settings.ini`** — Pionia Shop on port 8000 still needs a default connection (SQLite is fine locally).
- **Opening a new PDO per query** — reuse `connectionManager()`; do not call `disconnect()` between HTTP requests.

## What's next

{{< card-grid >}}
{{< link-card title="Migrations" description="make:table, migrate, Blueprint columns." href="/documentation/database/migrations/" >}}
{{< link-card title="Configuration" description="Wire SQLite for Pionia Shop on port 8000." href="/documentation/database/configuration-getting-started/" >}}
{{< link-card title="Making queries" description="CRUD on tasks and projects." href="/documentation/database/making-queries/" >}}
{{< /card-grid >}}
