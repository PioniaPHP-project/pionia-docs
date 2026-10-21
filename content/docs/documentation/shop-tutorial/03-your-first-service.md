---
title: "Step 3 — Your first service"
slug: "03-your-first-service"
description: "Add ProductService with a hard-coded product.list."
summary: "make:service Product → curl the catalog"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 103
toc: true
doc_type: tutorial
tutorial_step: 3
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/02-dev-server-and-ping/
tutorial_next: /documentation/shop-tutorial/04-project-layout/
aliases:
  - /documentation/deskflow-tutorial/03-your-first-service/
seo:
  title: "Pionia Shop tutorial — Step 3"
---

Ada wants to see what the shop sells. Start with a **hard-coded catalog** — no database yet — so you learn how an API “endpoint” maps to PHP in Pionia.

## What is a service? (in general)

In many APIs you write **controllers** and many URL routes (`GET /products`, `POST /products`, …).

Pionia’s Moonlight style is different but the idea is the same: **a place for business behavior**.

| Idea | In Pionia Shop |
|------|----------------|
| A **service** | A PHP class for one area of the shop (`ProductService`, later `OrderService`) |
| An **action** | One operation clients ask for (`list`, `create`, `place`) |
| The **switch** | A registry: `"product"` → `ProductService` |

Clients always `POST` to `/api/v1/` with JSON like:

```json
{ "service": "product", "action": "list" }
```

Pionia looks up `product`, calls `listAction`, and returns a JSON envelope. You are not inventing a new URL for every button.

## What you will learn

- Scaffold `ProductService`
- Map `listAction` to `"action": "list"`
- Register the `product` alias on `MainSwitch`

{{< prerequisites >}}
- [Step 2](/documentation/shop-tutorial/02-dev-server-and-ping/) — server running
{{< /prerequisites >}}

## Generate ProductService

{{< terminal >}}
```bash
php pionia make:service Product
```
{{< /terminal >}}

Choose **Basic** when prompted. Replace the generated `listAction` in `services/ProductService.php`; keep its existing `Arrayable` and `ApiResponse` imports.

```php
protected function listAction(Arrayable $data): ApiResponse
{
    $products = [
        ['id' => 1, 'name' => 'Ada Mug', 'price' => 24.50, 'stock' => 12],
        ['id' => 2, 'name' => 'Pionia Sticker Pack', 'price' => 6.00, 'stock' => 200],
    ];

    return response(0, 'OK', ['products' => $products]);
}
```

In `switches/MainSwitch.php`, add the import above the class:

```php
use Application\Services\ProductService;
```

Add the alias to the array returned by `registerServices()`:

```php
'product' => ProductService::class,
```

## Try the catalog

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"list"}'
```

You should see both products in `returnData`. Later steps replace the array with `table('products')`.

## Common mistakes

- Forgetting to register `product` on the switch — you get “service not found”
- Naming the method `list` instead of `listAction`

{{< tutorial-nav >}}
