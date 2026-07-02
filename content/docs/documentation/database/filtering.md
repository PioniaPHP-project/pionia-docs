---
title: "Queries with Filtering"
slug: "queries-with-filtering"
description: "filter(), orderBy, limit, and the Where builder."
summary: "Builder mode after filter() for complex reads."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 813
toc: true
parent: "database"
seo:
  title: "Porm — filtering and ordering"
  description: "filter(), orderBy, limit, and the Where builder in Pionia v3."
  canonical: ""
  noindex: false
---

{{<callout context="tip"  icon="outline/pencil">}}
This section assumes you have already completed configuring the database from the [Configuration Section](/documentation/database/configuration-getting-started/).

Also read [Making queries](/documentation/database/making-queries/) and the [WHERE DSL reference](/documentation/database/where-dsl/).
{{</callout>}}

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
table('users')
    ->filter()
    ->where('username', 'jet')   // WHERE username = 'jet'
    ->all();

// symbolic operator (3-arg)
table('users')->filter()->where('age', '>', 18)->all();
```

### Named operators

| Operator | Example | SQL-ish |
|----------|---------|---------|
| `equals`, `is`, `eq`, `=` | `where('status', 'is', 'active')` | `status = 'active'` |
| `not_equal`, `neq`, `!=` | `where('role', 'not_equal', 'guest')` | `role != 'guest'` |
| `starts_with` | `where('name', 'starts_with', 'Pi')` | `LIKE 'Pi%'` |
| `ends_with` | `where('email', 'ends_with', '.test')` | `LIKE '%.test'` |
| `includes`, `contains`, `like` | `where('bio', 'includes', 'php')` | `LIKE '%php%'` |
| `not_includes` | `where('tag', 'not_includes', 'draft')` | `NOT LIKE` |
| `greater_than`, `gt`, `>` | `where('age', 'gt', 21)` | `age > 21` |
| `less_than`, `lt`, `<` | `where('age', 'lt', 65)` | `age < 65` |
| `in` | `where('id', 'in', [1, 2, 3])` | `IN (...)` |
| `not_in` | `where('id', 'not_in', [4, 5])` | `NOT IN` |
| `between` | `where('age', 'between', [18, 65])` | `BETWEEN` |
| `is_null` | `whereNull('deleted_at')` | `IS NULL` |
| `is_not_null` | `whereNotNull('email')` | `IS NOT NULL` |

### Convenience methods

```php
table('users')->filter()
    ->whereEquals('username', 'jet')
    ->whereStartsWith('name', 'J')
    ->whereIncludes('email', 'pionia')
    ->whereNotEqual('role', 'banned')
    ->whereIn('id', [1, 2, 3])
    ->whereBetween('age', 18, 65)
    ->all();
```

### `orWhere()`

```php
table('users')->filter()
    ->where('username', 'jet')
    ->orWhere('email', 'jet@example.com')
    ->all();
// (username = 'jet' OR email = 'jet@example.com')
```

For multiple values on the **same column**, prefer `whereIn('username', ['jet', 'ada'])` over chaining `orWhere` on one column (PHP arrays cannot repeat keys).

### Table-level chaining

```php
table('users')->where('username', 'jet')->get();
```

## Array `where` (Medoo-style)

This method can be used to filter data based on a single 'AND' condition. This method can be used with all the other methods in the query builder.

```php
$users = table('users')->where(['age' => 10])->get();
```

You can chain as many `where` methods as you want to filter the data.

```php

$users = table('users')
    ->where(['age' => 10])
    ->where(['name' => 'John Doe'])
    ->all();

```

All conditions in the `where` method are joined by an 'AND' operator.

## filter

The `filter` method can be used to filter data based on multiple conditions. The conditions are joined by an 'AND' operator.

```php

$users = table('users')
    ->filter(['age' => 10, 'name' => 'John Doe'])
    ->all();

```

This might look familiar, however, the `filter` method ports us to the underlying QueryBuilder class, which allows us to chain more complex conditions and avails more methods.

Using filter, you can access methods such as `orderBy`, `group`, `limit`, `match`, `having`, `first`, `get`, `all` and many more.

```php
$users = table('users')
    ->filter(['age' => 10, 'name' => 'John Doe'])
    ->orderBy(['age' => 'DESC'])
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

$users = table('users')
    ->where($clause) // with where method
    ->all();

$users = table('users')
    ->filter($clause) // with filter method
    ->all();

$users = table('users')
    ->all($clause); // with all method

$users = table('users')
    ->first($clause); // with first method

$users = table('users')
    ->filter($clause) // with filter method that also defines more complex queries
    ->orderBy(['age' => 'DESC'])
    ->limit(10)
    ->startAt(5)
    ->all();
```

### AND Conditions

To add an 'AND' condition, you can use the `and` method.

```php

$clause = Where::builder()
    ->and(['age' => 10])
    ->and(['name' => 'John Doe'])
    ->build();
```

You can chain as many `and` methods as you want to add more conditions.

### OR Conditions

To add an 'OR' condition, you can use the `or` method.

```php

$clause = Where::builder()
    ->or(['age' => 10])
    ->or(['name' => 'John Doe'])
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
    ->and(['age' => 10])
    ->or(['name' => 'John Doe'])
    ->build();
```

You can chain as many `and` and `or` methods as you want to build more complex queries.

### Complex Relativity

You can also build more complex queries by nesting conditions.

```php

$clause = Where::builder()
    ->and(['age' => 10])
    ->or(
        Where::builder()
            ->and(['name' => 'John Doe'])
            ->or(['name' => 'Jane Doe'])
            ->and(['age' => 20])
            ->build()
    )
    ->build();

    // where age = 10 OR (name = 'John Doe' OR name = 'Jane Doe' AND age = 20)
```

You can nest as many conditions as you want to build more complex queries. This is where Porm shines!
