---
title: "Step 6 — List products from the database"
slug: "06-list-from-database"
description: "Replace the hard-coded array with table('products')->all()."
summary: "Porm read for the catalog"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 106
toc: true
doc_type: tutorial
tutorial_step: 6
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/05-database-setup/
tutorial_next: /documentation/shop-tutorial/07-create-products/
aliases:
  - /documentation/deskflow-tutorial/06-list-from-database/
seo:
  title: "Pionia Shop tutorial — Step 6"
---

Wire the catalog to SQLite so Ada sees real rows.

## What you will learn

- Read with `table('products')->all()`
- Return rows inside the Moonlight envelope

{{< prerequisites >}}
- [Step 5](/documentation/shop-tutorial/05-database-setup/) — `products` table exists
{{< /prerequisites >}}

## Update listAction

```php
protected function listAction(Arrayable $data): ApiResponse
{
    $products = table('products')->all();
    return response(0, 'OK', ['products' => $products]);
}
```

## Verify

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"list"}'
```

If you seeded in Step 5, you should see the mug and sticker pack. More query patterns: [Making queries](/documentation/database/making-queries/).

## Common mistakes

- Still seeing hard-coded data — save the file and confirm you removed the PHP array
- Empty list — re-run seed inserts or `migrate` if the SQLite file was deleted

{{< tutorial-nav >}}
