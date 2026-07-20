---
title: "Database migrations"
slug: "migrations"
description: "Grow Pionia Shop’s schema the same way on every laptop — with PHP migrations."
summary: "Tell the database a story: make:table, migrate, and change tables without fear."
date: 2026-07-20
lastmod: 2026-07-21
draft: false
weight: 810
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Database migrations — Pionia"
  description: "PHP migrations for Pionia: Schema::create, Blueprint columns, make:table, migrate, rollback, and many-to-many pivots."
  noindex: false
---

## Who this is for

Pionia Shop’s catalog should survive a laptop reboot — and the same tables should appear when a teammate clones the repo. You want a shared recipe for `products`, `customers`, and `orders`, not a one-off SQL file nobody remembers to run.

## What you will learn

- Create a table with `make:table` and apply it with `migrate`
- Describe columns in fluent PHP (`email()`, `nullable()`, foreign keys)
- Change, roll back, and (later) ship migrations from a package

## Before you start

{{< prerequisites >}}
- [Database configuration](/documentation/database/configuration-getting-started/) — `[db]` pointing at SQLite or PostgreSQL
- A Pionia Shop app from [Introduction](/documentation/getting-started/introduction/)
{{< /prerequisites >}}

## How it works

Think of each migration as a dated diary entry for the database: “on this day we created `products`.” Pionia keeps a list of which entries have already been applied, so `migrate` only runs what is new.

{{< mermaid >}}
flowchart LR
  Make["make:table products"] --> File["database/migrations/…"]
  File --> Migrate["php pionia migrate"]
  Migrate --> DB[("products table")]
  Migrate --> Diary["migrations table"]
{{< /mermaid >}}

{{< callout context="tip" title="One shared recipe" icon="outline/bulb" >}}
Apps include a `database/migrations/` folder. Scaffold with `make:table` (or the interactive `make:migration` wizard), then run `php pionia migrate`.
{{< /callout >}}

## Your first Pionia Shop table

Real-world story: Ada should see mugs in the catalog after you restart the server. That means a real `products` table — not an in-memory array.

{{< step >}}
**1. Scaffold the table**

```bash
php pionia make:table products \
  --columns="name:string,price:decimal,stock:integer" \
  --timestamps
```

Or run `php pionia make:migration` with no arguments and answer the wizard.
{{< /step >}}

{{< step >}}
**2. Review the generated file**

```php
<?php

use Pionia\Database\Blueprint;
use Pionia\Database\Migrations\Migration;
use Pionia\Database\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```
{{< /step >}}

{{< step >}}
**3. Run pending migrations**

```bash
php pionia migrate
php pionia migrate:status
```
{{< /step >}}

{{< try-it >}}
Create `customers` (`make:table customers --columns="email:email:unique,password_hash:string,name:string" --timestamps`), then `orders` with `customer_id:foreignId:customers`. Confirm both appear in `migrate:status`.
{{< /try-it >}}

## Daily commands

| Command | Purpose |
|---------|---------|
| `php pionia migrate` | Run pending migrations |
| `php pionia migrate:status` | Show applied vs pending |
| `php pionia migrate:rollback` | Undo the last batch |
| `php pionia migrate:fresh` | Drop all tables and re-run (SQLite; use `--force` on MySQL/PostgreSQL) |

### Makers

| Command | Alias | Purpose |
|---------|-------|---------|
| `make:migration` | `migrate:make` | Blank stub or interactive wizard |
| `make:table` | `migrate:make-table` | `Schema::create` stub |
| `make:migration:column` | `migrate:add-column` | Add columns |
| `make:migration:index` | `migrate:add-index` | Index / unique |
| `make:migration:foreign` | `migrate:add-foreign` | Foreign id |
| `make:pivot` | `make:migration:pivot` | Many-to-many pivot |

**Column DSL** (comma-separated on makers):

```text
email:email:unique,name:string,phone:phone:nullable,org_id:foreignId:orgs
```

## Fluent columns

Columns are **NOT NULL by default**. Chain modifiers in any order:

```php
$table->string('first_name')->nonNullable()->unique();
$table->string('middle_name')->nullable();
$table->email()->unique()->comment('Login identity');
$table->integer('age')->unsigned()->default(0);
$table->foreignId('org_id')->constrained('orgs')->cascadeOnDelete();
```

| Modifier | Purpose |
|----------|---------|
| `nullable()` / `nonNullable()` / `notNull()` / `required()` | NULL vs NOT NULL |
| `unique()` / `index()` / `primary()` | Indexes / keys |
| `default($v)` / `defaultsTo($v)` | Default value |
| `unsigned()` / `signed()` | Numeric sign |
| `length($n)` / `precision($p, $s)` | Size after the type call |
| `comment($text)` | Column comment (MySQL) |
| `after($col)` | Column order (MySQL) |
| `check($sql)` | CHECK constraint (`{column}` placeholder) |
| `useCurrent()` / `useCurrentOnUpdate()` | Timestamp defaults |
| `constrained()` | FK from `foreignId` |
| `change()` | Alter an existing column |

### Common types

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid');
    $table->ulid('ulid');
    $table->string('title', 120);
    $table->text('body')->nullable();
    $table->boolean('published')->default(false);
    $table->decimal('price', 10, 2);
    $table->json('meta')->nullable();      // JSON (PostgreSQL: JSON)
    $table->jsonb('attrs')->nullable();    // JSONB on PostgreSQL
    $table->enum('status', ['draft', 'live']);
    $table->timestamps();
    $table->softDeletes();
});
```

### Specialized fields

These add useful CHECK constraints at the database level — still validate in your services too.

```php
$table->email();           // VARCHAR(254) + email-like CHECK
$table->phone();           // VARCHAR(32)
$table->url('website');    // must start with http(s)://
$table->slug()->unique();
$table->ipAddress();
$table->macAddress();
$table->year('founded');
$table->money('price');    // DECIMAL(19,4)
$table->currency();        // length 3
$table->rememberToken();
$table->morphs('taggable'); // type + id
```

## Altering tables

```php
Schema::table('tasks', function (Blueprint $table) {
    $table->string('slug')->after('title'); // MySQL only
    $table->dropColumn('assignee');
    $table->renameColumn('body', 'content');
});

Schema::rename('posts', 'articles');
Schema::hasTable('tasks');
Schema::hasColumn('tasks', 'title');
Schema::raw('CREATE INDEX idx_tasks_status ON tasks (status)');
```

## Many-to-many (pivot tables)

```bash
php pionia make:pivot posts tags --timestamps
```

```php
Schema::manyToMany('posts', 'tags', function (Blueprint $table) {
    $table->string('role')->nullable(); // optional pivot data
}, timestamps: true);

Schema::dropManyToMany('posts', 'tags');
```

Creates `post_tag` with `post_id`, `tag_id`, a composite primary key, and cascade deletes.

## Configuration

`environment/settings.ini`:

```ini
[migrations]
PATH=database/migrations
TABLE=migrations
```

Drivers: **SQLite**, **MySQL/MariaDB**, and **PostgreSQL** via your `[db]` connection.

## Package / provider migrations

Composer packages can ship migrations by returning absolute directories from a provider:

```php
public function migrations(): array
{
    return [dirname(__DIR__) . '/database/migrations'];
}
```

`migrate` and `migrate:status` merge the app path with every registered provider path. Duplicate basenames raise `MigrationException`.

## Common mistakes

- **Running `migrate:fresh` on production MySQL/PostgreSQL** without `--force` — the command refuses; double-check the database name first.
- **Forgetting `down()`** — rollbacks need a matching drop or reverse alter.
- **Creating `products` before `projects` when using a foreign key** — migrate parent tables first, or make the FK nullable and add it later.
- **Treating Blueprint CHECKs as app validation** — still use `#[ValidateField]` / `rules()` in services.

## What's next

{{< card-grid >}}
{{< link-card title="Making queries" description="Read and write rows with table()." href="/documentation/database/making-queries/" >}}
{{< link-card title="Connections" description="Named connections and pooling." href="/documentation/database/connections/" >}}
{{< link-card title="CLI commands" description="Full migrate:* and make:* registry." href="/documentation/operations/commands/" >}}
{{< /card-grid >}}
