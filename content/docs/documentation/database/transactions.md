---
title: "Transactions & Raw SQL"
slug: "transactions-and-raw-sql"
description: "inTransaction(), Piql::raw(), and safe SQL fragments."
summary: "Atomic writes and escaping the fluent builder."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 819
toc: true
parent: "database"
seo:
  title: "Porm transactions and raw SQL"
  description: "Run transactions and parameterized raw queries with Porm."
  canonical: ""
  noindex: false
---

## Transactions — `inTransaction()`

Wrap multiple statements in a single database transaction. Piql rolls back on any throwable.

```php
$saved = null;

table('system_user')->inTransaction(function ($porm) use (&$saved, $payload) {
    $saved = $porm->save($payload);
    table('audit_log')->save([
        'user_id' => $porm->lastSaved(),
        'action'  => 'register',
    ]);
});
```

The callback receives the same `Porm` instance; `$porm->database` is swapped to the transactional Piql handle for the duration of the closure.

Use a `use (&$var)` reference when you need values after the transaction completes.

## Full raw queries — `raw()`

```php
$stats = table('orders')->raw(
    'SELECT status, COUNT(*) AS c FROM orders GROUP BY status',
);

$one = table('orders')->raw(
    'SELECT * FROM orders WHERE id = :id LIMIT 1',
    ['id' => 42],
);
```

- One row → `object`
- Multiple rows → array
- Always use **bound parameters** for user input

## SQL fragments — `Piql::raw()`

Embed safe literal SQL inside WHERE arrays:

```php
use Pionia\Porm\Core\Piql;

table('posts')->filter([
    'published_at[<=]' => Piql::raw('CURRENT_TIMESTAMP'),
])->all();
```

`Raw` values are not escaped — only use for trusted SQL expressions, never for concatenated user input.

## Low-level Piql

`$porm->getDatabase()` returns `Pionia\Porm\Core\Piql` with Medoo-compatible methods (`select`, `insert`, `update`, `delete`, `query`, `action`, etc.). Prefer `table()` for application code; Piql is for debugging and framework extensions.

```php
$piql = table('users')->getDatabase();
$piql->debug();  // echo generated SQL
$piql->log();    // return query log array
```

## Exceptions

Database errors surface as `Pionia\Porm\Exceptions\BaseDatabaseException` or `Pionia\Exceptions\DatabaseException`. Uncaught errors in HTTP apps flow through the [exception pipeline](/documentation/exceptions/).

Related: [Making queries](/documentation/database/making-queries/) · [WHERE DSL](/documentation/database/where-dsl/).
