---
title: "API Reference"
description: "Porm public API cheat sheet."
summary: "table(), Porm, Builder, Join, PaginationCore, and helpers."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 821
toc: true
parent: "database"
seo:
  title: "Porm API reference"
  description: "Quick reference for all Porm classes and methods."
  canonical: ""
  noindex: false
---

Namespaces live under `Pionia\Porm\`. Global helpers are defined in `src/Pionia/Utils/helpers.php`.

## Helpers

| Helper | Signature | Returns |
|--------|-----------|---------|
| `table()` | `table(?string $name, ?string $alias, null\|string\|array $using)` | `Porm` |
| `db()` | alias of `table()` | `Porm` |
| `connectionManager()` | — | `ConnectionManager` |

## `Pionia\Porm\Core\Porm`

Created via `table()`. Combines **table-level** CRUD with entry into builder modes.

### Configuration chain (non-executing)

| Method | Description |
|--------|-------------|
| `columns(string\|array)` | SELECT list; supports `col(alias)` and `[Int]` casts |
| `where(array)` | Merge WHERE (table-level) |
| `filter(?array $where)` | → `Builder` |
| `join()` | → `Join` |
| `useIndex(string)` | MySQL index hint |
| `using(null\|string\|array\|Connection)` | Switch connection for this instance |

### Table-level execution

| Method | Returns | Notes |
|--------|---------|-------|
| `get(int\|array\|string, ?string $idField)` | `?object` | PK or WHERE |
| `getOrThrow(...)` | `object` | throws `NotFoundException` |
| `first(?int, ?array, string $pk)` | `object\|array\|null` | |
| `all(?array $where)` | `array` | |
| `has(int\|string\|array, ?string $pk)` | `bool` | |
| `save(array, bool $returnRow = true)` | `object` | |
| `saveAll(array, ?bool $returning)` | `array\|PDOStatement\|null` | |
| `saveOrUpdate(array, string $pk, bool $nativeUpsert = true)` | `object\|array` | native upsert when PK present |
| `update(array $data, array $where)` | `PDOStatement` | |
| `delete(array $where)` | `PDOStatement` | |
| `deleteById(int\|string)` | `PDOStatement` | |
| `deleteAll(array)` | alias of `delete` | |
| `random(?int, ?array, string $pk, string $strategy)` | `object\|array` | `sample` \| `native` |
| `chunk(int, callable, ?array, string $pk)` | `void` | |
| `explain(?array $where)` | `array` | EXPLAIN plan |
| `count(?string $col, ?array $where)` | `?int` | |
| `sum(string $col, ?array $where)` | `?string` | |
| `avg(string $col, ?array $where)` | `?string` | |
| `max(string $col, ?array $where)` | `?string` | |
| `min(string $col, ?array $where)` | `?string` | |
| `raw(string $sql, ?array $params)` | `object\|array` | |
| `inTransaction(callable)` | `void` | |
| `lastQuery()` | `?string` | readable SQL (inlined) |
| `getDatabase()->lastPrepared()` | `?array` | `[statement, map]` with placeholders |
| `lastSaved()` | `?string` | insert ID |
| `info()` | `array` | connection meta |
| `getDatabase()` | `Piql` | low-level |

## `Pionia\Porm\Database\Builders\Builder`

Returned by `filter()`.

| Method | Description |
|--------|-------------|
| `where(col, value)` / `where(col, op, value)` / `where(array)` | Fluent or array conditions (AND) |
| `orWhere(...)` | OR group with prior conditions |
| `whereEquals`, `whereIs`, `whereNotEqual` | Equality helpers |
| `whereStartsWith`, `whereEndsWith`, `whereIncludes`, `whereNotIncludes` | LIKE helpers |
| `whereGreaterThan`, `whereLessThan`, … | Comparison helpers |
| `whereIn`, `whereNotIn`, `whereNull`, `whereNotNull`, `whereBetween` | Common filters |
| `orderBy(string\|array)` | ORDER BY |
| `group(string\|array)` | GROUP BY |
| `having(array)` | HAVING |
| `limit(int)` | LIMIT |
| `startAt(int)` | OFFSET (requires `limit`) |
| `match($columns, $keyword, $mode)` | FULLTEXT |
| `get(array\|int)` | Single row |
| `first()` | First row |
| `all()` | All rows |
| `count(?string, ?array)` | COUNT |
| `sum`, `avg`, `max`, `min` | Aggregates |

## `Pionia\Porm\Database\Builders\Join`

Returned by `join()`.

| Method | Description |
|--------|-------------|
| `inner` / `innerJoin($table, $on, $alias?)` | INNER JOIN |
| `left` / `leftJoin($table, $on, $alias?)` | LEFT JOIN |
| `right` / `rightJoin($table, $on, $alias?)` | RIGHT JOIN |
| `full` / `fullJoin($table, $on, $alias?)` | FULL JOIN |
| `filter(?array)` | Merge array WHERE (sugar) |
| `where(...)` | Fluent / array WHERE |
| `get()`, `first()` | Single joined row |
| `all()` | Rows |
| `count(?string, ?array)` | COUNT with joins |
| `random(?int, ?array)` | Random joined rows |
| `orderBy`, `group`, `having`, `limit`, `startAt` | From `FilterTrait` |
| `getJoins()` | Medoo-style join array (debug) |

ON helpers: `Pionia\Porm\Database\Builders\JoinOn` — `map()`, `maps()`, `using()`, `expression()`, `columns()`.

Full guide: [Relationships & joins](/documentation/database/relationships/).

## `Pionia\Porm\Database\Builders\JoinLoader`

| Method | Description |
|--------|-------------|
| `eager($parents, $parentFk, $relatedTable, $relatedPk = 'id', $attachAs = 'related', $connection = null)` | Attach related rows in one `WHERE IN` query |

## `Pionia\Porm\Database\Builders\Where`

`Where::builder()->and()->or()->build()` — nested AND/OR. See [WHERE DSL](/documentation/database/where-dsl/).

## `Pionia\Porm\Database\Aggregation\Agg`

`Agg::builder()->…->build()` — expressions for WHERE/HAVING (like, between, compare, etc.). See [Aggregation](/documentation/database/using-functions-aggregation/).

## `Pionia\Porm\PaginationCore`

| Method | Description |
|--------|-------------|
| `__construct(?array $req, string $table, ?int $limit, ?int $offset, ?string $db, ?string $alias)` | |
| `columns(string\|array)` | SELECT list |
| `where(array)` | Base WHERE |
| `init(callable)` | Customize Builder/Join |
| `paginate(?array $where, ?array $joins)` | Page payload |
| `paginateApproximate(?array $where, int $countCacheTtl = 60)` | Cached total count; sets `approximate_count` |

## `Pionia\Porm\ConnectionManager`

| Method | Description |
|--------|-------------|
| `connection(null\|string\|array $name)` | Pooled `Connection` |
| `register(string, Connection)` | Inject connection |
| `disconnect(?string)` | Clear pool |
| `has(string)` | Pool contains name |

## `Pionia\Porm\Driver\Connection`

| Method | Description |
|--------|-------------|
| `Connection::connect($name)` | Via manager |
| `Connection::open(array $config)` | Standalone instance |

## `Pionia\Porm\Core\Piql`

Low-level SQL engine (Medoo-compatible). Access via `$porm->getDatabase()`. Key methods: `Piql::raw(string, array)`, `upsert()`, `lastPrepared()`.

## Exceptions

| Class | When |
|-------|------|
| `Pionia\Porm\Exceptions\BaseDatabaseException` | Query errors |
| `Pionia\Exceptions\DatabaseException` | Wrapper / domain |
| `Pionia\Exceptions\NotFoundException` | `getOrThrow()` |
| `Pionia\Exceptions\ValidationException` | HTTP 422 — missing/invalid fields in GenericService |

## Source layout (framework)

| Path | Role |
|------|------|
| `src/Pionia/Porm/Core/Porm.php` | Facade |
| `src/Pionia/Porm/Core/Piql.php` | SQL engine |
| `src/Pionia/Porm/Database/Utils/TableLevelQueryTrait.php` | CRUD traits |
| `src/Pionia/Porm/Database/Aggregation/AggregateTrait.php` | Aggregates |
| `src/Pionia/Porm/Database/Utils/FilterTrait.php` | ORDER/LIMIT |
| `src/Pionia/Porm/PaginationCore.php` | Pagination |
| `src/Pionia/Porm/ConnectionManager.php` | Pooling |

Prose guides: [Database index](/documentation/database/).
