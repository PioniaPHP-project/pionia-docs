---
title: "Step 5 — Database setup"
slug: "05-database-setup"
description: "Create the products table with a migration."
summary: "make:table products + migrate"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 105
toc: true
doc_type: tutorial
tutorial_step: 5
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/04-project-layout/
tutorial_next: /documentation/shop-tutorial/06-list-from-database/
aliases:
  - /documentation/deskflow-tutorial/05-database-setup/
seo:
  title: "Pionia Shop tutorial — Step 5"
---

Hard-coded mugs disappear when the server restarts. Put the catalog in a **database** so Ada always sees the same products — on your laptop today, on a server tomorrow.

## What is a database migration? (in general)

A **database** is durable storage (rows in tables). Your PHP code reads and writes those rows; when the process dies, the data remains.

A **migration** is a versioned recipe that creates or changes tables:

- “Create `products` with name, price, stock”
- Later: “Add `customers`,” “Add `orders`”

Everyone who clones the repo runs `php pionia migrate` and gets the **same** schema. That beats emailing a `schema.sql` around.

Pionia Shop starts with SQLite (one file, zero install). Production often uses PostgreSQL or MySQL — same migration files.

## What you will learn

- Confirm `[db]` for SQLite
- Scaffold and run a `products` migration

{{< prerequisites >}}
- [Step 4](/documentation/shop-tutorial/04-project-layout/)
{{< /prerequisites >}}

## Confirm SQLite

In `environment/settings.ini`:

```ini
[db]
database_type=sqlite
database_name=database.sqlite3
default=true
```

## Create the products table

{{< terminal >}}
```bash
php pionia make:table products \
  --columns="name:string,price:decimal,stock:integer" \
  --timestamps
```
{{< /terminal >}}

Review the migration — you want something like:

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->decimal('price', 10, 2);
    $table->integer('stock')->default(0);
    $table->timestamps();
});
```

{{< terminal >}}
```bash
php pionia migrate
php pionia migrate:status
```
{{< /terminal >}}

Optional seed via `php pionia shell`:

```php
table('products')->save(['name' => 'Ada Mug', 'price' => 24.50, 'stock' => 12]);
table('products')->save(['name' => 'Pionia Sticker Pack', 'price' => 6.00, 'stock' => 200]);
```

Later you will add `customers`, `orders`, and `wallets` the same way. Full field reference: [Migrations](/documentation/database/migrations/).

## Common mistakes

- Forgetting `migrate` — Step 6 fails with “no such table: products”
- Running commands outside `pionia-shop/`

{{< tutorial-nav >}}
