---
title: "Relationships & Joins"
slug: "relationships"
description: "Join tables with Porm — ON clauses, aliases, GenericService, and the Join builder."
summary: "inner/left/right/full joins, JoinOn helpers, filtering, count, pagination."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 815
toc: true
parent: "database"
seo:
  title: "Porm joins and relationships"
  description: "Complete guide to Porm joins: ON formats, aliases, fluent where, and GenericService."
  canonical: ""
  noindex: false
---

Porm joins are **explicit** — there is no magic relationship graph. You call `join()` on a `table()` query, chain `inner()` / `left()` / `right()` / `full()`, then finish with `all()`, `get()`, `first()`, or `count()`.

{{<callout context="tip" icon="outline/pencil">}}
[Generic services](/documentation/building-api/advanced-generic-services/) automate the same join definitions via `$joins`, `$joinTypes`, and `$joinAliases` on a service class (see [GenericService joins](#generic-service-joins) below).
{{</callout>}}

## Mental model

```text
table('orders', 'o')          ← base table (+ optional alias)
  ->columns([...])            ← always qualify columns when joined
  ->join()                     ← enter Join builder (no more save/delete on this chain)
    ->left('users', $on, 'u')  ← join type + ON/USING + join alias
    ->where('o.status', 'paid')
    ->all();
```

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

table('sample_table', 'st')
    ->columns(['st.name', 'c.name(company_name)'])
    ->join()
    ->leftJoin('company', JoinOn::map('company', 'id'), 'c')
    ->all();
```

## ON / USING formats

Piql (under the hood) accepts four shapes for the second argument:

### 1. Map (recommended for FK joins)

**`[baseColumn => joinedColumn]`** — expands to  
`ON {base_table}.{baseColumn} = {alias}.{joinedColumn}`.

```php
// sample_table.company → company.id
->left('company', ['company' => 'id'], 'c')

// products.category_id → categories.id
->inner('categories', ['category_id' => 'id'])
```

Use `JoinOn::map('company', 'id')` for readability.

### 2. Raw SQL expression

Full `ON` expression as a string (you quote columns / qualify names):

```php
->inner('categories', 'products.category_id = categories.id')
->left('users', JoinOn::expression('orders.user_id = users.id AND users.active = 1'))
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
table('orders', 'o')
    ->columns([
        'o.id',
        'o.total',
        'u.email(customer_email)',  // AS customer_email
    ])
    ->join()
    ->left('users', JoinOn::map('user_id', 'id'), 'u')
    ->all();
```

**Base table alias:** `table('stock', 'st')` or GenericService `$baseAlias = 'st'`.

**Result alias:** `column(alias)` in the column list — same as non-join queries.

## Filtering joined queries

On the Join builder use **`where()`** (fluent or array) or **`filter($array)`** (sugar over `where`):

```php
table('orders', 'o')
    ->join()
    ->inner('users', JoinOn::map('user_id', 'id'), 'u')
    ->where('o.status', 'paid')
    ->where('u.country', 'UG')
    ->orderBy(['o.created_at' => 'DESC'])
    ->limit(20)
    ->all();

// array style
->filter(['o.status' => 'paid', 'u.active' => 1])
```

Fluent operators (`starts_with`, `in`, …) work here too — see [Filtering](/documentation/database/queries-with-filtering/).

## Single row — `get()` / `first()`

```php
$row = table('sample_table', 'st')
    ->columns(['st.name', 'c.name(company_name)'])
    ->join()
    ->left('company', JoinOn::map('company', 'id'), 'c')
    ->where('st.id', 1)
    ->first();
```

## Count & random

```php
$total = table('orders', 'o')
    ->join()
    ->left('users', JoinOn::map('user_id', 'id'), 'u')
    ->where('o.status', 'open')
    ->count();

$pick = table('products')
    ->join()
    ->inner('categories', JoinOn::map('category_id', 'id'))
    ->random(1, ['products.active' => 1]);
```

## Multiple joins

Chain before executing:

```php
table('line_items', 'li')
    ->columns(['li.qty', 'o.id(order_id)', 'p.name'])
    ->join()
    ->inner('orders', JoinOn::map('order_id', 'id'), 'o')
    ->left('products', JoinOn::map('product_id', 'id'), 'p')
    ->all();
```

Order matters: each join sees tables already in the query.

## Pagination

Use `PaginationCore` with a base alias and return the join chain from `init()`:

```php
$pagination = new PaginationCore($req, 'sample_table', 10, 0, null, 'st');
$page = $pagination
    ->columns(['st.id', 'st.name', 'c.name(company_name)'])
    ->init(fn ($q) => $q->join()
        ->left('company', JoinOn::map('company', 'id'), 'c')
        ->orderBy(['st.id' => 'DESC']))
    ->paginate();
```

See [Pagination](/documentation/database/pagination/).

## Eager loading without joins — `JoinLoader`

When you already fetched parent rows (e.g. from a simple `filter()->all()`) and need related records, use `JoinLoader::eager()` instead of querying inside a loop:

```php
use Pionia\Porm\Database\Builders\JoinLoader;

$items = table('sample_table', 'st')->filter()->all();
$items = JoinLoader::eager($items, 'company', 'company', 'id', 'company_row');
```

This runs one `WHERE IN` on the related table and attaches each match as `company_row` on the parent. Pass a connection name as the last argument when not using `default`.

## GenericService joins

Declare joins on services extending `GenericService` / `UniversalGenericService`:

```php
use Pionia\Http\Services\JoinType;

class SampoloService extends UniversalGenericService
{
    public string $table = 'sample_table';
    public ?string $baseAlias = 'st';

    public ?array $joins = [
        'company' => ['company' => 'id'],  // st.company = company.id
    ];

    public ?array $joinTypes = [
        'company' => JoinType::LEFT,
    ];

    public ?array $joinAliases = [
        'company' => 'c',
    ];

    public ?array $listColumns = [
        'st.id(id)',
        'st.name(name)',
        'c.name(company_name)',
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

**Map direction:** keys are columns on the **base** (`$table`) side; values are columns on the **joined** table — matching Piql’s `ON base.key = joined.value`.

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
