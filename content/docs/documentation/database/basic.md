---
title: "Making Queries"
slug: "making-queries"
description: "CRUD and common reads with table() and Porm."
summary: "get, all, save, update, delete, random, chunk, and raw SQL."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 812
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm — making queries"
  description: "Retrieve, insert, update, and delete rows with Porm in Pionia v3."
  canonical: ""
  noindex: false
---

This guide shows how Pionia Shop services persist and read rows in `products`, `orders`, and `customers`. Use `table()` from `ProductService` (and friends) on port **8000** — the same patterns Ada uses when replacing hardcoded arrays with SQLite.

## What you will learn

- Fetch one row with `get()` / `getOrThrow()` and many with `all()`
- Insert, update, and delete Pionia Shop products and orders safely
- Batch large tables with `chunk()` and debug with `lastQuery()`

{{< prerequisites >}}
- [Configuration](/documentation/database/configuration-getting-started/) — `[db]` wired for Pionia Shop
- [Database index](/documentation/database/) — query modes and guide map
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart TD
  A["table('products')"] --> B{Mode}
  B -->|direct| C["get / save / delete"]
  B -->|filter| D["Builder → all / count"]
  B -->|join| E["Join → all / count"]
{{< /mermaid >}}

All examples use the `table()` helper (`Pionia\Porm\Core\Porm`). Methods that execute SQL should be called **last** on the chain.

## Retrieving one row — `get()`

```php
table('products')->get(1);                    // WHERE id = 1
table('products')->get(1, 'sku');            // custom PK column
table('products')->get(['id' => 1, 'stock[>]' => 0]);
```

Returns an `object` or `null`. Array conditions are combined with `AND`.

### `getOrThrow()`

Same as `get()` but throws `Pionia\Exceptions\NotFoundException` when no row matches:

```php
$task = table('products')->getOrThrow(42, 'Task not found');
```

### `first()`

Table-level shortcut for a limited read (default one row):

```php
$row = table('orders')->first(1, ['status' => 'pending']);
```

On a **Builder** (after `filter()`), `first()` returns the first row of the result set.

## Retrieving many rows — `all()`

```php
$products = table('products')->all();
$products = table('products')->columns(['id', 'title'])->all();
$products = table('products')->all(['status' => 'open']);
```

Returns an array (empty when nothing matches).

For ordering, limits, and complex WHERE clauses, use `filter()` — see [Filtering](/documentation/database/queries-with-filtering/).

## Random rows — `random()`

```php
$task = table('products')->random();              // one object
$products = table('products')->random(10);           // array
$products = table('products')->random(5, ['status' => 'open']);
```

**Strategies** (fourth argument, default `sample`):

| Strategy | Behaviour |
|----------|-----------|
| `sample` | Samples primary-key values in range (fast on large tables when unfiltered); falls back to native `ORDER BY RAND()` |
| `native` | Database `RAND()` / equivalent |

```php
table('products')->random(10, null, 'id', 'native');
```

On joined queries use `join()->…->random()` — see [Relationships](/documentation/database/relationships/).

## Insert — `save()` / `saveAll()`

```php
$row = table('products')->save(['title' => 'Review wireframes', 'project_id' => 1]);
$id  = table('products')->lastSaved();
```

Pass `returnRow: false` to skip the follow-up SELECT after insert (faster when you only need `lastSaved()`):

```php
table('products')->save(['title' => 'Standup notes'], returnRow: false);
```

Bulk insert:

```php
table('products')->saveAll([
    ['title' => 'Design sprint'],
    ['title' => 'API smoke test'],
]);
```

### `saveOrUpdate()`

Insert when the primary key is missing, otherwise update. By default uses a native `UPSERT` / `ON CONFLICT` when the driver supports it:

```php
table('customers')->saveOrUpdate(['id' => 1, 'name' => 'Ada Lovelace']);
table('customers')->saveOrUpdate(['id' => 1, 'name' => 'Ada Lovelace'], nativeUpsert: false); // select-then-update fallback
```

### Increment / decrement columns

Update with SQL-side arithmetic — values are bound as parameters:

```php
table('products')->update(['sort_order[+]' => 1], ['id' => 42]);
table('products')->update(['stock[-]' => 1], ['id' => 3]);
```

Operators: `[+]`, `[-]`, `[*]`, `[/]` (numeric values only).

## Update — `update()`

```php
$stmt = table('products')->update(
    ['title' => 'Updated'],
    ['id' => 1]
);
$stmt->rowCount();
```

## Delete — `delete()` / `deleteById()`

```php
table('products')->delete(['id' => 1]);
table('products')->deleteById(2);
```

`deleteAll()` is an alias for `delete()`. An empty condition deletes **all** rows — use with care.

## Exists — `has()`

```php
table('products')->has(['id' => 1]);  // bool
table('products')->has(123);          // WHERE id = 123
```

## Batch reads — `chunk()`

Process large tables in primary-key order without loading everything into memory:

```php
table('products')->chunk(100, function (array $rows, int $page): void {
    foreach ($rows as $row) {
        // ...
    }
}, ['status' => 'open'], pkField: 'id');
```

The callback receives each batch and the 1-based page index. Iteration stops when a batch is empty.

## Index hints — `useIndex()`

MySQL index hint (no-op on other drivers):

```php
table('products')->useIndex('idx_status')->filter(['status' => 'open'])->all();
```

## Explain — `explain()`

Returns the database `EXPLAIN` plan for the current table + optional WHERE:

```php
$plan = table('products')->explain(['status' => 'open']);
```

## Raw SQL — `raw()`

Parameterized queries bypass the fluent builder:

```php
$row = table('products')->raw(
    'SELECT * FROM products WHERE id = :id',
    ['id' => 1]
);
```

One row → `object`; multiple → array. Prefer bound parameters over string concatenation.

For fragments inside WHERE arrays, use `Pionia\Porm\Core\Piql::raw()` or `Raw` objects — see [Transactions & raw SQL](/documentation/database/transactions-and-raw-sql/).

## Connection switching — `using()`

Switch the active connection on a `Porm` instance (must be called before `filter()` / `join()`):

```php
table('products')->using('db_pgsql')->all();
table('products', null, 'default')->using('analytics')->count();
```

The third argument to `table()` is equivalent to starting on that connection.

## Debugging

```php
table('products')->get(1);
echo table('products')->lastQuery();              // readable SQL (placeholders inlined)
[$sql, $map] = table('products')->getDatabase()->lastPrepared(); // raw prepared statement + binds
```

Next: [Filtering](/documentation/database/queries-with-filtering/) · [API reference](/documentation/database/api-reference/).

## Common mistakes

- **Calling `save()` after `filter()` on the same chain** — start a fresh `table('products')` for writes after a read builder.
- **Using `delete()` with an empty WHERE** — wipes every Pionia Shop task; always pass explicit conditions.
- **Concatenating user input into `raw()` SQL** — bind `:id` parameters from `$data` instead.
- **Expecting `get()` to throw on missing rows** — use `getOrThrow()` when `ProductService` should return 404.

## What's next

{{< card-grid >}}
{{< link-card title="Filtering" description="orderBy, limit, and where()." href="/documentation/database/queries-with-filtering/" >}}
{{< link-card title="Pagination" description="List products with PaginationCore." href="/documentation/database/pagination/" >}}
{{< link-card title="API reference" description="Full Porm method list." href="/documentation/database/api-reference/" >}}
{{< /card-grid >}}
