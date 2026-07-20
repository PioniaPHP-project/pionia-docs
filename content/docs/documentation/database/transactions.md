---
title: "Transactions & Raw SQL"
slug: "transactions-and-raw-sql"
description: "inTransaction(), Piql::raw(), and safe SQL fragments."
summary: "Atomic writes and escaping the fluent builder."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 819
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm transactions and raw SQL"
  description: "Run transactions and parameterized raw queries with Porm."
  canonical: ""
  noindex: false
---

This guide covers atomic **Pionia Shop** writes — creating a task and audit log in one transaction — plus parameterized raw SQL when the fluent builder is not enough. **Pionia Shop** uses these patterns on port **8000** when `ProductService` must stay consistent across tables.

## What you will learn

- Wrap multi-table writes in `inTransaction()`
- Run full queries with `raw()` and bound parameters
- Embed trusted SQL fragments via `Piql::raw()` in WHERE arrays

{{< prerequisites >}}
- [Making queries](/documentation/database/making-queries/) — `save()`, `update()`, and `raw()`
- [WHERE DSL](/documentation/database/where-dsl/) — array conditions and operators
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart TD
  Begin[BEGIN] --> Save1[save task]
  Save1 --> Save2[save audit row]
  Save2 --> Commit[COMMIT]
  Save1 -->|throw| Rollback[ROLLBACK]
  Save2 -->|throw| Rollback
{{< /mermaid >}}

## Transactions — `inTransaction()`

Wrap multiple statements in a single database transaction. Piql rolls back on any throwable.

```php
$saved = null;

table('customers')->inTransaction(function ($porm) use (&$saved, $payload) {
    $saved = $porm->save($payload);
    table('products')->save([
        'assignee_id' => $porm->lastSaved(),
        'title'       => 'Onboard new member',
        'project_id'  => 1,
    ]);
});
```

The callback receives the same `Porm` instance; `$porm->database` is swapped to the transactional Piql handle for the duration of the closure.

Use a `use (&$var)` reference when you need values after the transaction completes.

## Full raw queries — `raw()`

```php
$stats = table('products')->raw(
    'SELECT status, COUNT(*) AS c FROM tasks GROUP BY status',
);

$one = table('products')->raw(
    'SELECT * FROM tasks WHERE id = :id LIMIT 1',
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

table('products')->filter([
    'completed_at[<=]' => Piql::raw('CURRENT_TIMESTAMP'),
])->all();
```

`Raw` values are not escaped — only use for trusted SQL expressions, never for concatenated user input.

## Low-level Piql

`$porm->getDatabase()` returns `Pionia\Porm\Core\Piql` with Medoo-compatible methods (`select`, `insert`, `update`, `delete`, `query`, `action`, etc.). Prefer `table()` for application code; Piql is for debugging and framework extensions.

```php
$piql = table('products')->getDatabase();
$piql->debug();  // echo generated SQL
$piql->log();    // return query log array
```

## Exceptions

Database errors surface as `Pionia\Porm\Exceptions\BaseDatabaseException` or `Pionia\Exceptions\DatabaseException`. Uncaught errors in HTTP apps flow through the [exception pipeline](/documentation/http/exceptions/).

Related: [Making queries](/documentation/database/making-queries/) · [WHERE DSL](/documentation/database/where-dsl/).

## Common mistakes

- **Concatenating `$data->getString('title')` into raw SQL** — always bind named parameters in Pionia Shop search endpoints.
- **Using `Piql::raw()` for user-supplied dates or IDs** — only trusted SQL functions like `CURRENT_TIMESTAMP`.
- **Calling `table()` inside a transaction with a different connection** — both statements must share the transactional `$porm` or default pool.
- **Swallowing throwables inside `inTransaction()`** — let exceptions bubble so Piql rolls back task + audit writes together.

## What's next

{{< card-grid >}}
{{< link-card title="Making queries" description="Prefer fluent CRUD when possible." href="/documentation/database/making-queries/" >}}
{{< link-card title="Exceptions" description="Database errors in HTTP responses." href="/documentation/http/exceptions/" >}}
{{< link-card title="Connections" description="PDO pooling across requests." href="/documentation/database/connections/" >}}
{{< /card-grid >}}
