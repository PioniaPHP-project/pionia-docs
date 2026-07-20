---
title: "Step 7 — Create products"
slug: "07-create-products"
description: "Add product.create and insert rows with table()->save()."
summary: "Staff add catalog items via the API"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 107
toc: true
doc_type: tutorial
tutorial_step: 7
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/06-list-from-database/
tutorial_next: /documentation/shop-tutorial/08-validation/
aliases:
  - /documentation/deskflow-tutorial/07-create-tasks/
  - /documentation/shop-tutorial/07-create-tasks/
seo:
  title: "Pionia Shop tutorial — Step 7"
---

A shop needs new inventory. Add **`product.create`** so staff can insert a row without opening a SQL console.

## What you will learn

- Implement `createAction` with `table('products')->save()`
- Confirm with a follow-up `product.list`

{{< prerequisites >}}
- [Step 6](/documentation/shop-tutorial/06-list-from-database/)
{{< /prerequisites >}}

## Add createAction

```php
protected function createAction(Arrayable $data): ApiResponse
{
    $id = table('products')->save([
        'name' => $data->get('name'),
        'price' => $data->get('price'),
        'stock' => $data->getInt('stock') ?? 0,
    ]);

    return response(0, 'Product created', ['id' => $id]);
}
```

## Try it

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"create","name":"Tote Bag","price":18.00,"stock":40}'
```

Then `product.list` again — the tote should appear. Step 8 adds validation so empty names are rejected cleanly.

## Common mistakes

- Passing `title` instead of `name` — match your column names
- Forgetting to cast/check stock — use `getInt` when you expect an integer

{{< tutorial-nav >}}
