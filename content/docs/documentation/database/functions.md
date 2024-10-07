---
title: "Using Functions - Aggregation"
description: "Database querying using PORM - Pionia ORM"
summary: ""
date: 24-06-14 09:28:27.396 +0300
lastmod: 24-06-14 09:28:27.396 +0300
draft: false
weight: 810
toc: true
seo:
  title: "Ponia Porm Database" # custom title (optional)
  description: "Querying the database using the PORM - Pionia ORM." # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

{{<callout context="tip"  icon="outline/pencil">}}
This section assumes you have alredy completed configuring the database from the [Configuration Section](/documentation/database/configuration-getting-started).

Also, for basic knowledge and understanding, please first look at the [Making Queries Section](/documentation/database/making-queries)
{{</callout>}}

# Introduction

This section covers database functions that can be used to aggregate data in the database. Aggregation functions are used to perform calculations on the data in the database.
These functions can be used to calculate the sum, average, minimum, maximum, and count of the data in the database.

## Inbuilt Aggregation Functions

Some common aggregation functions have already been implemented in PORM. These functions can be used to perform calculations on the data in the database directly.

### count

The `count` function is used to count the number of records in the database. This function can be used to count the number of records in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->count(); // select count(*) from users
```

You can also provide a column name to count the number of records in the database that have a value in the specified column.

```php

use Porm\Porm;

Porm::from('users')->count('age'); // select count(age) from users
```

You can also provide conditions to count the number of records in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->count('age', ['age' => 10]); // select count(*) from users where age = 10
```

The `count` function returns the number of records in the database that meet the specified conditions.

### sum

The `sum` function is used to calculate the sum of the values in a column in the database. This function can be used to calculate the sum of the values in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->sum('age'); // select sum(age) from users
```

You can also provide conditions to calculate the sum of the values in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->sum('age', ['age' => 10]); // select sum(age) from users where age = 10
```

The `sum` function returns the sum of the values in the column in the database that meet the specified conditions.

{{<callout context="note"  icon="outline/pencil">}}

All methods that take in a condition can be called after the "where" method. This is because the "where" method is used to build the where clause for the query.

{{</callout>}}

### avg

The `avg` function is used to calculate the average of the values in a column in the database. This function can be used to calculate the average of the values in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->avg('age'); // select avg(age) from users
```

You can also provide conditions to calculate the average of the values in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->avg('age', ['age' => 10]); // select avg(age) from users where age = 10
```

The `avg` function returns the average of the values in the column in the database that meet the specified conditions.

### max

The `max` function is used to calculate the maximum value in a column in the database. This function can be used to calculate the maximum value in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->max('age'); // select max(age) from users
```

You can also provide conditions to calculate the maximum value in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->max('age', ['age' => 10]); // select max(age) from users where age = 10
```

The `max` function returns the maximum value in the column in the database that meet the specified conditions.

### min

The `min` function is used to calculate the minimum value in a column in the database. This function can be used to calculate the minimum value in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->min('age'); // select min(age) from users
```

You can also provide conditions to calculate the minimum value in a column in the database that meet certain conditions.

```php

use Porm\Porm;

Porm::from('users')->min('age', ['age' => 10]); // select min(age) from users where age = 10
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

use Porm\database\aggregation\Agg;

$agg = Agg::builder()
// add here your aggregation functions
    ->build();
```

Agg builder comes with a number of methods that can be used to build the aggregation query. They include

### random

```php

use Porm\database\aggregation\Agg;

$agg = Agg::builder()
    ->random('name', 'names') // rand(names) as names
    ->build();
```

### avg

```php

use Porm\database\aggregation\Agg;

$agg = Agg::builder()
    ->avg('age', 'average_age') // avg(age) as average_age
    ->build();
```

### compare

Compare the value of two columns in the database. In comparison we use operators like `=`, `>`, `<`, `!=`.

```php

use Porm\database\aggregation\Agg;

$agg = Agg::builder()
    ->columnsCompare('price', '>', '10') // age > 10
    ->build();
```

### like

Used to add a like condition to a query

```php

$user = Porm::from("todos")
          ->get(Agg::builder()
                ->like('title', $name)
                ->build()
          );

          // select * from todos where title like '%$name%'

```

### notLike

Used to add a not like condition to a query

```php

$user = Porm::from("todos")
          ->get(Agg::builder()
                ->notLike('title', $name)
                ->build()
          );

          // select * from todos where title not like '%$name%'

```

### div

Used to divide a column by a certain value in the database

```php

$user = Porm::from("todos")
            ->get(Agg::builder()
                ->div('total', 5)
                ->build()
            );

// select total/5 from todos
```

### between

Adds a between check on a column. It checks if the value of the given column is between two given points.

```php

$results = Porm::from("todos")
    ->where(Agg::builder()
        ->between('id', [1, 10])
        ->build()
    )->all();

// select * from todos where id between 1 and 10
```

### notBetween

Checks if the value of the given column is `not between` the given points.

```php
$results = Porm::from("todos")
    ->where(Agg::builder()
        ->notBetween('id', [1, 10])
        ->build()
    )->all();

```

### jsonified

Jsonify the given value and assigns it to the given column.

```php

Porm::from("todos")
            ->filter(Agg::builder()
                ->jsonified('someAlias', ['x'=>1, 'y'=>5])
                ->build()
            )->all();

// select JSON('x', 1, 'y', 5) as someAlias from todos

```

### of

Multiplies a column by a certain value in the database

```php

Porm::from("todos")
            ->filter(Agg::builder()
                ->of('age', 10)
                ->build()
            )->all();

// select someAlias*10 from todos

```

### minus

Subtracts a column by a certain value in the database

```php

Porm::from("todos")
            ->filter(Agg::builder()
                ->minus('age', 10)
                ->build()
            )->all();

// select someAlias-10 from todos

```

### plus

Adds a column by a certain value in the database

```php

Porm::from("todos")
            ->filter(Agg::builder()
                ->plus('age', 10)
                ->build()
            )->all();

// select someAlias+10 from todos

```

### eq

Opposite of eq. Checks if the value of the given column is `equal` to the given value.

```php

Porm::from("todos")
            ->filter(Agg::builder()
                ->eq('age', 10)
                ->build()
            )->all();

// select someAlias=10 from todos

```

### neq

Opposite of eq. Checks if the value of the given is `not equal` to the given value.

```php

Porm::from("todos")
            ->filter(Agg::builder()
                ->neq('age', 10)
                ->build()
            )->all();

// select someAlias!=10 from todos

```

### now

Assigns the current timestamp to the given alias or column.

```php

Porm::from("todos")
        ->update(Agg::builder()->now("updated_at")->build(), 1); // update todos set updated_at = now() where id =1

```

### lt

Check if the column value is `less than` the given value.

```php
Porm::from("todos")
    ->where(Agg::builder()->lt('age', 20)->build())
    ->all();
```

### lte

Checks if the column value is `less than or equal` to the given value.

```php

Porm::from("todos")
    ->where(Agg::builder()->lte('age', 20)->build())
    ->all();

```

### gt

Checks if the column value is `greater than` the given value.

```php

Porm::from("todos")
            ->where(Agg::builder()->gt('age', 20)->build())
            ->all();
```

### gte

Checks if the column value is `greater than or equal` the given value.

```php

Porm::from("todos")
            ->where(Agg::builder()->gte('age', 20)->build())
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

$agg = Agg::builder()->max('maxAge', 'age')->build() // MAX(age) as maxAge

```

### min()

Gets the minimum value of the given column and assigns it to the given alias

```php

$agg = Agg::builder()->min('maxAge', 'age')->build() // MIN(age) as maxAge

```

### sum()

Gets the sum of the given column and assigns it to the given alias.

```php

$agg = Agg::builder()->sum('maxAge', 'age')->build() // SUM(age) as maxAge

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
    ->gte('age', 10)
    ->build();

    // name ~ '^d' and age >= 10
```
