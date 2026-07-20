---
title: "Using Functions - Aggregation"
slug: "using-functions-aggregation"
description: "count, sum, avg, and the Agg builder."
summary: "Table-level aggregates and Agg expressions."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 816
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm — aggregation"
  description: "count, sum, avg, and the Agg builder in Pionia v3."
  canonical: ""
  noindex: false
---

This guide is for **Pionia Shop** dashboards and reports — counting open tasks per project, summing story points, and building HAVING clauses for **Pionia Shop** on port **8000**.

## What you will learn

- Run `count`, `sum`, `avg`, `min`, and `max` on `products` and `projects`
- Chain conditions before terminal aggregate methods
- Build complex filters with the `Agg` builder

{{< prerequisites >}}
- [Configuration](/documentation/database/configuration-getting-started/) — `[db]` for Pionia Shop
- [Making queries](/documentation/database/making-queries/) — terminal methods on `table()`
{{< /prerequisites >}}

## How it works

```text
table('products')  →  count / sum / avg  →  single scalar result
table('products')  →  filter(Agg::builder()->…->build())  →  rows or aggregates
```

{{<callout context="note" icon="outline/information-circle">}}
v3 uses `table()` and namespaces under `Pionia\Porm\`. Examples below use `table('products')` and `table('customers')`.
{{</callout>}}

# Introduction

This section covers database functions that can be used to aggregate data in the database. Aggregation functions are used to perform calculations on the data in the database.
These functions can be used to calculate the sum, average, minimum, maximum, and count of the data in the database.

## Inbuilt Aggregation Functions

Some common aggregation functions have already been implemented in PORM. These functions can be used to perform calculations on the data in the database directly.

### count

The `count` function is used to count the number of records in the database. This function can be used to count the number of records in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->count(); // select count(*) from tasks
```

You can also provide a column name to count the number of records in the database that have a value in the specified column.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->count('priority'); // select count(priority) from tasks
```

You can also provide conditions to count the number of records in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->count('priority', ['priority' => 10]); // select count(*) from tasks where priority = 10
```

The `count` function returns the number of records in the database that meet the specified conditions.

### sum

The `sum` function is used to calculate the sum of the values in a column in the database. This function can be used to calculate the sum of the values in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->sum('priority'); // select sum(priority) from tasks
```

You can also provide conditions to calculate the sum of the values in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->sum('priority', ['priority' => 10]); // select sum(priority) from tasks where priority = 10
```

The `sum` function returns the sum of the values in the column in the database that meet the specified conditions.

{{<callout context="note"  icon="outline/pencil">}}

All methods that take in a condition can be called after the "where" method. This is because the "where" method is used to build the where clause for the query.

{{</callout>}}

### avg

The `avg` function is used to calculate the average of the values in a column in the database. This function can be used to calculate the average of the values in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->avg('priority'); // select avg(priority) from tasks
```

You can also provide conditions to calculate the average of the values in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->avg('priority', ['priority' => 10]); // select avg(priority) from tasks where priority = 10
```

The `avg` function returns the average of the values in the column in the database that meet the specified conditions.

### max

The `max` function is used to calculate the maximum value in a column in the database. This function can be used to calculate the maximum value in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->max('priority'); // select max(priority) from tasks
```

You can also provide conditions to calculate the maximum value in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->max('priority', ['priority' => 10]); // select max(priority) from tasks where priority = 10
```

The `max` function returns the maximum value in the column in the database that meet the specified conditions.

### min

The `min` function is used to calculate the minimum value in a column in the database. This function can be used to calculate the minimum value in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->min('priority'); // select min(priority) from tasks
```

You can also provide conditions to calculate the minimum value in a column in the database that meet certain conditions.

```php

use Pionia\Porm\Database\Aggregation\Agg;

table('products')->min('priority', ['priority' => 10]); // select min(priority) from tasks where priority = 10
```

The `min` function returns the minimum value in the column in the database that meet the specified conditions.

{{<callout context="note"  icon="outline/pencil">}}

All the above methods query the database and return the result. Therefore, you should always call these methods last.

{{</callout>}}

## Using the Agg Builder

We have also put aside a builder class that can be used to build more complex aggregation queries. The `Agg builder` comes with a number of methods to cover your aggregation needs.

### Initializing the Agg Builder

To initialize the `Agg builder`, you can use the `builder` method.

You must finally call the `build` method to get the actually build your generated aggregates.

```php

use Pionia\Porm\Database\Aggregation\Agg;

$agg = Agg::builder()
// add here your aggregation functions
    ->build();
```

Agg builder comes with a number of methods that can be used to build the aggregation query. They include

### random

```php

use Pionia\Porm\Database\Aggregation\Agg;

$agg = Agg::builder()
    ->random('name', 'names') // rand(names) as names
    ->build();
```

### avg

```php

use Pionia\Porm\Database\Aggregation\Agg;

$agg = Agg::builder()
    ->avg('priority', 'average_priority') // avg(priority) as average_priority
    ->build();
```

### compare

Compare the value of two columns in the database. In comparison we use operators like `=`, `>`, `<`, `!=`.

```php

use Pionia\Porm\Database\Aggregation\Agg;

$agg = Agg::builder()
    ->columnsCompare('story_points', '>', '10') // story_points > 10
    ->build();
```

### like

Used to add a like condition to a query

```php

$user = table("products")
          ->get(Agg::builder()
                ->like('title', $name)
                ->build()
          );

          // select * from tasks where title like '%$name%'

```

### notLike

Used to add a not like condition to a query

```php

$user = table("products")
          ->get(Agg::builder()
                ->notLike('title', $name)
                ->build()
          );

          // select * from tasks where title not like '%$name%'

```

### div

Used to divide a column by a certain value in the database

```php

$user = table("products")
            ->get(Agg::builder()
                ->div('total', 5)
                ->build()
            );

// select total/5 from tasks
```

### between

Adds a between check on a column. It checks if the value of the given column is between two given points.

```php

$results = table("products")
    ->where(Agg::builder()
        ->between('id', [1, 10])
        ->build()
    )->all();

// select * from tasks where id between 1 and 10
```

### notBetween

Checks if the value of the given column is `not between` the given points.

```php
$results = table("products")
    ->where(Agg::builder()
        ->notBetween('id', [1, 10])
        ->build()
    )->all();

```

### jsonified

Jsonify the given value and assigns it to the given column.

```php

table("products")
            ->filter(Agg::builder()
                ->jsonified('someAlias', ['x'=>1, 'y'=>5])
                ->build()
            )->all();

// select JSON('x', 1, 'y', 5) as someAlias from tasks

```

### of

Multiplies a column by a certain value in the database

```php

table("products")
            ->filter(Agg::builder()
                ->of('priority', 10)
                ->build()
            )->all();

// select someAlias*10 from tasks

```

### minus

Subtracts a column by a certain value in the database

```php

table("products")
            ->filter(Agg::builder()
                ->minus('priority', 10)
                ->build()
            )->all();

// select someAlias-10 from tasks

```

### plus

Adds a column by a certain value in the database

```php

table("products")
            ->filter(Agg::builder()
                ->plus('priority', 10)
                ->build()
            )->all();

// select someAlias+10 from tasks

```

### eq

Opposite of eq. Checks if the value of the given column is `equal` to the given value.

```php

table("products")
            ->filter(Agg::builder()
                ->eq('priority', 10)
                ->build()
            )->all();

// select someAlias=10 from tasks

```

### neq

Opposite of eq. Checks if the value of the given is `not equal` to the given value.

```php

table("products")
            ->filter(Agg::builder()
                ->neq('priority', 10)
                ->build()
            )->all();

// select someAlias!=10 from tasks

```

### now

Assigns the current timestamp to the given alias or column.

```php

table("products")
        ->update(Agg::builder()->now("updated_at")->build(), 1); // update tasks set updated_at = now() where id =1

```

### lt

Check if the column value is `less than` the given value.

```php
table("products")
    ->where(Agg::builder()->lt('priority', 20)->build())
    ->all();
```

### lte

Checks if the column value is `less than or equal` to the given value.

```php

table("products")
    ->where(Agg::builder()->lte('priority', 20)->build())
    ->all();

```

### gt

Checks if the column value is `greater than` the given value.

```php

table("products")
            ->where(Agg::builder()->gt('priority', 20)->build())
            ->all();
```

### gte

Checks if the column value is `greater than or equal` the given value.

```php

table("products")
            ->where(Agg::builder()->gte('priority', 20)->build())
            ->all();
```

### uuid

This can be used in two ways. The first way is where a uuid is provided and the other way is where you want to sign a unique random uuid to a column.

```php

$agg = Agg::builder()->uuid('code')->build() // code = uuid()

// or with an existing one.

$agg = Agg::builder()->uuid('code', $myCoolUuid)->build() // code = '$myCoolUuid'

```

### max()

Gets the maximum value of the given column and assigns it to the given alias

```php

$agg = Agg::builder()->max('maxPriority', 'priority')->build() // MAX(priority) as maxPriority

```

### min()

Gets the minimum value of the given column and assigns it to the given alias

```php

$agg = Agg::builder()->min('minPriority', 'priority')->build() // MIN(priority) as minPriority

```

### sum()

Gets the sum of the given column and assigns it to the given alias.

```php

$agg = Agg::builder()->sum('totalPoints', 'story_points')->build() // SUM(story_points) as totalPoints

```

### regex

If all above don't work for you, you can use this aggregation function to provide your own regular expression that the db should check against.

```php

$agg = Agg::builder()->regex('name', '^d')->build() // name ~ '^d'

```

## Chaining multiple

You can chain as many aggregations as you with till you call the `build()` method.

```php

$agg = Agg::builder()
    ->regex('name', '^d')
    ->gte('priority', 10)
    ->build();

    // name ~ '^d' and priority >= 10
```

## Common mistakes

- **Chaining methods after `count()` or `sum()`** — aggregates execute immediately; start a new `table('products')` chain for the next query.
- **Using `count('priority')` when you mean `count()` with a WHERE** — non-null column counts differ from row counts on Pionia Shop boards.
- **Building Agg regex from client input** — never pass unsanitized search strings into `Agg::builder()->regex()`.
- **Forgetting `build()` on Agg chains** — incomplete clauses silently produce empty WHERE arrays in `ProductService`.

## What's next

{{< card-grid >}}
{{< link-card title="WHERE DSL" description="Operators Agg complements." href="/documentation/database/where-dsl/" >}}
{{< link-card title="Pagination" description="total_count for list endpoints." href="/documentation/database/pagination/" >}}
{{< link-card title="API reference" description="Aggregate method signatures." href="/documentation/database/api-reference/" >}}
{{< /card-grid >}}
