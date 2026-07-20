---
title: "Step 8 — Validation"
slug: "08-validation"
description: "What input validation is, why shops need it, and #[Validated] on product.create."
summary: "Check the payload before you trust it"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 108
toc: true
doc_type: tutorial
tutorial_step: 8
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/07-create-products/
tutorial_next: /documentation/shop-tutorial/09-authentication/
aliases:
  - /documentation/deskflow-tutorial/08-validation/
seo:
  title: "Pionia Shop tutorial — Step 8 (Validation)"
---

A staff member (or a buggy client) posts `product.create` with an empty name and `price: "abc"`. If you insert that row, the catalog breaks and reports lie. **Validation** stops bad data at the door — before your `save()` runs.

## What is validation? (in general)

**Validation** means: “Does this input look acceptable?” before you use it.

| Check | Why it matters in a shop |
|-------|---------------------------|
| Required fields | No product without a `name` |
| Types | Price must be a number, not `"cheap"` |
| Ranges | Stock cannot be `-5` |
| Formats | Email must look like an email |

This is **not** authentication (who you are). A logged-in user can still send garbage. Validation protects your database and gives the client a clear **422** (“fix this”) instead of a vague **500**.

In many frameworks you declare rules next to the action. Pionia does the same with `#[Validated]`.

## What you will learn

- Attach `#[Validated]` to `createAction`
- See HTTP **422** when rules fail

{{< prerequisites >}}
- [Step 7](/documentation/shop-tutorial/07-create-products/)
{{< /prerequisites >}}

## Add rules

```php
use Pionia\Validations\Attributes\Validated;

#[Validated(rules: [
    'name' => 'required|string|min:2',
    'price' => 'required|numeric',
    'stock' => 'integer|min:0',
])]
protected function createAction(Arrayable $data): ApiResponse
{
    // same save() as Step 7 — only runs if rules pass
}
```

Pionia runs these rules **before** your method body. Failed rules never reach `table('products')->save(...)`.

## Try a bad payload

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"create","name":"","price":"abc"}'
```

Expect **422** and a clear message about `name` / `price`. Full rule catalog: [Validation](/documentation/building-api/validation/).

## Common mistakes

- Validating only in the frontend — always validate again on the server
- Using validation for “is this Ada’s order?” — that is authorization (next step)
- Assuming `numeric` allows empty string — combine with `required`

{{< tutorial-nav >}}
