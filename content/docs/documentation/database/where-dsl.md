---
title: "WHERE DSL Reference"
slug: "where-dsl"
description: "Medoo-style WHERE arrays in Porm and Piql."
summary: "Operators, AND/OR, LIKE, IN, BETWEEN, MATCH, and nested clauses."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 814
toc: true
parent: "database"
seo:
  title: "Porm WHERE DSL"
  description: "Complete reference for Porm WHERE clause arrays."
  canonical: ""
  noindex: false
---

Porm passes WHERE arrays to **Piql**, which implements a [Medoo](https://medoo.in/api/where)-compatible DSL. Use them in `where()`, `filter()`, `all($where)`, `get($where)`, aggregates, and `Agg` / `Where` builders.

{{<callout context="tip" icon="outline/pencil">}}
Prefer the [fluent `where()` syntax](/documentation/database/queries-with-filtering/#fluent-where-orm-style) for readability: `where('username', 'jet')`, `where('name', 'starts_with', 'Pi')`, etc.
{{</callout>}}

## Equality (default)

```php
['status' => 'active', 'role' => 'admin']
// status = 'active' AND role = 'admin'
```

## Comparison operators

Prefix the column with the operator:

| Syntax | SQL |
|--------|-----|
| `'age[>]' => 18` | `age > 18` |
| `'age[>=]' => 18` | `age >= 18` |
| `'age[<]' => 65` | `age < 65` |
| `'age[<=]' => 65` | `age <= 65` |
| `'age[!]' => 0` | `age != 0` or `IS NOT NULL` |
| `'age[<>]' => [10, 20]` | `BETWEEN 10 AND 20` |
| `'age[><]' => [10, 20]` | `NOT BETWEEN` |

```php
table('users')->filter(['age[>]' => 18, 'score[<=]' => 100])->all();
```

## LIKE

| Syntax | Meaning |
|--------|---------|
| `'name[~]' => 'john'` | `LIKE '%john%'` |
| `'name[!~]' => 'john'` | `NOT LIKE` |
| `'name[~]' => ['john', 'jane']` | OR of LIKEs |

## IN / NOT IN

```php
['id' => [1, 2, 3]]           // IN (1,2,3)
['status[!]' => ['banned']]   // NOT IN
```

## NULL

```php
['deleted_at' => null]   // IS NULL
['email[!]' => null]    // IS NOT NULL
```

## AND / OR groups

```php
[
    'AND' => [
        'active' => 1,
        'OR' => [
            'role' => 'admin',
            'role' => 'editor',
        ],
    ],
]
```

Top-level keys in a flat array are AND-ed. Use explicit `AND` / `OR` keys for nesting.

## ORDER, LIMIT, GROUP, HAVING

On a **Builder** chain, prefer fluent methods. In raw WHERE arrays:

| Key | Example |
|-----|---------|
| `ORDER` | `['ORDER' => ['date' => 'DESC']]` |
| `LIMIT` | `['LIMIT' => 10]` or `['LIMIT' => [20, 10]]` (offset, limit) |
| `GROUP` | `['GROUP' => 'user_id']` |
| `HAVING` | `['HAVING' => ['count[>]' => 5]]` |

{{<callout context="warning" icon="outline/exclamation-triangle">}}
`startAt($offset)` on the Builder requires a prior `limit()` call — it maps to `LIMIT [$offset, $limit]`.
{{</callout>}}

## FULLTEXT — `match()`

On the Builder:

```php
table('articles')
    ->filter()
    ->match('title,body', 'pionia framework', 'natural')
    ->all();
```

Adds a `MATCH … AGAINST` style clause (driver-dependent).

## Column aliases & casts

Select with alias: `'column(alias)'` in `columns()`.

Cast on read: suffix `[Int]`, `[Bool]`, `[Number]`, `[String]`, `[JSON]`, `[Object]`:

```php
table('meta')->columns(['payload[JSON]'])->get(1);
```

{{<callout context="note" icon="outline/information-circle">}}
`[Object]` uses PHP `unserialize()` — only use with trusted database content.
{{</callout>}}

## Programmatic builders

### `Where` builder

```php
use Pionia\Porm\Database\Builders\Where;

$clause = Where::builder()
    ->and(['age[>]' => 18])
    ->or(['role' => 'admin'])
    ->build();

table('users')->filter($clause)->all();
```

### `Agg` builder

For HAVING-style expressions, comparisons in WHERE, and computed columns — see [Aggregation](/documentation/database/using-functions-aggregation/).

## Raw fragments

```php
use Pionia\Porm\Core\Piql;

table('orders')->filter([
    'created_at[>]' => Piql::raw('DATE_SUB(NOW(), INTERVAL 7 DAY)'),
])->all();
```

See also [Transactions & raw SQL](/documentation/database/transactions-and-raw-sql/).
