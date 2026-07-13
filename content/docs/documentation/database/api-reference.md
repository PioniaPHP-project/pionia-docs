---
title: "API Reference"
description: "Porm public API cheat sheet."
summary: "table(), Porm, Builder, Join, PaginationCore, and helpers."
date: 2026-03-01
lastmod: 2026-07-13
draft: false
weight: 821
toc: true
doc_type: reference
parent: "database"
seo:
  title: "Porm API reference"
  description: "Quick reference for all Porm classes and methods."
  canonical: ""
  noindex: false
---

This reference lists every public Porm method **DeskFlow** services use when querying `tasks`, `projects`, and `team_members`. Keep it open while implementing **Northwind Studio** actions on port **8000** — prose guides explain *why*; this page is the *what*.

## What you will learn

- Locate helpers, `Porm`, Builder, Join, and `PaginationCore` methods quickly
- See which chain methods are terminal vs composable
- Find related source files under `src/Pionia/Porm/`

{{< prerequisites >}}
- [Database index](/documentation/database/) — guide map and query modes
- [Making queries](/documentation/database/making-queries/) — CRUD walkthrough with examples
{{< /prerequisites >}}

## How it works

```text
table()  →  Porm  →  filter() → Builder  |  join() → Join  |  direct CRUD
                         ↓                      ↓
                    PaginationCore         JoinLoader / Agg / Where
```

Namespaces live under `Pionia\Porm\`. Global helpers are defined in `src/Pionia/Utils/helpers.php`.

## Helpers

### `table(string $name, ?string $alias = null, ?string $using = null)`

Returns a `Porm` instance bound to the named table. This is the primary entry point for DeskFlow queries against `tasks`, `projects`, and `team_members` on the default connection. Pass an alias when you plan to join (for example `table('tasks', 't')`). Pass `$using` to target a named connection from `settings.ini`.

```php
$task = table('tasks')->get(42);
$project = table('projects', 'p')->columns(['p.id', 'p.name'])->get(1);
```

### `db(string $name, ?string $alias = null, ?string $using = null)`

Alias of `table()`. Use whichever reads better in a Northwind Studio service — both resolve to the same `Porm` chain starting at `http://127.0.0.1:8000` API handlers.

```php
$members = db('team_members')
    ->filter(['project_id' => 1])
    ->all();
```

### `connectionManager()`

Returns the process-scoped `ConnectionManager` that pools PDO handles for FPM and RoadRunner workers. Use it when a DeskFlow action needs to inspect or register connections outside a single `table()` chain.

```php
$pdo = connectionManager()->connection('default')->getPdo();
connectionManager()->disconnect(); // worker shutdown only
```

## `Pionia\Porm\Core\Porm`

Created via `table()`. Combines **table-level** CRUD with entry into builder modes.

### Configuration chain (non-executing)

### `columns(string|array $columns = '*')`

Sets the SELECT list before any terminal method runs. Supports column aliases (`title(task_title)`) and type casts (`priority[Int]`). Call early — after `filter()` or `join()` it is locked.

```php
$task = table('tasks')
    ->columns(['id', 'title', 'status'])
    ->get(['status' => 'open']);
```

### `where(array|string $column, mixed $operatorOrValue = null, mixed $value = null)`

Merges Medoo-style array conditions or fluent `where(column, operator, value)` clauses at the table level before `filter()` or a terminal read. Conditions accumulate with AND semantics.

```php
$open = table('tasks')
    ->where('status', 'open')
    ->where('project_id', 1)
    ->all();

$byArray = table('tasks')->where(['project_id' => 1])->get();
```

### `filter(?array $where = [])`

Enters **Builder** mode for fluent chaining (`orderBy`, `limit`, symbolic operators). Optional initial `$where` is merged before the builder is returned. Terminal methods on the builder execute SQL.

```php
$rows = table('tasks')
    ->filter(['status' => 'open'])
    ->orderBy('priority')
    ->limit(20)
    ->all();
```

### `join(?array $where = null)`

Enters **Join** mode for multi-table reads. Optional `$where` is merged first. Returns a `Join` instance — use `inner()`, `left()`, and friends before calling `all()` or `get()`.

```php
$rows = table('tasks', 't')
    ->columns(['t.title', 'p.name(project)'])
    ->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->where('t.status', 'open')
    ->all();
```

### `useIndex(string $index)`

Hints MySQL to use a named index for the next query on this chain. No-op on SQLite and PostgreSQL. Helpful when EXPLAIN shows a full scan on `tasks.status`.

```php
$rows = table('tasks')
    ->useIndex('idx_tasks_status')
    ->where('status', 'open')
    ->all();
```

### `using(null|string|array|Connection $connection = 'default')`

Switches the active connection for this `Porm` instance. Accepts a connection name, inline config array, or a `Connection` object. Must be called before `filter()` or `join()`.

```php
$archive = table('tasks')
    ->using('reporting')
    ->where('status', 'archived')
    ->count();
```

### Table-level execution

### `get(int|array|string|null $where = null, ?string $idField = 'id')`

Fetches a single row. Pass a primary-key scalar, a Medoo-style array, or `null` to fetch the latest row by `$idField` descending. Returns `null` when no row matches.

```php
$task = table('tasks')->get(7);
$bySlug = table('projects')->get(['slug' => 'deskflow-alpha']);
$latest = table('tasks')->get(); // newest task by id
```

### `getOrThrow(int|array|string|null $where = null, string $message = 'Item not found', ?string $idField = 'id')`

Same as `get()` but throws `NotFoundException` when the row is missing. Use in Northwind Studio actions that must return HTTP 404 for unknown task IDs.

```php
$task = table('tasks')->getOrThrow(99, 'Task not found');
```

### `first(?int $size = 1, ?array $where = [], string $pkField = 'id')`

Returns the most recent row(s) ordered by `$pkField` DESC. With `$size > 1`, returns an array of rows. Useful for “latest open task” widgets on port 8000.

```php
$latest = table('tasks')->first(1, ['status' => 'open']);
$recentFive = table('tasks')->first(5, ['project_id' => 1]);
```

### `all(?callable $callback = null)`

Returns every row matching accumulated conditions. Optional callback runs per row without building a full in-memory array first.

```php
$tasks = table('tasks')->where('project_id', 1)->all();

table('tasks')->where('status', 'open')->all(function ($row) {
    logger()->info('open task', ['id' => $row->id]);
});
```

### `has(int|array|string|null $where, ?string $pkField = 'id')`

Returns `true` when at least one row matches. Accepts a scalar PK or a condition array. Throws when no conditions are provided.

```php
$exists = table('tasks')->has(['id' => 42, 'status' => 'open']);
$memberExists = table('team_members')->has('alex@northwind.studio', 'email');
```

### `save(array $data, bool $returnRow = true)`

Inserts one row and returns the saved object (by default re-fetches via `get()`). Set `$returnRow = false` to skip the extra SELECT.

```php
$task = table('tasks')->save([
    'project_id' => 1,
    'title' => 'Wireframe review',
    'status' => 'open',
]);
```

### `saveAll(array $data, ?bool $returning = true)`

Inserts multiple rows inside a transaction. When `$returning` is true, returns an array of saved objects; when false, returns the raw `PDOStatement`.

```php
$created = table('team_members')->saveAll([
    ['project_id' => 1, 'email' => 'alex@northwind.studio', 'name' => 'Alex Chen'],
    ['project_id' => 1, 'email' => 'sam@northwind.studio', 'name' => 'Sam Park'],
]);
```

### `saveOrUpdate(array|Arrayable $data, string $pkField = 'id', bool $nativeUpsert = true)`

Inserts when the PK is absent or unknown; updates when the row exists. Uses native `UPSERT` when the driver supports it and the PK is present in `$data`.

```php
$task = table('tasks')->saveOrUpdate([
    'id' => 7,
    'status' => 'done',
    'completed_at' => date('Y-m-d H:i:s'),
]);
```

### `update(array $data, array|int|string $where, ?string $idField = 'id')`

Updates rows matching `$where`. Scalar `$where` is treated as a primary-key lookup.

```php
table('tasks')->update(
    ['status' => 'in_progress'],
    ['project_id' => 1, 'status' => 'open']
);

table('tasks')->update(['assignee' => 'alex@northwind.studio'], 42);
```

### `delete(array|int|string $where, ?string $idField = 'id')`

Deletes rows matching `$where`. Scalar `$where` deletes by primary key.

```php
table('tasks')->delete(['status' => 'draft', 'project_id' => 99]);
table('tasks')->delete(42);
```

### `deleteById(string|int $id, ?string $idField = 'id')`

Explicit alias for deleting a single row by primary key. Reads clearer than `delete($id)` in DeskFlow maintenance actions.

```php
table('tasks')->deleteById(42);
```

### `deleteAll(array $where)`

Alias of `delete()` with an array WHERE clause. Deletes every matching row in one statement.

```php
table('tasks')->deleteAll(['project_id' => 99, 'status' => 'draft']);
```

### `random(?int $limit = 1, ?array $where = null, ?string $pkField = 'id', string $strategy = 'sample')`

Fetches random row(s). Default `sample` strategy picks random PK values in range; pass `native` to use `ORDER BY RAND()`.

```php
$spotlight = table('tasks')->random(1, ['status' => 'open']);
$five = table('team_members')->random(5, ['project_id' => 1], 'id', 'native');
```

### `chunk(int $size, callable $callback, ?array $where = null, string $pkField = 'id')`

Processes result sets in pages without loading the full table. Each callback receives up to `$size` rows. Must be called before `filter()`.

```php
table('tasks')->chunk(100, function (array $rows) {
    foreach ($rows as $task) {
        logger()->debug('task', ['id' => $task->id]);
    }
}, ['status' => 'open']);
```

### `explain(?array $where = null)`

Returns the database `EXPLAIN` plan for the current table, columns, and WHERE. Use when a DeskFlow list endpoint on port 8000 is slow.

```php
$plan = table('tasks')->explain(['status' => 'open', 'project_id' => 1]);
```

### `count(?string $column = null, ?array $where = null)`

Returns `COUNT(*)` or `COUNT(column)` for matching rows. Merges optional `$where` before counting.

```php
$openCount = table('tasks')->count('*', ['status' => 'open']);
$perProject = table('tasks')->count('id', ['project_id' => 1]);
```

### `sum(string $column, ?array $where = null)`

Returns the numeric sum of `$column` as a string (driver-dependent formatting). Merge `$where` to scope aggregates.

```php
$totalEstimate = table('tasks')->sum('estimate_hours', ['project_id' => 1]);
```

### `avg(string $column, ?array $where = null)`

Returns the average of `$column` for matching rows.

```php
$avgPriority = table('tasks')->avg('priority', ['status' => 'open']);
```

### `max(string $column, ?array $where = null)`

Returns the maximum value of `$column`.

```php
$latestSort = table('tasks')->max('sort_order', ['project_id' => 1]);
```

### `min(string $column, ?array $where = null)`

Returns the minimum value of `$column`.

```php
$earliest = table('tasks')->min('created_at', ['project_id' => 1]);
```

### `raw(string $query, ?array $params = [], ?string $using = 'db')`

Executes a parameterized SQL string and returns one object (single row) or an array of rows. Prefer `table()` chains for routine DeskFlow CRUD; reserve `raw()` for reporting queries.

```php
$stats = table('tasks')->raw(
    'SELECT status, COUNT(*) AS cnt FROM tasks WHERE project_id = :pid GROUP BY status',
    ['pid' => 1]
);
```

### `inTransaction(callable $callback)`

Wraps `$callback` in a database transaction. Assign results from inside the closure with `use (&$var)` to read them after commit.

```php
$row = null;
table('tasks')->inTransaction(function ($porm) use (&$row) {
    $row = $porm->save(['project_id' => 1, 'title' => 'Deploy', 'status' => 'open']);
    table('projects')->update(['updated_at' => date('Y-m-d H:i:s')], 1);
});
```

### `lastQuery()`

Returns the most recently executed SQL with inlined parameters (human-readable). Useful while debugging Moonlight actions against port 8000.

```php
table('tasks')->where('status', 'open')->all();
$sql = table('tasks')->lastQuery();
```

### `getDatabase()`

Returns the underlying `Piql` engine for advanced SQL. Chain `lastPrepared()` on the result for placeholder maps.

```php
$piql = table('tasks')->getDatabase();
$prepared = $piql->lastPrepared(); // ['statement' => '...', 'map' => [...]]
```

### `lastSaved()`

Returns the auto-increment ID from the last `insert` on this connection.

```php
table('tasks')->save(['project_id' => 1, 'title' => 'New', 'status' => 'open']);
$newId = table('tasks')->lastSaved();
```

### `info()`

Returns metadata about the active connection (driver type, server version, etc.).

```php
$meta = table('tasks')->info();
```

## `Pionia\Porm\Database\Builders\Builder`

Returned by `filter()`. Supports fluent WHERE, ordering, limits, and aggregates.

### `where(array|string $column, mixed $operatorOrValue = null, mixed $value = null)`

Adds AND conditions. Pass a Medoo array or fluent `(column, value)` / `(column, operator, value)` forms.

```php
table('tasks')->filter()
    ->where('status', 'open')
    ->where('priority', '>', 2)
    ->all();
```

### `orWhere(array|string $column, mixed $operatorOrValue = null, mixed $value = null)`

Adds OR conditions relative to prior clauses. Use for alternate assignee matches on a task board.

```php
table('tasks')->filter()
    ->where('assignee', 'alex@northwind.studio')
    ->orWhere('assignee', 'sam@northwind.studio')
    ->all();
```

### `whereEquals(string $column, mixed $value)`

Shorthand for `where($column, $value)`.

```php
table('tasks')->filter()->whereEquals('status', 'open')->count();
```

### `whereIs(string $column, mixed $value)`

Explicit equality with the `is` operator alias.

```php
table('team_members')->filter()->whereIs('email', 'alex@northwind.studio')->first();
```

### `whereNotEqual(string $column, mixed $value)`

`column != value`.

```php
table('tasks')->filter()->whereNotEqual('status', 'archived')->all();
```

### `whereStartsWith(string $column, string $value)`

`LIKE 'value%'`.

```php
table('tasks')->filter()->whereStartsWith('title', 'Desk')->all();
```

### `whereEndsWith(string $column, string $value)`

`LIKE '%value'`.

```php
table('team_members')->filter()->whereEndsWith('email', '.studio')->all();
```

### `whereIncludes(string $column, string $value)`

`LIKE '%value%'` (contains).

```php
table('tasks')->filter()->whereIncludes('title', 'wireframe')->all();
```

### `whereNotIncludes(string $column, string $value)`

`NOT LIKE '%value%'`.

```php
table('tasks')->filter()->whereNotIncludes('title', 'draft')->all();
```

### `whereGreaterThan(string $column, mixed $value)`

`column > value`.

```php
table('tasks')->filter()->whereGreaterThan('priority', 2)->all();
```

### `whereGreaterThanOrEqual(string $column, mixed $value)`

`column >= value`.

```php
table('tasks')->filter()->whereGreaterThanOrEqual('sort_order', 10)->all();
```

### `whereLessThan(string $column, mixed $value)`

`column < value`.

```php
table('tasks')->filter()->whereLessThan('estimate_hours', 8)->all();
```

### `whereLessThanOrEqual(string $column, mixed $value)`

`column <= value`.

```php
table('tasks')->filter()->whereLessThanOrEqual('priority', 3)->all();
```

### `whereIn(string $column, array $values)`

`column IN (...)`.

```php
table('tasks')->filter()->whereIn('status', ['open', 'in_progress'])->all();
```

### `whereNotIn(string $column, array $values)`

`column NOT IN (...)`.

```php
table('tasks')->filter()->whereNotIn('project_id', [98, 99])->all();
```

### `whereNull(string $column)`

`column IS NULL`.

```php
table('tasks')->filter()->whereNull('completed_at')->all();
```

### `whereNotNull(string $column)`

`column IS NOT NULL`.

```php
table('tasks')->filter()->whereNotNull('assignee')->all();
```

### `whereBetween(string $column, mixed $min, mixed $max)`

`column BETWEEN min AND max`.

```php
table('tasks')->filter()->whereBetween('priority', 1, 3)->all();
```

### `whereNotBetween(string $column, mixed $min, mixed $max)`

`column NOT BETWEEN min AND max`.

```php
table('tasks')->filter()->whereNotBetween('sort_order', 0, 5)->all();
```

### `orderBy(string|array $value)`

Sets `ORDER BY`. Pass a column name (defaults ASC) or an associative array of column => direction.

```php
table('tasks')->filter()
    ->where('project_id', 1)
    ->orderBy(['priority' => 'DESC', 'sort_order' => 'ASC'])
    ->all();
```

### `group(string|array $group)`

Sets `GROUP BY` columns.

```php
table('tasks')->filter()
    ->columns(['status', 'count' => 'COUNT(*)'])
    ->group('status')
    ->all();
```

### `having(string $column, mixed $value, ?string $needle = null)`

Adds a `HAVING` clause. Append `$needle` (`>`, `<`, `!`, `>=`, `<=`) for comparisons.

```php
table('tasks')->filter()
    ->columns(['project_id', 'total' => 'COUNT(*)'])
    ->group('project_id')
    ->having('total', 5, '>')
    ->all();
```

### `limit(int $limit)`

Sets `LIMIT`. Required before `startAt()`.

```php
table('tasks')->filter()->where('status', 'open')->limit(25)->all();
```

### `startAt(int $startPoint = 0)`

Sets `OFFSET`. Must follow `limit()`.

```php
table('tasks')->filter()
    ->where('project_id', 1)
    ->orderBy('id')
    ->limit(25)
    ->startAt(50)
    ->all();
```

### `match($columns, $keyword, $mode = 'natural')`

Adds a `MATCH ... AGAINST` full-text condition (MySQL). `$mode` can be `natural` or `boolean`.

```php
table('tasks')->filter()
    ->match(['title', 'description'], 'wireframe', 'boolean')
    ->all();
```

### `get(array|int|null $where = null)`

Executes and returns a single row object. Optional `$where` merges before execution; integer offset uses `LIMIT`.

```php
$row = table('tasks')->filter()->where('status', 'open')->get();
```

### `first()`

Returns the first row of the result set (`get(0)`).

```php
$next = table('tasks')->filter()
    ->where('status', 'open')
    ->orderBy('sort_order')
    ->first();
```

### `all(?callable $callback = null)`

Executes and returns all matching rows.

```php
$board = table('tasks')->filter()
    ->where('project_id', 1)
    ->orderBy('sort_order')
    ->all();
```

### `count(?string $column = null, ?array $where = null)`

Returns the row count for the built query.

```php
$open = table('tasks')->filter()->where('status', 'open')->count();
```

### `sum(string $column, ?array $where = null)`

Aggregate sum on the filtered set.

```php
$hours = table('tasks')->filter()->where('project_id', 1)->sum('estimate_hours');
```

### `avg(string $column, ?array $where = null)`

Aggregate average on the filtered set.

```php
$avg = table('tasks')->filter()->where('status', 'done')->avg('estimate_hours');
```

### `max(string $column, ?array $where = null)`

Aggregate maximum on the filtered set.

```php
$peak = table('tasks')->filter()->where('project_id', 1)->max('priority');
```

### `min(string $column, ?array $where = null)`

Aggregate minimum on the filtered set.

```php
$lowest = table('tasks')->filter()->where('project_id', 1)->min('sort_order');
```

## `Pionia\Porm\Database\Builders\Join`

Returned by `join()`. Combines `JoinParseTrait`, `FilterTrait`, and `FluentWhereTrait`.

### `inner($table, string|array $on_or_using, ?string $alias = null)`

Adds an `INNER JOIN`. `$on_or_using` is a Medoo map or `JoinOn` helper.

```php
table('tasks', 't')->join()
    ->inner('projects', ['t.project_id' => 'id'], 'p')
    ->all();
```

### `innerJoin($table, string|array $on_or_using, ?string $alias = null)`

Alias of `inner()`.

```php
table('tasks', 't')->join()
    ->innerJoin('team_members', ['t.assignee' => 'email'], 'm')
    ->all();
```

### `left($table, string|array $on_or_using, ?string $alias = null)`

Adds a `LEFT JOIN`. Unmatched base rows still appear with `NULL` joined columns.

```php
table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->where('t.status', 'open')
    ->all();
```

### `leftJoin($table, string|array $on_or_using, ?string $alias = null)`

Alias of `left()`.

```php
table('projects', 'p')->join()
    ->leftJoin('tasks', ['p.id' => 'project_id'], 't')
    ->all();
```

### `right($table, string|array $on_or_using, ?string $alias = null)`

Adds a `RIGHT JOIN`.

```php
table('team_members', 'm')->join()
    ->right('projects', ['m.project_id' => 'id'], 'p')
    ->all();
```

### `rightJoin($table, string|array $on_or_using, ?string $alias = null)`

Alias of `right()`.

```php
table('tasks', 't')->join()
    ->rightJoin('projects', ['t.project_id' => 'id'], 'p')
    ->all();
```

### `full($table, string|array $on_or_using, ?string $alias = null)`

Adds a `FULL OUTER JOIN` where the driver supports it.

```php
table('tasks', 't')->join()
    ->full('projects', ['t.project_id' => 'id'], 'p')
    ->all();
```

### `fullJoin($table, string|array $on_or_using, ?string $alias = null)`

Alias of `full()`.

```php
table('tasks', 't')->join()
    ->fullJoin('projects', ['t.project_id' => 'id'], 'p')
    ->all();
```

### `filter(?array $where = null)`

Merges a Medoo-style WHERE array after joins are declared. Sugar for readability when chaining.

```php
table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->filter(['t.status' => 'open'])
    ->all();
```

### `where(array|string $column, mixed $operatorOrValue = null, mixed $value = null)`

Fluent or array WHERE on joined queries. Same signatures as Builder `where()`. Join also exposes every Builder `where*` helper (`orWhere`, `whereIn`, `whereNull`, and the rest) via the same trait.

```php
table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->where('p.client', 'Northwind')
    ->where('t.status', 'open')
    ->all();
```

### `get(array|int|null $where = null)`

Fetches one joined row.

```php
$row = table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->where('t.id', 1)
    ->get();
```

### `first()`

First row of the joined result set.

```php
$row = table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->orderBy('t.id')
    ->first();
```

### `all(?callable $callback = null)`

All joined rows.

```php
$rows = table('tasks', 't')->join()
    ->inner('projects', ['t.project_id' => 'id'], 'p')
    ->where('p.slug', 'deskflow-alpha')
    ->all();
```

### `count(?string $column = '*', ?array $where = null)`

Counts joined rows (respects JOIN type and WHERE).

```php
$n = table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->where('t.status', 'open')
    ->count();
```

### `random(?int $limit = 1, ?array $where = null)`

Random joined row(s) via native `ORDER BY RAND()`.

```php
$pick = table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->random(1, ['t.status' => 'open']);
```

### `orderBy(string|array $value)`

Order joined results.

```php
table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->orderBy(['t.priority' => 'DESC'])
    ->all();
```

### `group(string|array $group)`

`GROUP BY` on joined queries.

```php
table('tasks', 't')->join()
    ->inner('projects', ['t.project_id' => 'id'], 'p')
    ->columns(['p.name', 'total' => 'COUNT(*)'])
    ->group('p.id')
    ->all();
```

### `having(string $column, mixed $value, ?string $needle = null)`

`HAVING` on grouped join queries.

```php
table('tasks', 't')->join()
    ->inner('projects', ['t.project_id' => 'id'], 'p')
    ->columns(['p.name', 'cnt' => 'COUNT(*)'])
    ->group('p.id')
    ->having('cnt', 3, '>')
    ->all();
```

### `limit(int $limit)`

`LIMIT` on joined queries.

```php
table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->limit(10)
    ->all();
```

### `startAt(int $startPoint = 0)`

`OFFSET` on joined queries (requires prior `limit()`).

```php
table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p')
    ->limit(20)
    ->startAt(40)
    ->all();
```

### `getJoins()`

Returns the internal Medoo-style join array for debugging.

```php
$join = table('tasks', 't')->join()
    ->left('projects', ['t.project_id' => 'id'], 'p');
$debug = $join->getJoins();
```

### Join ON helpers (`Pionia\Porm\Database\Builders\JoinOn`)

Full guide: [Relationships & joins](/documentation/database/relationships/).

### `JoinOn::map(string $baseColumn, string $joinedColumn)`

Single equality ON pair: `base.{baseColumn} = joined.{joinedColumn}`.

```php
table('tasks', 't')->join()
    ->left('projects', JoinOn::map('project_id', 'id'), 'p')
    ->all();
```

### `JoinOn::maps(array $pairs)`

Multiple AND equalities.

```php
table('tasks', 't')->join()
    ->inner('team_members', JoinOn::maps(['assignee' => 'email', 'project_id' => 'project_id']), 'm')
    ->all();
```

### `JoinOn::using(string|array $columns)`

`USING (column)` form for one or more shared column names.

```php
table('tasks')->join()
    ->inner('archived_tasks', JoinOn::using('id'))
    ->all();
```

### `JoinOn::expression(string $sql)`

Raw SQL ON fragment.

```php
table('tasks', 't')->join()
    ->left('projects', JoinOn::expression('t.project_id = p.id AND p.client = \'Northwind\''), 'p')
    ->all();
```

### `JoinOn::columns(string $left, string $right)`

Shorthand equality expression string (`left = right`).

```php
table('tasks', 't')->join()
    ->inner('projects', JoinOn::columns('t.project_id', 'p.id'), 'p')
    ->all();
```

## `Pionia\Porm\Database\Builders\JoinLoader`

### `eager(array $parents, string $parentFk, string $relatedTable, string $relatedPk = 'id', string $attachAs = 'related', null|string|array $connection = null)`

Attaches related rows to each parent in one extra `WHERE IN` query — avoids N+1 when looping tasks and loading projects.

```php
$tasks = table('tasks')->where('project_id', 1)->all();
$tasks = JoinLoader::eager($tasks, 'project_id', 'projects', 'id', 'project');
// each $task->project is the matching projects row
```

## `Pionia\Porm\Database\Builders\Where`

Build nested AND/OR arrays for `filter()->where($clause)`. See [WHERE DSL](/documentation/database/where-dsl/).

### `Where::builder()`

Static factory from `ContractBuilder`. Starts an empty WHERE tree.

```php
$clause = Where::builder()
    ->where('status', 'open')
    ->build();
```

### `and(array $clauses)`

Wraps `$clauses` in an AND group with a unique internal key (safe for nested trees).

```php
$clause = Where::builder()
    ->and(['project_id' => 1, 'status' => 'open'])
    ->build();
```

### `or(array $clauses)`

Wraps `$clauses` in an OR group.

```php
$clause = Where::builder()
    ->or(['assignee' => 'alex@northwind.studio', 'assignee' => 'sam@northwind.studio'])
    ->build();
```

### `build()`

Returns the finished Medoo-style WHERE array. Pass to `filter()->where($clause)` or table-level `where($clause)`.

```php
$clause = Where::builder()->where('status', 'open')->build();
$tasks = table('tasks')->filter()->where($clause)->all();
```

### `where(array|string $column, mixed $operatorOrValue = null, mixed $value = null)`

Adds fluent or array conditions inside the WHERE builder (same operators as Builder).

```php
$clause = Where::builder()
    ->where('priority', '>', 2)
    ->where(['status' => 'open'])
    ->build();
```

### `orWhere(array|string $column, mixed $operatorOrValue = null, mixed $value = null)`

Adds OR branches inside the WHERE builder.

```php
$clause = Where::builder()
    ->where('project_id', 1)
    ->orWhere('project_id', 2)
    ->build();
```

### `whereEquals(string $column, mixed $value)`

Equality helper inside `Where::builder()`.

```php
$clause = Where::builder()->whereEquals('status', 'open')->build();
```

### `whereIs(string $column, mixed $value)`

`is` operator helper.

```php
$clause = Where::builder()->whereIs('status', 'open')->build();
```

### `whereNotEqual(string $column, mixed $value)`

Inequality helper.

```php
$clause = Where::builder()->whereNotEqual('status', 'done')->build();
```

### `whereStartsWith(string $column, string $value)`

Prefix `LIKE` helper.

```php
$clause = Where::builder()->whereStartsWith('title', 'Desk')->build();
```

### `whereEndsWith(string $column, string $value)`

Suffix `LIKE` helper.

```php
$clause = Where::builder()->whereEndsWith('email', '.studio')->build();
```

### `whereIncludes(string $column, string $value)`

Contains `LIKE` helper.

```php
$clause = Where::builder()->whereIncludes('title', 'Flow')->build();
```

### `whereNotIncludes(string $column, string $value)`

Negative contains helper.

```php
$clause = Where::builder()->whereNotIncludes('title', 'draft')->build();
```

### `whereGreaterThan(string $column, mixed $value)`

`>` helper.

```php
$clause = Where::builder()->whereGreaterThan('priority', 2)->build();
```

### `whereGreaterThanOrEqual(string $column, mixed $value)`

`>=` helper.

```php
$clause = Where::builder()->whereGreaterThanOrEqual('sort_order', 5)->build();
```

### `whereLessThan(string $column, mixed $value)`

`<` helper.

```php
$clause = Where::builder()->whereLessThan('estimate_hours', 4)->build();
```

### `whereLessThanOrEqual(string $column, mixed $value)`

`<=` helper.

```php
$clause = Where::builder()->whereLessThanOrEqual('priority', 3)->build();
```

### `whereIn(string $column, array $values)`

`IN` helper.

```php
$clause = Where::builder()->whereIn('status', ['open', 'in_progress'])->build();
```

### `whereNotIn(string $column, array $values)`

`NOT IN` helper.

```php
$clause = Where::builder()->whereNotIn('project_id', [98, 99])->build();
```

### `whereNull(string $column)`

`IS NULL` helper.

```php
$clause = Where::builder()->whereNull('completed_at')->build();
```

### `whereNotNull(string $column)`

`IS NOT NULL` helper.

```php
$clause = Where::builder()->whereNotNull('assignee')->build();
```

### `whereBetween(string $column, mixed $min, mixed $max)`

`BETWEEN` helper.

```php
$clause = Where::builder()->whereBetween('priority', 1, 3)->build();
```

### `whereNotBetween(string $column, mixed $min, mixed $max)`

`NOT BETWEEN` helper.

```php
$clause = Where::builder()->whereNotBetween('sort_order', 0, 2)->build();
```

## `Pionia\Porm\Database\Aggregation\Agg`

Expression builder for WHERE, HAVING, and column lists. See [Aggregation](/documentation/database/using-functions-aggregation/).

### `Agg::builder()`

Starts an empty aggregate / expression map.

```php
$expr = Agg::builder()->gt('priority', 2)->build();
```

### `build()`

Returns the Medoo-style expression array.

```php
table('tasks')->filter()->where(Agg::builder()->eq('status', 'open')->build())->all();
```

### `random(string $columnName)`

Select `RAND()` aliased as `$columnName`.

```php
table('tasks')->columns(Agg::builder()->random('pick')->build())->limit(1)->all();
```

### `sum(string $columnName, string $column)`

`SUM(column)` with result alias.

```php
table('tasks')->columns(Agg::builder()->sum('total_hours', 'estimate_hours')->build())
    ->where('project_id', 1)->get();
```

### `avg(string $columnName, string $column)`

`AVG(column)` with alias.

```php
table('tasks')->columns(Agg::builder()->avg('avg_pri', 'priority')->build())->get();
```

### `max(string $columnName, string $column)`

`MAX(column)` with alias.

```php
table('tasks')->columns(Agg::builder()->max('max_sort', 'sort_order')->build())->get();
```

### `now(string $columnName)`

`NOW()` timestamp expression.

```php
table('tasks')->save(Agg::builder()->now('updated_at')->eq('status', 'open')->build());
```

### `uuid(string $columnName, ?string $uuidString)`

`UUID()` or a fixed UUID string for inserts/updates.

```php
table('projects')->save(Agg::builder()->uuid('public_id', null)->build());
```

### `lt(string $columnName, int $value)`

`column[<]value` condition.

```php
table('tasks')->filter()->where(Agg::builder()->lt('priority', 4)->build())->all();
```

### `lte(string $columnName, int $value)`

`column[<=]value` condition.

```php
table('tasks')->filter()->where(Agg::builder()->lte('sort_order', 10)->build())->all();
```

### `gt(string $columnName, int $value)`

`column[>]value` condition.

```php
table('tasks')->filter()->where(Agg::builder()->gt('priority', 1)->build())->all();
```

### `gte(string $columnName, mixed $value)`

`column[>=]value` condition.

```php
table('tasks')->filter()->where(Agg::builder()->gte('estimate_hours', 2)->build())->all();
```

### `eq(string $columnName, mixed $value)`

Equality expression entry.

```php
table('tasks')->filter()->where(Agg::builder()->eq('status', 'open')->build())->all();
```

### `neq(string $columnName, mixed $value)`

`column[!]value` inequality.

```php
table('tasks')->filter()->where(Agg::builder()->neq('status', 'archived')->build())->all();
```

### `plus(string $columnName, int $value)`

Increment column: `column[+]value`.

```php
table('tasks')->update(Agg::builder()->plus('sort_order', 1)->build(), 42);
```

### `minus(string $columnName, int $value)`

Decrement column: `column[-]value`.

```php
table('tasks')->update(Agg::builder()->minus('estimate_hours', 1)->build(), 42);
```

### `of(string $columnName, int $value)`

Multiply column: `column[*]value`.

```php
table('tasks')->update(Agg::builder()->of('estimate_hours', 2)->build(), 42);
```

### `jsonified(string $columnName, array $value)`

JSON-encode a value into a column on write.

```php
table('tasks')->update(Agg::builder()->jsonified('meta', ['reviewed' => true])->build(), 42);
```

### `div(string $columnName, int $value)`

Divide column: `column[/]value`.

```php
table('tasks')->update(Agg::builder()->div('estimate_hours', 2)->build(), 42);
```

### `like(string $columnName, string|array $value)`

`column[~]value` LIKE condition.

```php
table('tasks')->filter()->where(Agg::builder()->like('title', '%wireframe%')->build())->all();
```

### `notLike(string $columnName, string|array $value)`

`column[!~]value` negative LIKE.

```php
table('tasks')->filter()->where(Agg::builder()->notLike('title', '%draft%')->build())->all();
```

### `columnsCompare(string $column, string $comparison, string $otherColumn)`

Compare two columns (`=`, `>`, `<`, `!=`). Useful in HAVING or advanced WHERE.

```php
table('tasks', 't')->join()
    ->inner('projects', ['t.project_id' => 'id'], 'p')
    ->where(Agg::builder()->columnsCompare('t.updated_at', '>', 'p.created_at')->build())
    ->all();
```

### `between($columnName, array $values)`

`column[<>]values` BETWEEN.

```php
table('tasks')->filter()->where(Agg::builder()->between('priority', [1, 3])->build())->all();
```

### `notBetween($columnName, array $values)`

`column[><]values` NOT BETWEEN.

```php
table('tasks')->filter()->where(Agg::builder()->notBetween('sort_order', [0, 5])->build())->all();
```

### `regex($columnName, string $regex)`

`column[REGEXP]regex` condition (MySQL).

```php
table('team_members')->filter()
    ->where(Agg::builder()->regex('email', '@northwind\\.studio$')->build())
    ->all();
```

## `Pionia\Porm\PaginationCore`

Moonlight list payloads for DeskFlow tables. Reads `limit` / `offset` from request arrays (`PAGINATION`, `pagination`, `SEARCH`, `search`, or top-level keys).

### `__construct(?array $req, string $table, ?int $limit = 10, ?int $offset = 0, ?string $db = null, ?string $alias = null)`

Captures pagination parameters from a Moonlight action request body and binds a table name.

```php
$page = new PaginationCore($requestBody, 'tasks', 25, 0);
```

### `columns(string|array $columns = '*')`

Sets SELECT columns for the paginated query.

```php
$page = (new PaginationCore($req, 'tasks'))
    ->columns(['id', 'title', 'status', 'project_id']);
```

### `where(array $where = [])`

Merges base WHERE conditions applied before `init()`.

```php
$page = (new PaginationCore($req, 'tasks'))
    ->where(['status' => 'open', 'project_id' => 1]);
```

### `init(callable $callback)`

Builds the underlying `Builder` or `Join` via `table()`. Callback receives a `Porm` instance and must return `Builder` or `Join`.

```php
$payload = (new PaginationCore($req, 'tasks', 20))
    ->where(['project_id' => 1])
    ->init(fn ($q) => $q->filter()->orderBy('sort_order'))
    ->paginate();
```

### `paginate(?array $where = null, ?array $joins = null)`

Executes COUNT + page query and returns results with navigation metadata (`has_next`, `total_count`, offsets). Requires `init()` first.

```php
$result = (new PaginationCore($req, 'tasks'))
    ->init(fn ($q) => $q->filter()->where('status', 'open'))
    ->paginate();

// $result['results'], $result['total_count'], $result['has_next'], ...
```

### `paginateApproximate(?array $where = null, int $countCacheTtl = 60)`

Same as `paginate()` but caches `total_count` for `$countCacheTtl` seconds. Sets `approximate_count => true` in the payload.

```php
$result = (new PaginationCore($req, 'tasks', 50))
    ->init(fn ($q) => $q->filter())
    ->paginateApproximate(null, 120);
```

## `Pionia\Porm\ConnectionManager`

### `connection(null|string|array $name = 'default')`

Returns a pooled `Connection`. Creates and caches on first use; pings stale handles before reuse.

```php
$conn = connectionManager()->connection('default');
```

### `register(string $name, Connection $connection)`

Injects a pre-built connection into the pool (tests, custom bootstrapping).

```php
connectionManager()->register('testing', Connection::open(['testMode' => true]));
```

### `disconnect(?string $name = null)`

Clears one named pool entry or the entire pool when `$name` is null. Call on RoadRunner worker shutdown — not per HTTP request.

```php
connectionManager()->disconnect('default');
connectionManager()->disconnect(); // all
```

### `has(string $name)`

Returns whether a connection is currently cached in the pool.

```php
if (connectionManager()->has('reporting')) {
    $pdo = connectionManager()->connection('reporting')->getPdo();
}
```

## `Pionia\Porm\Driver\Connection`

### `Connection::connect(null|string|array|PDO $connection = 'default')`

Resolves a connection through `ConnectionManager` when the app container is booted; otherwise opens a standalone instance.

```php
$porm = new Porm(Connection::connect('default'));
```

### `Connection::open(null|string|array|PDO $connection = 'default')`

Always creates a new connection without going through the manager pool. Use in tests or one-off scripts.

```php
$conn = Connection::open([
    'type' => 'sqlite',
    'database' => ':memory:',
    'testMode' => false,
]);
```

## `Pionia\Porm\Core\Piql`

Low-level SQL engine (Medoo-compatible). Access via `$porm->getDatabase()`. Prefer `table()` for application code; use `Piql` when extending Porm internals.

### `Piql::raw(string $string, array $map = [])`

Builds a `Raw` expression with bound parameters. Safe alternative to string concatenation in custom SQL fragments.

```php
$expr = Piql::raw('estimate_hours * :rate', ['rate' => 85]);
```

### `upsert(string $table, array $data, string $primaryKey = 'id')`

Native insert-or-update on conflict for SQLite, MySQL, and PostgreSQL. Returns `null` when unsupported.

```php
table('tasks')->getDatabase()->upsert('tasks', [
    'id' => 7,
    'status' => 'done',
], 'id');
```

### `lastPrepared()`

Returns the last executed statement and placeholder map: `['statement' => '...', 'map' => [...]]`. Pair with `lastQuery()` for debugging DeskFlow queries on port 8000.

```php
table('tasks')->where('status', 'open')->all();
$prepared = table('tasks')->getDatabase()->lastPrepared();
```

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

## Common mistakes

- **Calling non-terminal methods after `all()` or `count()`** — start a fresh `table('tasks')` chain for the next operation.
- **Using Builder methods on a bare `Porm` after `join()`** — join chains only expose Join + FilterTrait terminals.
- **Assuming `saveOrUpdate()` targets joined tables** — writes always hit the base table from `table('tasks')`.
- **Looking up deprecated `Porm\Porm` class names** — v3 lives under `Pionia\Porm\` per this reference.

## What's next

{{< card-grid >}}
{{< link-card title="Making queries" description="Worked CRUD examples on tasks." href="/documentation/database/making-queries/" >}}
{{< link-card title="WHERE DSL" description="Array operator reference." href="/documentation/database/where-dsl/" >}}
{{< link-card title="Database index" description="Full guide map." href="/documentation/database/" >}}
{{< /card-grid >}}
