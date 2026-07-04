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

This guide shows **Northwind Studio** developers how **DeskFlow** services persist and read rows in `tasks`, `projects`, and `team_members`. You will use `table()` from `TaskService` and related actions on port **8000** — the same patterns alex@northwind.studio uses when replacing hardcoded arrays with SQLite.

## What you will learn

- Fetch one row with `get()` / `getOrThrow()` and many with `all()`
- Insert, update, and delete DeskFlow tasks safely
- Batch large tables with `chunk()` and debug with `lastQuery()`

{{< prerequisites >}}
- [Configuration](/documentation/database/configuration-getting-started/) — `[db]` wired for DeskFlow
- [Database index](/documentation/database/) — query modes and guide map
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart TD
  A["table('tasks')"] --> B{Mode}
  B -->|direct| C["get / save / delete"]
  B -->|filter| D[Builder → all / count]
  B -->|join| E[Join → all / count]
{{< /mermaid >}}

All examples use the `table()` helper (`Pionia\Porm\Core\Porm`). Methods that execute SQL should be called **last** on the chain.

## Retrieving one row — `get()`

```php
table('tasks')->get(1);                    // WHERE id = 1
table('tasks')->get(1, 'task_id');         // custom PK column
table('tasks')->get(['task_id' => 1, 'status' => 'open']);
```

Returns an `object` or `null`. Array conditions are combined with `AND`.

### `getOrThrow()`

Same as `get()` but throws `Pionia\Exceptions\NotFoundException` when no row matches:

```php
$task = table('tasks')->getOrThrow(42, 'Task not found');
```

### `first()`

Table-level shortcut for a limited read (default one row):

```php
$row = table('projects')->first(1, ['status' => 'active']);
```

On a **Builder** (after `filter()`), `first()` returns the first row of the result set.

## Retrieving many rows — `all()`

```php
$tasks = table('tasks')->all();
$tasks = table('tasks')->columns(['id', 'title'])->all();
$tasks = table('tasks')->all(['status' => 'open']);
```

Returns an array (empty when nothing matches).

For ordering, limits, and complex WHERE clauses, use `filter()` — see [Filtering](/documentation/database/queries-with-filtering/).

## Random rows — `random()`

```php
$task = table('tasks')->random();              // one object
$tasks = table('tasks')->random(10);           // array
$tasks = table('tasks')->random(5, ['status' => 'open']);
```

**Strategies** (fourth argument, default `sample`):

| Strategy | Behaviour |
|----------|-----------|
| `sample` | Samples primary-key values in range (fast on large tables when unfiltered); falls back to native `ORDER BY RAND()` |
| `native` | Database `RAND()` / equivalent |

```php
table('tasks')->random(10, null, 'id', 'native');
```

On joined queries use `join()->…->random()` — see [Relationships](/documentation/database/relationships/).

## Insert — `save()` / `saveAll()`

```php
$row = table('tasks')->save(['title' => 'Review wireframes', 'project_id' => 1]);
$id  = table('tasks')->lastSaved();
```

Pass `returnRow: false` to skip the follow-up SELECT after insert (faster when you only need `lastSaved()`):

```php
table('tasks')->save(['title' => 'Standup notes'], returnRow: false);
```

Bulk insert:

```php
table('tasks')->saveAll([
    ['title' => 'Design sprint'],
    ['title' => 'API smoke test'],
]);
```

### `saveOrUpdate()`

Insert when the primary key is missing, otherwise update. By default uses a native `UPSERT` / `ON CONFLICT` when the driver supports it:

```php
table('team_members')->saveOrUpdate(['id' => 1, 'name' => 'Alex Chen']);
table('team_members')->saveOrUpdate(['id' => 1, 'name' => 'Alex Chen'], nativeUpsert: false); // select-then-update fallback
```

### Increment / decrement columns

Update with SQL-side arithmetic — values are bound as parameters:

```php
table('tasks')->update(['sort_order[+]' => 1], ['id' => 42]);
table('projects')->update(['task_count[-]' => 1], ['id' => 3]);
```

Operators: `[+]`, `[-]`, `[*]`, `[/]` (numeric values only).

## Update — `update()`

```php
$stmt = table('tasks')->update(
    ['title' => 'Updated'],
    ['id' => 1]
);
$stmt->rowCount();
```

## Delete — `delete()` / `deleteById()`

```php
table('tasks')->delete(['id' => 1]);
table('tasks')->deleteById(2);
```

`deleteAll()` is an alias for `delete()`. An empty condition deletes **all** rows — use with care.

## Exists — `has()`

```php
table('tasks')->has(['id' => 1]);  // bool
table('tasks')->has(123);          // WHERE id = 123
```

## Batch reads — `chunk()`

Process large tables in primary-key order without loading everything into memory:

```php
table('tasks')->chunk(100, function (array $rows, int $page): void {
    foreach ($rows as $row) {
        // ...
    }
}, ['status' => 'open'], pkField: 'id');
```

The callback receives each batch and the 1-based page index. Iteration stops when a batch is empty.

## Index hints — `useIndex()`

MySQL index hint (no-op on other drivers):

```php
table('tasks')->useIndex('idx_status')->filter(['status' => 'open'])->all();
```

## Explain — `explain()`

Returns the database `EXPLAIN` plan for the current table + optional WHERE:

```php
$plan = table('tasks')->explain(['status' => 'open']);
```

## Raw SQL — `raw()`

Parameterized queries bypass the fluent builder:

```php
$row = table('tasks')->raw(
    'SELECT * FROM tasks WHERE id = :id',
    ['id' => 1]
);
```

One row → `object`; multiple → array. Prefer bound parameters over string concatenation.

For fragments inside WHERE arrays, use `Pionia\Porm\Core\Piql::raw()` or `Raw` objects — see [Transactions & raw SQL](/documentation/database/transactions-and-raw-sql/).

## Connection switching — `using()`

Switch the active connection on a `Porm` instance (must be called before `filter()` / `join()`):

```php
table('tasks')->using('db_pgsql')->all();
table('tasks', null, 'default')->using('analytics')->count();
```

The third argument to `table()` is equivalent to starting on that connection.

## Debugging

```php
table('tasks')->get(1);
echo table('tasks')->lastQuery();              // readable SQL (placeholders inlined)
[$sql, $map] = table('tasks')->getDatabase()->lastPrepared(); // raw prepared statement + binds
```

Next: [Filtering](/documentation/database/queries-with-filtering/) · [API reference](/documentation/database/api-reference/).

## Common mistakes

- **Calling `save()` after `filter()` on the same chain** — start a fresh `table('tasks')` for writes after a read builder.
- **Using `delete()` with an empty WHERE** — wipes every DeskFlow task; always pass explicit conditions.
- **Concatenating user input into `raw()` SQL** — bind `:id` parameters from `$data` instead.
- **Expecting `get()` to throw on missing rows** — use `getOrThrow()` when `TaskService` should return 404.

## What's next

{{< card-grid >}}
{{< link-card title="Filtering" description="orderBy, limit, and where()." href="/documentation/database/queries-with-filtering/" >}}
{{< link-card title="Pagination" description="List tasks with PaginationCore." href="/documentation/database/pagination/" >}}
{{< link-card title="API reference" description="Full Porm method list." href="/documentation/database/api-reference/" >}}
{{< /card-grid >}}
