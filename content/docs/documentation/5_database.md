---
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
---

{{<callout context="tip"  icon="outline/pencil">}}
This section assumes you have already set up your project and have already gone through the [Api Tutorial](/documentation/api-tutorial/) guide atleast.
{{</callout>}}

## Introduction.

Pionia uses PORM (Pionia ORM) to interact with the database. PORM is a simple and lightweight ORM that is built on top of the [medoo framework](https://medoo.in/). PORM provides a set of tools and conventions that make it easy to interact with the database in PHP. PORM is designed to be simple, lightweight, and easy to use.

## Installation

If you want to check out PORM alone or want to use it outside the Pionia framework, you can install it via composer.

```bash
composer require pionia/porm
```

{{<callout context="note"  icon="outline/pencil">}}
If you are using Pionia, you do not need to install PORM separately. PORM is already included in the Pionia framework.
{{</callout>}}

## Configuration

Configuring PORM is simple. All you need is the settings.ini file in the root of your project. The settings.ini file should contain the following:

```ini
[db]
database =
username =
type =
host =
password =
port =
```

See the [medoo database configuration](https://medoo.in/api/new) for all the available options.

{{<callout context="note"  icon="outline/pencil">}}
If you are using Pionia, you do not need to configure PORM separately. PORM is already configured in the Pionia framework.
{{</callout>}}

### Multiple Database Connections

If you want to connect to multiple databases, you can do so by adding the database connection settings to the `settings.ini` file. You can then specify the database connection to use when querying the database.

```ini
; other settings

[db]
database =
username =
type =
host =
password =
port =

[db2]
database =
username =
type =
host =
password =
port =

; other settings

```

You can then specify the database connection to use when querying the database.

```php
use Porm\Porm;

Porm::from('posts')->using('db2'); // will connect to the db2 database
```

By default, PORM will use the default database connection(db) to query the database.

## Usage

PORM does not rely on models to interact with the database. Instead, you get to interact with the database directly. This comes with a lot of flexibility and simplicity. Porm also interacts with both new and existing databases.

All Queries originate from the `Porm` instance. Here is an example of how to interact with the database using PORM.

### Determining the target table

All queries start by determining the target table. This is done by calling the `from` method on the `Porm` instance. The `from` method takes the table name as the first argument. The table name must match the table name in the database.

```php
use Porm\Porm;

Porm::from('posts');
```

You can also alias the table name by passing the alias as the second argument.

```php
use Porm\Porm;

Porm::from('posts', 'p');
```

You can also define the connection to use at this point.

```php
use Porm\Porm;
# will connect to the db2 database
Porm::from('posts', 'p', 'db2');
```

### Defining the columns

To select specific columns from the table, you can use the `columns` method. This method should be called after the `from` method.

```php
use Porm\Porm;

Porm::from('posts')->columns('id', 'title');
```

This method can be used with all the other methods below.

## Making Queries

All the above methods do not return any data. They only set the query parameters. To get the data, you need to continue chaining the methods below.

Under this section we will look at how to select data from the database. We can select all data, specific columns, or even filter the data.

### Selecting All Data

To select all data from the table, you can use the `all` method.

```php

use Porm\Porm;

$data = Porm::from('posts')->all();

var_dump($data); // array of data
```

### Selecting Specific Columns

To select specific columns from the table, you can use the `columns` method.

```php
use Porm\Porm;

$data = Porm::from('posts')->columns('id', 'title')->all();

var_dump($data); // array of data
```

### Filtering Data on 'all' method

You can filter the data by providing the array of conditions as an array to the `all` method.

```php

use Porm\Porm;

$data = Porm::from('posts')->all(['id' => 1]); // select * from posts where id = 1

var_dump($data); // array of data
```

Passing an array of multiple items will filter the data based on the `AND` condition.

```php

use Porm\Porm;

$data = Porm::from('posts')->all(['id' => 1, 'title' => 'Hello']); // select * from posts where id = 1 and title = 'Hello'

```

All the above methods can be used with the `get` method. The `get` method is used to get one item from the table.

### Get one item from the table

To get one item from the table, you can use the `get` method. `get` unlike `all` returns an object of data.

If a string or interger is passed, the `get` method will filter the data based on the primary key. In most cases this is the `id` column.

```php

use Porm\Porm;

$id =1;

$data = Porm::from('posts')->get($id); // select * from posts where id = 1;

var_dump($data); // object of data
```

However, you might want to define the column to filter the data on. You can do this by passing the second argument to the `get` method as the name of the column to filter the data on.

```php

use Porm\Porm;

$id =1;

$data = Porm::from('posts')->get($id, 'code'); // select * from posts where code = 1

var_dump($data); // object of data
```

You can also pass an array of `AND` conditions to the `get` method.

```php

use Porm\Porm;

$data = Porm::from('posts')->get(['id' => 1, 'title' => 'Hello']); // select * from posts where id = 1 and title = 'Hello' limit 1

var_dump($data); // object of data
```

### Getting random data

To get random data from the table, you can use the `random` method. The `random` method takes the number of results to return as the first argument.

```php

use Porm\Porm;

$data = Porm::from('posts')->random(10);

var_dump($data); // array of data
```

You can also pass an array of conditions to the `random` method.

```php

use Porm\Porm;

$data = Porm::from('posts')->random(10, ['name' => 'Pionia']);

var_dump($data); // array of data
```

To get just one random item, you can pass 1 or ignore the length.

```php

use Porm\Porm;

$data = Porm::from('posts')->random();

var_dump($data); // object of data
```

### Inserting Data

To insert data into the table, you can use the `save` method. The `save` method takes an array of data to insert into the table and returns the saved object.

```php

use Porm\Porm;

$data = Porm::from('posts')->save(['title' => 'Hello', 'content' => 'World']);

var_dump($data); // the saved object
```

### Updating Data

To update data in the table, you can use the `update` method. The `update` method takes an array of data to update in the table and the condition to filter the data on.

This method returns a `PDOStatement` object. You can get the number of rows affected by calling the `rowCount` method on the returned object.

```php

use Porm\Porm;

$data = Porm::from('posts')->update(['title' => 'Hello', 'content' => 'World'], ['id' => 1]);

var_dump($data->rowCount()); // the number of rows affected
```

### Deleting Data

To delete data from the table, you can use the `delete` method. The `delete` method takes the condition to filter the data on.

This method returns a `PDOStatement` object. You can get the number of rows affected by calling the `rowCount` method on the returned object.

```php

use Porm\Porm;

$data = Porm::from('posts')->delete(['id' => 1]);

var_dump($data->rowCount()); // the number of rows affected
```

This method can also be used to delete all data from the table.

```php

use Porm\Porm;

$data = Porm::from('posts')->deleteAll([]);

var_dump($data->rowCount()); // the number of rows affected
```

The two methods `delete` and `deleteAll` do exactly the same thing.

You can also delete data based on the primary key.

```php

use Porm\Porm;

$id = 2
$data = Porm::from('posts')->deleteById($id);

var_dump($data->rowCount());
```

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
