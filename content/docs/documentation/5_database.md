<!-- ---
title: "Database"
description: "Database querying using PORM - Pionia ORM"
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
--- -->


## Custom Queries

PORM also allows you to run custom queries. You can do this by calling the `raw` method. The `raw` method takes the SQL query as the first argument and the bindings as the second argument.

```php

use Porm\Porm;

$data = Porm::from('posts')->raw('select * from posts where id = :id', ['id' => 1]);

var_dump($data); // array of data
```

{{<callout context="note"  icon="outline/pencil">}}
In this raw queries, `from` is required to initialise the query but the passed table name is not used in the query.
{{</callout>}}

## Transactions

Handling transactions here can be done in two ways.

### Using the `inTransaction` method

You can start a transaction by calling the `inTransaction` method. The `inTransaction` method takes a closure as the first argument. The closure should contain the queries to run in the transaction.

```php {lineNos = true}

use Porm\Porm;

Porm::from("posts")->inTransaction(function() {
    Porm::from('posts')->save(['title' => 'Hello', 'content' => 'World']);
    Porm::from('posts')->save(['title' => 'Hello', 'content' => 'World']);
});
```

> Line `4` defines the table name but this is just a formality. The table name is not used in the transaction queries.

To access the data from the transaction outside the transaction, you can use the `use` keyword on the closure.

```php {lineNos = true}

use Porm\Porm;

$data = null;

Porm::from("posts")->inTransaction(function() use (&$data) {
    $data = Porm::from('posts')->save(['title' => 'Hello', 'content' => 'World']);
});

if ($data) {
    var_dump($data); // the saved object
}
```

This takes care of committing and rolling back of the transactions automatically.

### Using the pdo transactions

While the above method will do everything for you, we understand that you might want to have more control over the transactions. You can do this by using the `pdo` method.

```php

use Porm\Porm;

$posts = Porm::from('posts');

$posts->getDatabase()->pdo->beginTransaction();

// your queries here

$posts->getDatabase()->pdo->commit();

```

If you want to rollback the transaction, you can call the `rollBack` method.

```php

use Porm\Porm;

$posts = Porm::from('posts');

$posts->getDatabase()->pdo->beginTransaction();

// your queries here

$posts->getDatabase()->pdo->rollBack();

```

## Advanced Filtering

### Using the `where` method
You can perform advanced filters using the `where` method. You can chain as many of these as you want. You can use this method with both `all` and `get` methods.

```php

use Porm\Porm;


$data = Porm::from('posts')->where([id => 1])->all();


$data = Porm::from('posts')->where([age => 10])->where([name => 'Pionia'])->all();

var_dump($data); // array of data
```

All conditions that passed as array conditions are treated as `AND` conditions.

### Using the `filter` method

In Porm, whenever you call the `filter` you teleport to a new query builder that enables you to perform more complex queries.

```php

use Porm\Porm;

$data = Porm::from('posts')->filter([id => 10])->all();

var_dump($data); // array of data
```

### Using the `Where` Instance

You can also use the `Where` instance to perform more complex queries.

```php

use Porm\Porm;

$data = Porm::from('posts')
->filter(Where::builder()
  // add more conditions here
  ->build()
)->all();

var_dump($data); // array of data
```

Where.add() method can be used to add more conditions to the query.

```php

use Porm\Porm;

$data = Porm::from('posts')

->filter(Where::builder()
  ->add('id', 10)
  ->add('name', 'Pionia')
  ->build()
)->all();

var_dump($data); // array of data
```

The `add()` method can also take up an entire `Where` instance.

```php

use Porm\Porm;

$data = Porm::from('posts')

->filter(Where::builder()
  ->add('id' => 10)
  ->add('name' => 'Pionia')
  ->add(Where::builder()
    ->add('age' => 10)
    ->add('time' => '2023-06-13')
    ->build()
  )->build()
)->all();

// select * from posts where id = 10 and name = 'Pionia' and (age = 10 and time = '2023-06-13')

var_dump($data); // array of data
```

You can also use `or()` method to add `OR` conditions.

```php

use Porm\Porm;

$data = Porm::from('posts')

->filter(Where::builder()
  ->add('id' => 10)
  ->add('name' => 'Pionia')
  ->or(Where::builder()
    ->add('age' => 10)
    ->or('time' => '2023-06-13')
    ->build()
  )->build()
)->all();

// select * from posts where id = 10 and name = 'Pionia' or (age = 10 or time = '2023-06-13')

var_dump($data); // array of data
```

{{<callout context="tip"  icon="outline/book">}}
If you notice the return type of the build() method, it is an `array`. This makes this more powerful as you can pass the `Where` instance to other methods that accept an array of conditions.
{{</callout>}}

## Limit and Offset - Pagination

You can limit the number of results returned by using the `limit` method. The `limit` method takes the number of results to return as the first argument.

These are available on the `filter` method.

```php

use Porm\Porm;

$data = Porm::from('posts')->filter()->limit(10)->all();

var_dump($data); // array of data
```

You can also use the `startAt` method to skip the first `n` results.

```php

use Porm\Porm;

$data = Porm::from('posts')->filter()->limit(10)->startAt(10)->all();

var_dump($data); // array of data
```

## Order By

You can order the results by using the `orderBy` method. The `orderBy` method takes the column to order by as the first argument and the order as the second argument.


You can order in two ways:

By column name :-

```php

use Porm\Porm;

$data = Porm::from('posts')->filter()->orderBy('name')->all();

var_dump($data); // array of data
```

By one or more columns and the order :-

```php

use Porm\Porm;

$data = Porm::from('posts')
->filter()
->orderBy(['name' => 'DESC']) // any number of columns can be passed
->get();

var_dump($data); // array of data
```

## Grouping

You can group the results by using the `group` method. The `group` method takes the column(s) to group by as the first argument.

```php

use Porm\Porm;

$data = Porm::from('posts')
->filter()
->group('name')
->all();

var_dump($data); // array of data
```

You can also group by multiple columns.

```php

use Porm\Porm;

$data = Porm::from('posts')
->filter()
->group(['name', 'age'])
->all();

var_dump($data); // array of data
```

## Having

You can filter the grouped results by using the `having` method. The `having` method takes the column to filter by as the first argument and the condition as the second argument.

```php

use Porm\Porm;

$data = Porm::from('posts')->filter()
->group('name')
->having('age', 10)
->all();

var_dump($data); // array of data
```

You can also use any of the operators as the third argument.

```php

use Porm\Porm;

$data = Porm::from('posts')
->filter()
->group('name')
->having('age', 10, '>=')
->first();

var_dump($data); // array of data
```
