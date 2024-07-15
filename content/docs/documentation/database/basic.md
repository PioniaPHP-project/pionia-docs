---
title: "Making Queries"
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
{{</callout>}}

## Introduction

Under this section, we will look at how to make queries to the database using the PORM - Pionia ORM. Queries are used to interact with the database and retrieve data. PORM provides a set of tools and conventions that make it easy to interact with the database in PHP.

## Retrieving Data

You can retrieve a single item from the database or multiple items at ago. In Porm, not all methods query the database. Some methods are used to build the query and return the query object.

### Retrieving a Single Item

To retrieve a single item from the database, you can use the `get` method. This method returns an object or `NULL` if no matching record is found.

```php

use Porm\Porm;

Porm::from('users')->get(1); // select * from users where id = 1

```

If the an integer or string is provided for the `get` method, it is assumed to be the primary key of the table. If an array is provided, it is assumed to be the where clause.

You can also provide an integer or string and determine the column name to use as the primary key.

```php

use Porm\Porm;

Porm::from('users')->get(1, 'user_id'); // select * from users where user_id = 1

```

Conditions can also be provided as an array. The array should contain the column name as the `key` and the value as the `value`. This is one way of building a where clause.

```php

use Porm\Porm;

$data = Porm::from('users')->get(['user_id' => 1, 'age' => 10]); // select * from users where user_id = 1 and age = 10

```

All array conditions passed to the `get` method are joined by `AND`.

`$data` will contain the object or `NULL` if no matching record is found.

{{<callout context="note"  icon="outline/pencil">}}
  The `get` method queries the database. So you should always call the `get` method last.
{{</callout>}}

### Fetching multiple records

To fetch all data from the table, you can use the `all` method. This method, just like the `get` method, can take up array conditions and also queries the database. Therefore, you should always call the `all` method last.

```php

use Porm\Porm;

$data = Porm::from('posts')->all();

var_dump($data); // array of data
```

You can also specify the columns to fetch by using the `columns` method. This is useful when you only need specific columns from the table and can be used before all methods that query the database.

```php
use Porm\Porm;

$data = Porm::from('posts')->columns('id', 'title')->all();

var_dump($data); // array of data
```

You can filter the data by providing the array of conditions to the `all` method just like we did with the `get` method.

```php

use Porm\Porm;

$data = Porm::from('posts')->all(['id' => 1]); // select * from posts where id = 1

var_dump($data); // array of data
```

The `all` method unlike the `get` method, returns an array of data or an empty array if no matching record is found.

### Random Records

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

{{<callout context="note"  icon="outline/pencil">}}
  The `random` method queries the database. So you should always call the `random` method last. Also, if you query one item, random will return an object, but if you define length greater than one, it will return an array.
{{</callout>}}

### Inserting Data

To insert data into the table, you can use the `save` method. The `save` method takes an array of data to insert into the table and __returns the saved object__.

```php

use Porm\Porm;

$data = Porm::from('posts')->save(['title' => 'Hello', 'content' => 'World']);

var_dump($data); // the saved object
```

{{<callout context="note"  icon="outline/pencil">}}
  The `save` method hits the database. So you should always call the `save` method last.
{{</callout>}}

### Updating Data

To update data in the table, you can use the `update` method. The `update` method takes an array of data to update in the table and the condition to filter the data on.

This method returns a `PDOStatement` object. You can get the number of rows affected by calling the `rowCount` method on the returned object.

```php

use Porm\Porm;

$data = Porm::from('posts')
->update(['title' => 'Hello', 'content' => 'World'], ['id' => 1]);
// update posts set title = 'Hello', content = 'World' where id = 1

var_dump($data->rowCount()); // the number of rows affected
```

{{<callout context="note"  icon="outline/pencil">}}
  The `update` method hits the database. So you should always call the `update` method last.
{{</callout>}}

### Deleting Data

To delete data from the table, you can use the `delete` method. The `delete` method takes the condition to filter the data on.

This method returns a `PDOStatement` object. You can get the number of rows affected by calling the `rowCount` method on the returned object.

```php

use Porm\Porm;

$data = Porm::from('posts')->delete(['id' => 1]);

var_dump($data->rowCount()); // the number of rows affected
```

This method can also be used to delete all data from the table that matches the condition. Passing an empty array will delete all data from the table.

```php

use Porm\Porm;

$data = Porm::from('posts')->deleteAll([]);

var_dump($data->rowCount()); // the number of rows affected
```

The two methods `delete` and `deleteAll` do exactly the same thing. `deleteAll` is just an alias for `delete`.

You can also delete data based on the primary key id.

```php

use Porm\Porm;

$id = 2
$data = Porm::from('posts')->deleteById($id); // delete from posts where id = 2

var_dump($data->rowCount());
```

## Has Data

To check if data exists in the table, you can use the `has` method. The `has` method takes the condition to filter the data on.

This method returns a boolean value.

```php

use Porm\Porm;

$data = Porm::from('posts')->has(['id' => 1]);

var_dump($data); // true or false
```

{{<callout context="note"  icon="outline/pencil">}}
  The `has` method queries the database. So you should always call the `has` method last.
{{</callout>}}

Passing a string to `has` queries the database for the primary key id.

```php

use Porm\Porm;

$id = '123'
$data = Porm::from('posts')->has($id);

var_dump($data); // true or false
```

## Raw Queries

Before we dive into complex database querying, Let's first look at a basic raw query mechanism that porm presents to us. This can be 
handy especially when you think that the query you need, is not supported by porm by default. However, overusing this feature can
somehow mean you are not using porm well.

```php

use Porm\Porm;

$data = Porm::rawQuery('select * from posts where id = 1');
```

If the `$data` above comprises one item, then the result will be an object. If it comprises of multiple items, then the result will be an array.

You can also pass conditions to the `rawQuery` method.

```php

use Porm\Porm;

$data = Porm::rawQuery('select * from posts where id = :id', ['id' => 1]);
```
