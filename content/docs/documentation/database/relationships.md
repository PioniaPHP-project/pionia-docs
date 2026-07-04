---
title: "Relationships & Joins"
slug: "relationships"
description: "Join tables with Porm — ON clauses, aliases, GenericService, and the Join builder."
summary: "inner/left/right/full joins, JoinOn helpers, filtering, count, pagination."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 815
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm joins and relationships"
  description: "Complete guide to Porm joins: ON formats, aliases, fluent where, and GenericService."
  canonical: ""
  noindex: false
---

This guide shows **Northwind Studio** how to join **DeskFlow** tables — tasks with projects and assignees from `team_members` — without an ORM relationship graph. Explicit `join()` chains power enriched list responses on port **8000**.

## What you will learn

- Choose inner/left/right/full joins and ON/USING formats
- Qualify columns and aliases when listing tasks with project names
- Wire the same joins into `GenericService` for Moonlight list actions

{{< prerequisites >}}
- [Making queries](/documentation/database/making-queries/) — table-level reads before joins
- [Filtering](/documentation/database/queries-with-filtering/) — `where()` on Join builders
{{< /prerequisites >}}

## How it works

```text
table('tasks', 't')          ← base table (+ optional alias)
  ->columns([...])            ← always qualify columns when joined
  ->join()                     ← enter Join builder (no save/delete on this chain)
    ->left('projects', $on, 'p')
    ->left('team_members', $on, 'm')
    ->where('t.status', 'open')
    ->all();
```

Porm joins are **explicit** — there is no magic relationship graph. You call `join()` on a `table()` query, chain `inner()` / `left()` / `right()` / `full()`, then finish with `all()`, `get()`, `first()`, or `count()`.

{{<callout context="tip" icon="outline/pencil">}}
[Generic services](/documentation/building-api/advanced-generic-services/) automate the same join definitions via `$joins`, `$joinTypes`, and `$joinAliases` on a service class (see [GenericService joins](#generic-service-joins) below).
{{</callout>}}

## Mental model

| Mode | Entry | Terminal methods |
|------|--------|------------------|
| Table | `table('t')` | `get`, `save`, `all`, … |
| Filter builder | `->filter()` | `all`, `get`, `count`, … |
| **Join builder** | `->join()` | `all`, `get`, `first`, `count`, `random` |

## Join types

| Method | Alias | SQL |
|--------|-------|-----|
| `inner($table, $on, $alias?)` | `innerJoin()` | `INNER JOIN` |
| `left($table, $on, $alias?)` | `leftJoin()` | `LEFT JOIN` |
| `right($table, $on, $alias?)` | `rightJoin()` | `RIGHT JOIN` |
| `full($table, $on, $alias?)` | `fullJoin()` | `FULL OUTER JOIN` |

Signature: **`($joinedTable, $onOrUsing, $alias)`** — the third argument is the **alias for the joined table**, not the base table. If omitted, the table name is used as the alias.

```php
use Pionia\Porm\Database\Builders\JoinOn;

table('tasks', 't')
    ->columns(['t.title', 'p.name(project_name)'])
    ->join()
    ->leftJoin('projects', JoinOn::map('project_id', 'id'), 'p')
    ->all();
```

## ON / USING formats

Piql (under the hood) accepts four shapes for the second argument:

### 1. Map (recommended for FK joins)

**`[baseColumn => joinedColumn]`** — expands to  
`ON {base_table}.{baseColumn} = {alias}.{joinedColumn}`.

```php
// tasks.project_id → projects.id
->left('projects', ['project_id' => 'id'], 'p')

// tasks.assignee_id → team_members.id
->inner('team_members', ['assignee_id' => 'id'])
```

Use `JoinOn::map('project_id', 'id')` for readability.

### 2. Raw SQL expression

Full `ON` expression as a string (you quote columns / qualify names):

```php
->inner('projects', 'tasks.project_id = projects.id')
->left('team_members', JoinOn::expression('tasks.assignee_id = team_members.id AND team_members.active = 1'))
```

### 3. `USING` — shared column name(s)

Pass a **string** (one column) or **indexed array** (multiple columns):

```php
->inner('profiles', 'user_id')           // USING ("user_id")
->inner('link', ['order_id', 'line_id']) // USING ("order_id", "line_id")
```

`JoinOn::using('user_id')` documents intent.

### 4. Dotted map keys

For multi-table chains, keys may include the table/alias prefix:

```php
->inner('tag', ['stj.tag_id' => 'id'], 't')
```

## Columns & aliases

Always list columns explicitly when joining — avoid `*` on both tables (name collisions).

```php
table('tasks', 't')
    ->columns([
        't.id',
        't.title',
        'm.email(assignee_email)',  // AS assignee_email
    ])
    ->join()
    ->left('team_members', JoinOn::map('assignee_id', 'id'), 'm')
    ->all();
```

**Base table alias:** `table('tasks', 't')` or GenericService `$baseAlias = 't'`.

**Result alias:** `column(alias)` in the column list — same as non-join queries.

## Filtering joined queries

On the Join builder use **`where()`** (fluent or array) or **`filter($array)`** (sugar over `where`):

```php
table('tasks', 't')
    ->join()
    ->inner('projects', JoinOn::map('project_id', 'id'), 'p')
    ->where('t.status', 'open')
    ->where('p.client', 'Northwind')
    ->orderBy(['t.created_at' => 'DESC'])
    ->limit(20)
    ->all();

// array style
->filter(['t.status' => 'open', 'p.active' => 1])
```

Fluent operators (`starts_with`, `in`, …) work here too — see [Filtering](/documentation/database/queries-with-filtering/).

## Single row — `get()` / `first()`

```php
$row = table('tasks', 't')
    ->columns(['t.title', 'p.name(project_name)'])
    ->join()
    ->left('projects', JoinOn::map('project_id', 'id'), 'p')
    ->where('t.id', 1)
    ->first();
```

## Count & random

```php
$total = table('tasks', 't')
    ->join()
    ->left('team_members', JoinOn::map('assignee_id', 'id'), 'm')
    ->where('t.status', 'open')
    ->count();

$pick = table('tasks')
    ->join()
    ->inner('projects', JoinOn::map('project_id', 'id'))
    ->random(1, ['tasks.status' => 'open']);
```

## Multiple joins

Chain before executing:

```php
table('tasks', 't')
    ->columns(['t.title', 'p.name(project_name)', 'm.name(assignee)'])
    ->join()
    ->inner('projects', JoinOn::map('project_id', 'id'), 'p')
    ->left('team_members', JoinOn::map('assignee_id', 'id'), 'm')
    ->all();
```

Order matters: each join sees tables already in the query.

## Pagination

Use `PaginationCore` with a base alias and return the join chain from `init()`:

```php
$pagination = new PaginationCore($req, 'tasks', 10, 0, null, 't');
$page = $pagination
    ->columns(['t.id', 't.title', 'p.name(project_name)'])
    ->init(fn ($q) => $q->join()
        ->left('projects', JoinOn::map('project_id', 'id'), 'p')
        ->orderBy(['t.id' => 'DESC']))
    ->paginate();
```

See [Pagination](/documentation/database/pagination/).

## Eager loading without joins — `JoinLoader`

When you already fetched parent rows (e.g. from a simple `filter()->all()`) and need related records, use `JoinLoader::eager()` instead of querying inside a loop:

```php
use Pionia\Porm\Database\Builders\JoinLoader;

$tasks = table('tasks', 't')->filter()->all();
$tasks = JoinLoader::eager($tasks, 'project_id', 'projects', 'id', 'project');
```

This runs one `WHERE IN` on the related table and attaches each match as `project` on the parent. Pass a connection name as the last argument when not using `default`.

## GenericService joins

Declare joins on services extending `GenericService` / `UniversalGenericService`:

```php
use Pionia\Http\Services\JoinType;

class TaskService extends UniversalGenericService
{
    public string $table = 'tasks';
    public ?string $baseAlias = 't';

    public ?array $joins = [
        'projects' => ['project_id' => 'id'],  // t.project_id = projects.id
    ];

    public ?array $joinTypes = [
        'projects' => JoinType::LEFT,
    ];

    public ?array $joinAliases = [
        'projects' => 'p',
    ];

    public ?array $listColumns = [
        't.id(id)',
        't.title(title)',
        'p.name(project_name)',
    ];
}
```

| Property | Purpose |
|----------|---------|
| `$joins` | Joined table => ON map (`[baseCol => joinedCol]`) |
| `$joinTypes` | Per-table `JoinType::INNER\|LEFT\|RIGHT\|FULL` |
| `$joinAliases` | Short alias for joined table in SELECT/WHERE |
| `$baseAlias` | Alias for the service `$table` in queries |
| `$dontRelate` (request) | Skip joins; query base table only |

**Map direction:** keys are columns on the **base** (`$table`) side; values are columns on the **joined** table — matching Piql's `ON base.key = joined.value`.

Clients can pass `dontRelate: true` in the API body to list without joins. See [Advanced generic services](/documentation/building-api/advanced-generic-services/).

## What joins do not do (yet)

- No automatic relationship inference from foreign keys
- No insert/update across joined tables in one call (writes target `$table` only)
- No `crossJoin` helper (use raw SQL if required)
- SQLite has limited `FULL OUTER JOIN` support — prefer `left` + `union` patterns on SQLite

## Tips

1. **Alias early** — `table('t', 't')` and `$joinAliases` prevent ambiguous columns.
2. **Prefer `JoinOn::map()`** over raw strings for FK joins — easier to test and refactor.
3. **LEFT vs INNER** — use `LEFT` when the base row should appear without a match (nullable FK).
4. **Count before paginate** — `PaginationCore` runs `count()` on the same join chain; keep filters on the join builder inside `init()`.

Related: [WHERE DSL](/documentation/database/where-dsl/) · [API reference](/documentation/database/api-reference/) · [Generic services](/documentation/building-api/generic-services/).

## Common mistakes

- **Selecting `*` on joined tasks and projects** — duplicate `id`/`name` columns collide in DeskFlow list JSON.
- **Calling `save()` on a join chain** — writes only hit the base `$table`; update tasks separately from project rows.
- **Swapping ON map direction** — keys are base-table columns (`project_id`), values are joined-table columns (`id`).
- **Using FULL JOIN on SQLite for DeskFlow local dev** — prefer LEFT JOIN; SQLite support is limited.

## What's next

{{< card-grid >}}
{{< link-card title="Pagination" description="Paginate joined task lists." href="/documentation/database/pagination/" >}}
{{< link-card title="Performance" description="JoinLoader vs N+1 queries." href="/documentation/database/performance/" >}}
{{< link-card title="Advanced generic services" description="Join config on TaskService." href="/documentation/building-api/advanced-generic-services/" >}}
{{< /card-grid >}}
