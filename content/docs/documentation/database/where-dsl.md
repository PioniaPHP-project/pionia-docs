---
title: "WHERE DSL Reference"
slug: "where-dsl"
description: "Medoo-style WHERE arrays in Porm and Piql."
summary: "Operators, AND/OR, LIKE, IN, BETWEEN, MATCH, and nested clauses."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 814
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm WHERE DSL"
  description: "Complete reference for Porm WHERE clause arrays."
  canonical: ""
  noindex: false
---

This reference is for **DeskFlow** developers who prefer Medoo-style WHERE arrays over fluent `where()` when building `TaskService` filters. Every operator below applies to `tasks`, `projects`, and `team_members` queries on Northwind's port **8000** stack.

## What you will learn

- Write comparison, LIKE, IN, and NULL operators in WHERE arrays
- Nest `AND` / `OR` groups for complex board filters
- Embed raw SQL fragments safely with `Piql::raw()`

{{< prerequisites >}}
- [Filtering](/documentation/database/queries-with-filtering/) — fluent `where()` and the Builder
- [Making queries](/documentation/database/making-queries/) — table-level `where()` and `all()`
{{< /prerequisites >}}

## How it works

```text
WHERE array  →  Piql parser  →  parameterized SQL + binds
     ↑
table('tasks')->filter([...])  |  ->where([...])  |  Agg / Where builders
```

Porm passes WHERE arrays to **Piql**, which implements a [Medoo](https://medoo.in/api/where)-compatible DSL. Use them in `where()`, `filter()`, `all($where)`, `get($where)`, aggregates, and `Agg` / `Where` builders.

{{<callout context="tip" icon="outline/pencil">}}
Prefer the [fluent `where()` syntax](/documentation/database/queries-with-filtering/#fluent-where-orm-style) for readability: `where('status', 'open')`, `where('title', 'starts_with', 'Desk')`, etc.
{{</callout>}}

## Equality (default)

```php
['status' => 'open', 'project_id' => 1]
// status = 'open' AND project_id = 1
```

## Comparison operators

Prefix the column with the operator:

| Syntax | SQL |
|--------|-----|
| `'priority[>]' => 2` | `priority > 2` |
| `'priority[>=]' => 2` | `priority >= 2` |
| `'sort_order[<]' => 10` | `sort_order < 10` |
| `'sort_order[<=]' => 10` | `sort_order <= 10` |
| `'status[!]' => 'done'` | `status != 'done'` or `IS NOT NULL` |
| `'priority[<>]' => [1, 3]` | `BETWEEN 1 AND 3` |
| `'priority[><]' => [1, 3]` | `NOT BETWEEN` |

```php
table('tasks')->filter(['priority[>]' => 2, 'sort_order[<=]' => 100])->all();
```

## LIKE

| Syntax | Meaning |
|--------|---------|
| `'title[~]' => 'desk'` | `LIKE '%desk%'` |
| `'title[!~]' => 'draft'` | `NOT LIKE` |
| `'title[~]' => ['desk', 'flow']` | OR of LIKEs |

## IN / NOT IN

```php
['id' => [1, 2, 3]]           // IN (1,2,3)
['status[!]' => ['archived']]  // NOT IN
```

## NULL

```php
['completed_at' => null]   // IS NULL
['assignee_id[!]' => null]    // IS NOT NULL
```

## AND / OR groups

```php
[
    'AND' => [
        'status' => 'open',
        'OR' => [
            'priority' => 1,
            'priority' => 2,
        ],
    ],
]
```

Top-level keys in a flat array are AND-ed. Use explicit `AND` / `OR` keys for nesting.

## ORDER, LIMIT, GROUP, HAVING

On a **Builder** chain, prefer fluent methods. In raw WHERE arrays:

| Key | Example |
|-----|---------|
| `ORDER` | `['ORDER' => ['created_at' => 'DESC']]` |
| `LIMIT` | `['LIMIT' => 10]` or `['LIMIT' => [20, 10]]` (offset, limit) |
| `GROUP` | `['GROUP' => 'project_id']` |
| `HAVING` | `['HAVING' => ['count[>]' => 5]]` |

{{<callout context="warning" icon="outline/exclamation-triangle">}}
`startAt($offset)` on the Builder requires a prior `limit()` call — it maps to `LIMIT [$offset, $limit]`.
{{</callout>}}

## FULLTEXT — `match()`

On the Builder:

```php
table('tasks')
    ->filter()
    ->match('title,description', 'deskflow sprint', 'natural')
    ->all();
```

Adds a `MATCH … AGAINST` style clause (driver-dependent).

## Column aliases & casts

Select with alias: `'column(alias)'` in `columns()`.

Cast on read: suffix `[Int]`, `[Bool]`, `[Number]`, `[String]`, `[JSON]`, `[Object]`:

```php
table('tasks')->columns(['metadata[JSON]'])->get(1);
```

{{<callout context="note" icon="outline/information-circle">}}
`[Object]` uses PHP `unserialize()` — only use with trusted database content.
{{</callout>}}

## Programmatic builders

### `Where` builder

```php
use Pionia\Porm\Database\Builders\Where;

$clause = Where::builder()
    ->and(['priority[>]' => 2])
    ->or(['status' => 'blocked'])
    ->build();

table('tasks')->filter($clause)->all();
```

### `Agg` builder

For HAVING-style expressions, comparisons in WHERE, and computed columns — see [Aggregation](/documentation/database/using-functions-aggregation/).

## Raw fragments

```php
use Pionia\Porm\Core\Piql;

table('tasks')->filter([
    'created_at[>]' => Piql::raw('DATE_SUB(NOW(), INTERVAL 7 DAY)'),
])->all();
```

See also [Transactions & raw SQL](/documentation/database/transactions-and-raw-sql/).

## Common mistakes

- **Passing user search text into `Piql::raw()`** — use bound `where()` or `[~]` LIKE operators for DeskFlow search boxes.
- **Duplicate keys inside `OR` arrays** — PHP keeps only the last value; nest groups or use `whereIn()`.
- **Using `[Object]` casts on untrusted columns** — never on client-supplied JSON in Northwind staging data.
- **Embedding `ORDER`/`LIMIT` in WHERE when a Builder exists** — prefer `orderBy()` / `limit()` on `filter()` chains in services.

## What's next

{{< card-grid >}}
{{< link-card title="Filtering" description="Fluent where() on the Builder." href="/documentation/database/queries-with-filtering/" >}}
{{< link-card title="Aggregation" description="Agg builder for HAVING." href="/documentation/database/using-functions-aggregation/" >}}
{{< link-card title="Transactions" description="Raw SQL and Piql::raw()." href="/documentation/database/transactions-and-raw-sql/" >}}
{{< /card-grid >}}
