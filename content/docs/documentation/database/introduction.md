---
title: "Configuration - Getting Started"
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
This section assumes you have already set up your project and have already gone through the [Api Tutorial](/documentation/api-tutorial/) guide atleast.
{{</callout>}}

## Introduction

Pionia uses PORM to interact with the database. Porm is a simple and lightweight QueryBuilder that is built on top of the [medoo framework](https://medoo.in/). Porm provides a set of tools and conventions that make it easy to interact with the database in PHP. PORM is designed to be simple, lightweight, and easy to use.

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

## Supported Databases

1. Postgres (PostgreSQL) via the `pgsql` driver
2. MySQL/MariaDB via the `mysql` driver
3. Oracle via the `oci` driver
4. Sybase via the `dblib` driver
5. MSSQL via the `sqlsrv` or `dblib` driver
6. SQLite via the `sqlite` driver

Please remember to install the necessary PHP extensions for the database you are using in order to connect to the database. This usually happens in the `php.ini` file.

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

### Accessing the Underlying Medoo Instance

If you need to access the underlying Medoo instance, you can do so by calling the `getDatabase` method on the Porm class.

```php

use Porm\Porm;

$instance = Porm::from('posts');
//other queries here

$database = $instance->database; // returns the Medoo instance

// this is also similar to
$database = $instance->getDatabase(); // returns the Medoo instance
```

The `$database` variable will contain the Medoo instance, which you can use to interact with the database directly availing every method medoo provides.

## Getting the last inserted ID

To get the last inserted ID after inserting a record into the database, you can call the `lastId` method on the Porm class.

```php

use Porm\Porm;

$instance = Porm::from('posts');

$instance->save([
    'title' => 'My Post',
    'content' => 'This is my post content'
  ]);
// other queries here
$lastId = $instance->lastId();
```

The `$lastId` variable will contain the last inserted ID.

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

As of `v1.0.2`, You can achieve the above using the `table` method. This method is exactly the same as the `from` method however it is more readable.

```php

use Porm\Porm;

Porm::table('posts', 'p');
```

You can also define the connection to use at this point.

```php
use Porm\Porm;
# will connect to the db2 database
Porm::from('posts', 'p', 'db2');

# or

Porm::table('posts', 'p', 'db2');
```

### Defining the columns

To select specific columns from the table, you can use the `columns` method. This method should be called on the `Porm` instance.

```php
use Porm\Porm;

Porm::from('posts')->columns('id', 'title');

# or

Porm::table('posts')->columns(['id', 'title']);
```

This can used whether getting one or multiple records.
