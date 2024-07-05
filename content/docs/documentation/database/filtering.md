---
title: "Queries with Filtering"
description: "Commonly used queries in PORM."
summary: ""
date: 024-06-13 14:32:03.100 +0300
lastmod: 024-06-13 14:32:03.100 +0300
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

Also, for basic knowledge and understanding, please first look at the  [Making Queries Section](/documentation/database/making-queries)
{{</callout>}}

# Introduction

Sometimes, you need more than just fetching data from the database. You may need to filter the data based on certain conditions. This is where filtering comes in. Filtering allows you to specify conditions that the data must meet before it is returned.

In this section, we will look at how to filter data when querying the database using PORM.

## where

This method can be used to filter data based on a single 'AND' condition. This method can be used with all the other methods in the query builder.

```php
$users = Porm::from('users')->where(['age' => 10])->get();
```

You can chain as many `where` methods as you want to filter the data.

```php

$users = Porm::from('users')
    ->where(['age' => 10])
    ->where(['name' => 'John Doe'])
    ->all();

```

All conditions in the `where` method are joined by an 'AND' operator.

## filter

The `filter` method can be used to filter data based on multiple conditions. The conditions are joined by an 'AND' operator.

```php

$users = Porm::from('users')
    ->filter(['age' => 10, 'name' => 'John Doe'])
    ->all();

```

This might look familiar, however, the `filter` method ports us to the underlying QueryBuilder class, which allows us to chain more complex conditions and avails more methods.

Using filter, you can access methods such as `orderBy`, `group`, `limit`, `match`, `having`, `first`, `get`, `all` and many more.

```php
$users = Porm::from('users')
    ->filter(['age' => 10, 'name' => 'John Doe'])
    ->orderBy(['age' => 'DESC'])
    ->limit(10)
    ->startAt(5)
    ->all();
```

## Where Builder

Observing all our examples provided so far, we can notice that where conditions are passed as an array. With this builder, you can build a more complex query which will internally be converted to an array as shown in the examples above.

### Bulding

To start building, you need to first call the `builder` method on the `Where` class.

```php
$clause= Where::builder();
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

$users = Porm::from('users')
    ->where($clause) // with where method
    ->all();

$users = Porm::from('users')
    ->filter($clause) // with filter method
    ->all();

$users = Porm::from('users')
    ->all($clause); // with all method

$users = Porm::from('users')
    ->first($clause); // with first method

$users = Porm::from('users')
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
