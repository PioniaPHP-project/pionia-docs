---
title: "Connections"
description: "ConnectionManager, pooling, and multiple databases."
summary: "settings.ini sections, connect vs open, RoadRunner workers."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 818
toc: true
parent: "database"
seo:
  title: "Porm connections"
  description: "Configure and pool database connections in Pionia."
  canonical: ""
  noindex: false
---

## ConnectionManager

`connectionManager()` returns a process-scoped pool (`Pionia\Porm\ConnectionManager`). Each named connection opens **once** per PHP process and is reused across HTTP requests (FPM) or RoadRunner worker iterations.

```php
$pdo = connectionManager()->connection('default');
connectionManager()->connection('db_pgsql');
```

Helpers:

| Method | Purpose |
|--------|---------|
| `connection($name)` | Get or create pooled `Connection` |
| `register($name, $connection)` | Inject a connection (tests, custom DSN) |
| `disconnect($name?)` | Drop pooled handle(s) — worker shutdown only |
| `has($name)` | Whether a pool entry exists |

{{<callout context="note" icon="outline/information-circle">}}
Do **not** call `disconnect()` between HTTP requests in FPM or RoadRunner. PDO stays alive for performance; only disconnect on worker shutdown.
{{</callout>}}

## `Connection::connect()` vs `open()`

| API | Pooling | Typical use |
|-----|---------|-------------|
| `Connection::connect('default')` | Yes — via `connectionManager()` | Application code, `table()` |
| `Connection::open([...])` | No — new instance | Tests, one-off configs |

`table('users', null, 'db_pgsql')` resolves the third argument through the manager:

1. Registered name (`register()`)
2. `settings.ini` section (`[db_pgsql]`)
3. Inline config array (hashed key in the pool)

## Configuration discovery

At boot, Pionia scans `environment/settings.ini` for sections that define both a driver (`database_type` / `type`) and `database_name` / `database`. Mark one section with `default = 1`.

```ini
[db]
database_type = sqlite
database_name = database.sqlite3
default = 1

[db_pgsql]
database_type = pgsql
database_name = myapp
host = 127.0.0.1
username = app
port = 5432
; Password — use environment/.env (see below), not a committed literal
```

```env
# environment/.env (gitignored)
DB_PGSQL_PASSWORD=your-local-password
```

Wire the password into `settings.ini` via your bootstrap or read `env('DB_PGSQL_PASSWORD')` when building the connection in tests. **Never commit real database credentials** to the repository or copy them from documentation examples.

Pass the **section name** to `table()`:

```php
table('events', null, 'db_pgsql')->all();
```

## Tests

Register an in-memory SQLite connection without touching `settings.ini`:

```php
use Pionia\Porm\Driver\Connection;

$conn = Connection::open([
    'type' => 'sqlite',
    'database' => ':memory:',
    'allow_object_cast' => false,  // default — see security note below
]);
connectionManager()->register('default', $conn);
```

## RoadRunner

Workers boot once; `ConnectionManager` keeps PDO open. On shutdown, the framework may call `connectionManager()->disconnect()` — do not replicate that per request.

## Connection info

```php
table('users')->info(); // driver metadata from Piql
```

Query logging: set `logging` on the connection section or `LOG_QUERIES=true` in the environment.

### `[Object]` column casts

Selecting `payload[Object]` runs `unserialize()` on the column value. This is **disabled by default**. Enable only for trusted data:

```ini
[db]
allow_object_cast = 1
```

Or per connection: `Connection::open([..., 'allow_object_cast' => true])` / `PORM_ALLOW_OBJECT_CAST=true`.

Related: [Getting started](/documentation/database/configuration-getting-started/) · [RoadRunner](/documentation/operations/roadrunner/).
