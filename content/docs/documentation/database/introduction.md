---
title: "Configuration - Getting Started"
slug: "configuration-getting-started"
description: "Configure Porm and start querying with table()."
summary: "settings.ini, connections, table aliases, and Piql."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 811
toc: true
parent: "database"
seo:
  title: "Porm configuration"
  description: "Database configuration and getting started with Porm in Pionia v3."
  canonical: ""
  noindex: false
---

{{<callout context="tip" icon="outline/pencil">}}
Complete the [API tutorial](/documentation/api-tutorial/) first if you are new to Pionia.
{{</callout>}}

## What is Porm?

**Porm** is Pionia's database access layer. It exposes a fluent API similar to [Medoo](https://medoo.in/) with prepared statements under the hood.

- No Eloquent-style models — query tables directly.
- Works with new or legacy schemas.
- Included in every Pionia app — use `table()` / `db()` from day one.

## Entry points

| Helper | Returns | Purpose |
|--------|---------|---------|
| `table($name, $alias, $connection)` | `Pionia\Porm\Core\Porm` | Primary API |
| `db(...)` | same as `table()` | Alias |
| `connectionManager()` | `ConnectionManager` | Pooled PDO per process |

```php
table('users');                           // default connection
table('users', 'u');                      // users AS u
table('users', null, 'db_pgsql');         // section name from settings.ini
```

`Db::table()` and `Db::from()` exist on `Pionia\Porm\Database\Db` but apps should prefer the global helpers.

## Configuration (`settings.ini`)

Database sections are auto-discovered when they define a driver + database name. Example `environment/settings.ini`:

```ini
[db]
database_type = "sqlite"
database_name = "database.sqlite3"
default = 1

[db_pgsql]
database_type = "pgsql"
database_name = "myapp"
username = "app"
host = "localhost"
port = 5432
; Store DB_PASSWORD in environment/.env — do not commit real credentials
```

```env
# environment/.env (gitignored)
DB_PASSWORD=your-local-password
```

### Recognized keys

| Key | Aliases | Notes |
|-----|---------|-------|
| `database_type` | `type` | `mysql`, `pgsql`, `sqlite`, `mssql`, `oracle`, `sybase` |
| `database_name` | `database` | Database name or SQLite file path |
| `host` | `server` | |
| `username`, `password`, `port`, `socket` | | |
| `charset`, `collation`, `prefix` | | Table prefix in SQL |
| `default` | `default=1` | Marks the default connection |
| `logging` | | Per-connection query logging |
| `testMode` | | Skip real PDO (tests) |
| `pdo` | | Inject an existing `PDO` instance |

Environment overrides: `LOG_QUERIES` / `SHOW_QUERIES` enable logging on the connection.

## Supported databases

| Driver | PHP extension |
|--------|----------------|
| `mysql` / MariaDB | `pdo_mysql` |
| `pgsql` | `pdo_pgsql` |
| `sqlite` | `pdo_sqlite` |
| `mssql` | `pdo_sqlsrv` or `pdo_dblib` |
| `oracle` | `pdo_oci` |
| `sybase` | `pdo_dblib` |

## Multiple connections

Register sections as `[db]`, `[db_pgsql]`, etc. Pass the **section name** (without brackets) as the third argument to `table()`:

```php
table('posts', null, 'db_pgsql')->get(1);
```

See [Connections](/documentation/database/connections/) for pooling, `Connection::connect()` vs `open()`, and RoadRunner workers.

## Table & columns

```php
table('posts', 'p')
    ->columns(['p.id', 'p.title'])
    ->filter(['published' => 1])
    ->all();
```

Column alias in SELECT: `column_name(alias)` — e.g. `'st.name(title)'` returns `title` in the result.

Type casts on read: suffix `[Int]`, `[Bool]`, `[JSON]`, `[Object]` on column names (use `[Object]` only with trusted data).

## Last insert ID & debugging

```php
$porm = table('posts');
$porm->save(['title' => 'Hello']);
$id = $porm->lastSaved();   // or Piql::id() via getDatabase()

$sql = $porm->lastQuery();    // last interpolated SQL string
$piql = $porm->getDatabase(); // low-level Piql engine (advanced)
```

## Piql (advanced)

`$porm->getDatabase()` returns `Pionia\Porm\Core\Piql`. Application code should use `table()` chains; Piql is for framework contributors and debugging (`debug()`, `log()`).

Next: [Making queries](/documentation/database/making-queries/).
