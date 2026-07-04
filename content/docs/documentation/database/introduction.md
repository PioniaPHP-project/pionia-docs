---
title: "Configuration - Getting Started"
slug: "configuration-getting-started"
description: "Configure Porm and start querying with table()."
summary: "settings.ini, connections, table aliases, and Piql."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 811
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm configuration"
  description: "Database configuration and getting started with Porm in Pionia v3."
  canonical: ""
  noindex: false
---

This guide is for **Northwind Studio** developers wiring **DeskFlow**'s database layer before `TaskService` and `MemberService` touch real rows. You will configure `[db]` in `settings.ini`, then query `tasks`, `projects`, and `team_members` with `table()` on port **8000**.

## What you will learn

- Register default and named connections in `environment/settings.ini`
- Call `table()`, `db()`, and `connectionManager()` from DeskFlow services
- Use table aliases and column casts when listing Northwind data

{{< prerequisites >}}
- [API tutorial](/documentation/deskflow-tutorial/) — DeskFlow services before persistence
- [Database index](/documentation/database/) — Porm overview and guide map
{{< /prerequisites >}}

## How it works

```text
environment/settings.ini  →  [db] section discovered at boot
        ↓
connectionManager()  →  pooled PDO per process
        ↓
table('tasks')  →  Porm  →  Piql (prepared statements)
```

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
table('tasks');                           // default connection
table('tasks', 't');                      // tasks AS t
table('tasks', null, 'db_pgsql');         // section name from settings.ini
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
database_name = "deskflow"
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
table('projects', null, 'db_pgsql')->get(1);
```

See [Connections](/documentation/database/connections/) for pooling, `Connection::connect()` vs `open()`, and RoadRunner workers.

## Table & columns

```php
table('tasks', 't')
    ->columns(['t.id', 't.title'])
    ->filter(['status' => 'open'])
    ->all();
```

Column alias in SELECT: `column_name(alias)` — e.g. `'p.name(project_name)'` returns `project_name` in the result.

Type casts on read: suffix `[Int]`, `[Bool]`, `[JSON]`, `[Object]` on column names (use `[Object]` only with trusted data).

## Last insert ID & debugging

```php
$porm = table('tasks');
$porm->save(['title' => 'Ship DeskFlow v1', 'project_id' => 1]);
$id = $porm->lastSaved();   // or Piql::id() via getDatabase()

$sql = $porm->lastQuery();    // last interpolated SQL string
$piql = $porm->getDatabase(); // low-level Piql engine (advanced)
```

## Piql (advanced)

`$porm->getDatabase()` returns `Pionia\Porm\Core\Piql`. Application code should use `table()` chains; Piql is for framework contributors and debugging (`debug()`, `log()`).

Next: [Making queries](/documentation/database/making-queries/).

## Common mistakes

- **Committing `DB_PASSWORD` to git** — keep credentials in `environment/.env` for alex@northwind.studio's local DeskFlow setup.
- **Using `Db::from()` in services** — global `table()` is the supported entry point in v3.
- **Forgetting `default = 1` on `[db]`** — without a default section, `table('tasks')` has nowhere to connect.
- **Passing the bracketed section name** — use `'db_pgsql'`, not `'[db_pgsql]'`, as the third `table()` argument.

## What's next

{{< card-grid >}}
{{< link-card title="Making queries" description="get, save, update on tasks." href="/documentation/database/making-queries/" >}}
{{< link-card title="Connections" description="Pooling under RoadRunner." href="/documentation/database/connections/" >}}
{{< link-card title="Filtering" description="Builder mode after filter()." href="/documentation/database/queries-with-filtering/" >}}
{{< /card-grid >}}
