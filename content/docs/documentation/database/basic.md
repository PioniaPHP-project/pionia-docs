---
title: "Making Queries"
slug: "making-queries"
description: "CRUD and common reads with table() and Porm."
summary: "get, all, save, update, delete, random, chunk, and raw SQL."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 812
toc: true
parent: "database"
seo:
  title: "Porm — making queries"
  description: "Retrieve, insert, update, and delete rows with Porm in Pionia v3."
  canonical: ""
  noindex: false
---

{{<callout context="tip" icon="outline/pencil">}}
Configure your database first: [Getting started](/documentation/database/configuration-getting-started/).
{{</callout>}}

All examples use the `table()` helper (`Pionia\Porm\Core\Porm`). Methods that execute SQL should be called **last** on the chain.

## Retrieving one row — `get()`

```php
table('users')->get(1);                    // WHERE id = 1
table('users')->get(1, 'user_id');         // custom PK column
table('users')->get(['user_id' => 1, 'active' => 1]);
```

Returns an `object` or `null`. Array conditions are combined with `AND`.

### `getOrThrow()`

Same as `get()` but throws `Pionia\Exceptions\NotFoundException` when no row matches:

```php
$user = table('users')->getOrThrow(42, 'User not found');
```

### `first()`

Table-level shortcut for a limited read (default one row):

```php
$row = table('posts')->first(1, ['published' => 1]);
```

On a **Builder** (after `filter()`), `first()` returns the first row of the result set.

## Retrieving many rows — `all()`

```php
$posts = table('posts')->all();
$posts = table('posts')->columns(['id', 'title'])->all();
$posts = table('posts')->all(['published' => 1]);
```

Returns an array (empty when nothing matches).

For ordering, limits, and complex WHERE clauses, use `filter()` — see [Filtering](/documentation/database/queries-with-filtering/).

## Random rows — `random()`

```php
$post = table('posts')->random();              // one object
$posts = table('posts')->random(10);           // array
$posts = table('posts')->random(5, ['active' => 1]);
```

**Strategies** (fourth argument, default `sample`):

| Strategy | Behaviour |
|----------|-----------|
| `sample` | Samples primary-key values in range (fast on large tables when unfiltered); falls back to native `ORDER BY RAND()` |
| `native` | Database `RAND()` / equivalent |

```php
table('posts')->random(10, null, 'id', 'native');
```

On joined queries use `join()->…->random()` — see [Relationships](/documentation/database/relationships/).

## Insert — `save()` / `saveAll()`

```php
$row = table('posts')->save(['title' => 'Hello', 'content' => 'World']);
$id  = table('posts')->lastSaved();
```

Pass `returnRow: false` to skip the follow-up SELECT after insert (faster when you only need `lastSaved()`):

```php
table('posts')->save(['title' => 'Hi'], returnRow: false);
```

Bulk insert:

```php
table('posts')->saveAll([
    ['title' => 'A'],
    ['title' => 'B'],
]);
```

### `saveOrUpdate()`

Insert when the primary key is missing, otherwise update. By default uses a native `UPSERT` / `ON CONFLICT` when the driver supports it:

```php
table('users')->saveOrUpdate(['id' => 1, 'name' => 'Ada']);
table('users')->saveOrUpdate(['id' => 1, 'name' => 'Ada'], nativeUpsert: false); // select-then-update fallback
```

### Increment / decrement columns

Update with SQL-side arithmetic — values are bound as parameters:

```php
table('posts')->update(['views[+]' => 1], ['id' => 42]);
table('posts')->update(['stock[-]' => 5], ['sku' => 'ABC']);
```

Operators: `[+]`, `[-]`, `[*]`, `[/]` (numeric values only).

## Update — `update()`

```php
$stmt = table('posts')->update(
    ['title' => 'Updated'],
    ['id' => 1]
);
$stmt->rowCount();
```

## Delete — `delete()` / `deleteById()`

```php
table('posts')->delete(['id' => 1]);
table('posts')->deleteById(2);
```

`deleteAll()` is an alias for `delete()`. An empty condition deletes **all** rows — use with care.

## Exists — `has()`

```php
table('posts')->has(['id' => 1]);  // bool
table('posts')->has(123);          // WHERE id = 123
```

## Batch reads — `chunk()`

Process large tables in primary-key order without loading everything into memory:

```php
table('posts')->chunk(100, function (array $rows, int $page): void {
    foreach ($rows as $row) {
        // ...
    }
}, ['published' => 1], pkField: 'id');
```

The callback receives each batch and the 1-based page index. Iteration stops when a batch is empty.

## Index hints — `useIndex()`

MySQL index hint (no-op on other drivers):

```php
table('posts')->useIndex('idx_published')->filter(['published' => 1])->all();
```

## Explain — `explain()`

Returns the database `EXPLAIN` plan for the current table + optional WHERE:

```php
$plan = table('posts')->explain(['published' => 1]);
```

## Raw SQL — `raw()`

Parameterized queries bypass the fluent builder:

```php
$row = table('posts')->raw(
    'SELECT * FROM posts WHERE id = :id',
    ['id' => 1]
);
```

One row → `object`; multiple → array. Prefer bound parameters over string concatenation.

For fragments inside WHERE arrays, use `Pionia\Porm\Core\Piql::raw()` or `Raw` objects — see [Transactions & raw SQL](/documentation/database/transactions-and-raw-sql/).

## Connection switching — `using()`

Switch the active connection on a `Porm` instance (must be called before `filter()` / `join()`):

```php
table('events')->using('db_pgsql')->all();
table('events', null, 'default')->using('analytics')->count();
```

The third argument to `table()` is equivalent to starting on that connection.

## Debugging

```php
table('users')->get(1);
echo table('users')->lastQuery();              // readable SQL (placeholders inlined)
[$sql, $map] = table('users')->getDatabase()->lastPrepared(); // raw prepared statement + binds
```

Next: [Filtering](/documentation/database/queries-with-filtering/) · [API reference](/documentation/database/api-reference/).
