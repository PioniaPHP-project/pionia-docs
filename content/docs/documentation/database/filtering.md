---
title: "Queries with Filtering"
slug: "queries-with-filtering"
description: "filter(), orderBy, limit, and the Where builder."
summary: "Builder mode after filter() for complex reads."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 813
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm — filtering and ordering"
  description: "filter(), orderBy, limit, and the Where builder in Pionia v3."
  canonical: ""
  noindex: false
---

This guide is for **Pionia Shop** list endpoints — filtering `products` by status, scoping to a `project_id`, and sorting for ada@pionia.shop's board on port **8000**. You will move from simple `where()` arrays to the full Builder after `filter()`.

## What you will learn

- Use fluent `where()` and Medoo-style array conditions on Pionia Shop tables
- Chain `orderBy`, `limit`, and `startAt` on a Builder
- Build nested AND/OR clauses with the `Where` builder

{{< prerequisites >}}
- [Configuration](/documentation/database/configuration-getting-started/) — `[db]` for Pionia Shop
- [Making queries](/documentation/database/making-queries/) — `get()`, `all()`, and table-level reads
{{< /prerequisites >}}

## How it works

```text
table('products')
  → filter([...])     enters Builder mode
  → where / orderBy / limit / startAt
  → all() | count() | first()   (terminal — executes SQL)
```

{{<callout context="warning" icon="outline/exclamation-triangle">}}
`startAt($offset)` requires a prior `limit()` call on the Builder.
{{</callout>}}

# Introduction

Sometimes, you need more than just fetching data from the database. You may need to filter the data based on certain conditions. This is where filtering comes in. Filtering allows you to specify conditions that the data must meet before it is returned.

In this section, we will look at how to filter data when querying the database using Porm.

## Fluent `where()` (ORM-style)

Porm accepts a **Laravel-inspired** `where(column, operator, value)` syntax on `table()`, `filter()` builders, and joins. Array conditions still work — both styles can be mixed.

### Equality

```php
table('customers')
    ->filter()
    ->where('email', 'ada@pionia.shop')   // WHERE email = 'ada@pionia.shop'
    ->all();

// symbolic operator (3-arg)
table('products')->filter()->where('priority', '>', 2)->all();
```

### Named operators

| Operator | Example | SQL-ish |
|----------|---------|---------|
| `equals`, `is`, `eq`, `=` | `where('status', 'is', 'open')` | `status = 'open'` |
| `not_equal`, `neq`, `!=` | `where('status', 'not_equal', 'done')` | `status != 'done'` |
| `starts_with` | `where('title', 'starts_with', 'Desk')` | `LIKE 'Desk%'` |
| `ends_with` | `where('email', 'ends_with', '.studio')` | `LIKE '%.studio'` |
| `includes`, `contains`, `like` | `where('title', 'includes', 'wireframe')` | `LIKE '%wireframe%'` |
| `not_includes` | `where('title', 'not_includes', 'draft')` | `NOT LIKE` |
| `greater_than`, `gt`, `>` | `where('priority', 'gt', 2)` | `priority > 2` |
| `less_than`, `lt`, `<` | `where('sort_order', 'lt', 10)` | `sort_order < 10` |
| `in` | `where('id', 'in', [1, 2, 3])` | `IN (...)` |
| `not_in` | `where('id', 'not_in', [4, 5])` | `NOT IN` |
| `between` | `where('priority', 'between', [1, 3])` | `BETWEEN` |
| `is_null` | `whereNull('completed_at')` | `IS NULL` |
| `is_not_null` | `whereNotNull('assignee_id')` | `IS NOT NULL` |

### Convenience methods

```php
table('products')->filter()
    ->whereEquals('status', 'open')
    ->whereStartsWith('title', 'Desk')
    ->whereIncludes('title', 'Flow')
    ->whereNotEqual('status', 'archived')
    ->whereIn('project_id', [1, 2, 3])
    ->whereBetween('priority', 1, 3)
    ->all();
```

### `orWhere()`

```php
table('customers')->filter()
    ->where('email', 'ada@pionia.shop')
    ->orWhere('name', 'Ada Lovelace')
    ->all();
// (email = 'ada@pionia.shop' OR name = 'Ada Lovelace')
```

For multiple values on the **same column**, prefer `whereIn('status', ['open', 'in_progress'])` over chaining `orWhere` on one column (PHP arrays cannot repeat keys).

### Table-level chaining

```php
table('products')->where('status', 'open')->get();
```

## Array `where` (Medoo-style)

This method can be used to filter data based on a single 'AND' condition. This method can be used with all the other methods in the query builder.

```php
$products = table('products')->where(['project_id' => 1])->get();
```

You can chain as many `where` methods as you want to filter the data.

```php

$products = table('products')
    ->where(['project_id' => 1])
    ->where(['status' => 'open'])
    ->all();

```

All conditions in the `where` method are joined by an 'AND' operator.

## filter

The `filter` method can be used to filter data based on multiple conditions. The conditions are joined by an 'AND' operator.

```php

$products = table('products')
    ->filter(['project_id' => 1, 'status' => 'open'])
    ->all();

```

This might look familiar, however, the `filter` method ports us to the underlying QueryBuilder class, which allows us to chain more complex conditions and avails more methods.

Using filter, you can access methods such as `orderBy`, `group`, `limit`, `match`, `having`, `first`, `get`, `all` and many more.

```php
$products = table('products')
    ->filter(['project_id' => 1, 'status' => 'open'])
    ->orderBy(['priority' => 'DESC'])
    ->limit(10)
    ->startAt(5)
    ->all();
```

## Where Builder

Observing all our examples provided so far, we can notice that where conditions are passed as an array. With this builder, you can build a more complex query which will internally be converted to an array as shown in the examples above.

### Bulding

To start building, call `builder()` on `Pionia\Porm\Database\Builders\Where`:

```php
use Pionia\Porm\Database\Builders\Where;

$clause = Where::builder();
```

From there, you can chain methods to build your query.

The builder MUST finally call the `build` method to actually build the query.

```php

$clause = Where::builder()
// add here both AND and OR conditions
    ->build();
```

You can then pass this clause to any method that accepts conditions.

```php

$clause = Where::builder()
// add here both AND and OR conditions
    ->build();

$products = table('products')
    ->where($clause) // with where method
    ->all();

$products = table('products')
    ->filter($clause) // with filter method
    ->all();

$products = table('products')
    ->all($clause); // with all method

$products = table('products')
    ->first($clause); // with first method

$products = table('products')
    ->filter($clause) // with filter method that also defines more complex queries
    ->orderBy(['priority' => 'DESC'])
    ->limit(10)
    ->startAt(5)
    ->all();
```

### AND Conditions

To add an 'AND' condition, you can use the `and` method.

```php

$clause = Where::builder()
    ->and(['project_id' => 1])
    ->and(['status' => 'open'])
    ->build();
```

You can chain as many `and` methods as you want to add more conditions.

### OR Conditions

To add an 'OR' condition, you can use the `or` method.

```php

$clause = Where::builder()
    ->or(['status' => 'open'])
    ->or(['status' => 'in_progress'])
    ->build();
```

You can chain as many `or` methods as you want to add more conditions.

{{<callout context="tip"  icon="outline/pencil">}}
The "and()" and "or()" methods can be used together to build more complex queries.
{{</callout>}}

{{<callout context="tip"  icon="outline/pencil">}}
Also note that the "and()" and "or()" methods take in an array of conditions. Which means you can pass a full clause to them too!

This is how you start to build more complex conditions!
{{</callout>}}

### AND and OR

You can mix 'AND' and 'OR' conditions to build more complex queries.

```php

$clause = Where::builder()
    ->and(['project_id' => 1])
    ->or(['status' => 'blocked'])
    ->build();
```

You can chain as many `and` and `or` methods as you want to build more complex queries.

### Complex Relativity

You can also build more complex queries by nesting conditions.

```php

$clause = Where::builder()
    ->and(['project_id' => 1])
    ->or(
        Where::builder()
            ->and(['status' => 'open'])
            ->or(['status' => 'in_progress'])
            ->and(['assignee_id' => 2])
            ->build()
    )
    ->build();

    // where project_id = 1 OR (status = 'open' OR status = 'in_progress' AND assignee_id = 2)
```

You can nest as many conditions as you want to build more complex queries. This is where Porm shines!

## Common mistakes

- **Calling `startAt()` without `limit()`** — Pionia Shop paginated lists need both or the Builder throws.
- **Repeating the same array key in OR conditions** — use `whereIn('status', [...])` instead of duplicate keys.
- **Mixing unqualified column names after joins** — prefix with `t.` when filtering joined task lists.
- **Filtering on client fields without validation** — whitelist sort columns in `ProductService` before passing to `orderBy()`.

## What's next

{{< card-grid >}}
{{< link-card title="WHERE DSL" description="Medoo-style operator reference." href="/documentation/database/where-dsl/" >}}
{{< link-card title="Pagination" description="limit/offset for list_* actions." href="/documentation/database/pagination/" >}}
{{< link-card title="Relationships" description="Filter across joined tables." href="/documentation/database/relationships/" >}}
{{< /card-grid >}}
