---
title: "Protecting actions with attributes"
slug: "protecting-actions"
description: "Lock Pionia Shop actions with #[Authenticated], #[Can], and #[CanAny]."
summary: "Declare who may create products or place orders — keep login public."
date: 2026-07-20
lastmod: 2026-07-21
draft: false
weight: 799
toc: true
doc_type: how-to
parent: "security"
seo:
  title: "Protect actions with #[Authenticated] and #[Can]"
  description: "Teaching guide to Pionia auth attributes for an online store."
  noindex: false
---

## Who this is for

Ada can browse `product.list` without an account. She should not be able to invent catalog items or place someone else’s order. You want those rules next to the method — not buried in copy-pasted `mustAuthenticate()` calls.

## What you will learn

- Lock one action or a whole service
- Leave `login` / `register` public with `except`
- Choose `#[Can]` (all permissions) vs `#[CanAny]` (any one)
- When a rule needs the order row itself (write a few lines of PHP)

## Before you start

{{< prerequisites >}}
- [JWT authentication](/documentation/security/jwt-authentication/) — Ada has a Bearer token after `customer.login`
{{< /prerequisites >}}

## How it fits together

{{< mermaid >}}
flowchart TD
  Req["POST product.create + Bearer"] --> Jwt[JwtAuthentication]
  Jwt -->|no user| E401[401]
  Jwt -->|user ok| Attr{"#[Authenticated] / #[Can]?"}
  Attr -->|missing permission| E403[403]
  Attr -->|ok| Body[createAction]
{{< /mermaid >}}

Pionia runs attributes **before** validation and before your method body. Anonymous callers never reach `table('products')->save()`.

## The three attributes

| Attribute | Plain English |
|-----------|----------------|
| `#[Authenticated]` | Must be logged in |
| `#[Can('product.manage')]` | Logged in **and** has this permission |
| `#[Can(['a', 'b'])]` | Needs **every** permission listed |
| `#[CanAny(['a', 'b'])]` | Needs **any one** permission |

Put permission slugs in the JWT when Ada logs in (`permissions` / `perms`). That is what `#[Can]` compares against.

## Scenario: public catalog, private create

```php
use Pionia\Auth\Attributes\Authenticated;

class ProductService extends Service
{
    // Anyone can browse
    protected function listAction(Arrayable $data): ApiResponse
    {
        return response(0, 'OK', ['products' => table('products')->all()]);
    }

    // Only signed-in staff/customers with access
    #[Authenticated]
    protected function createAction(Arrayable $data): ApiResponse
    {
        // save product …
    }
}
```

Try create **without** a token → **401**. With Ada’s token → success.

## Scenario: whole CustomerService, login stays open

```php
use Pionia\Auth\Attributes\Authenticated;
use Pionia\Auth\Attributes\Can;

#[Authenticated(except: ['login', 'register'])]
class CustomerService extends Service
{
    protected function loginAction(Arrayable $data): ApiResponse { /* public */ }

    protected function meAction(Arrayable $data): ApiResponse
    {
        return response(0, 'OK', ['user' => $this->auth()->user]);
    }

    #[Can('customer.admin')]
    protected function deactivateAction(Arrayable $data): ApiResponse { /* … */ }
}
```

`except` accepts the action name clients send (`login`) or `loginAction`.

## Scenario: checkout permissions

```php
use Pionia\Auth\Attributes\Can;
use Pionia\Auth\Attributes\CanAny;

#[Can('order.place')]
protected function placeAction(Arrayable $data): ApiResponse { /* … */ }

#[CanAny(['order.refund', 'admin'])]
protected function refundAction(Arrayable $data): ApiResponse { /* … */ }
```

## When attributes are not enough

“Only the customer who owns this order may cancel it” needs the row:

```php
#[Authenticated]
protected function cancelAction(Arrayable $data): ApiResponse
{
    $order = table('orders')->get($data->getInt('id'));
    if ((int) $order->customer_id !== (int) $this->auth()->user->id) {
        return response(403, 'You can only cancel your own orders');
    }
    // …
}
```

## Try it yourself

{{< try-it >}}
1. Put `#[Authenticated]` on `product.create` and confirm anonymous curls fail.
2. Wrap `CustomerService` with `except: ['login']` and confirm login still works.
3. Issue a token without `permissions`, then hit `#[Can('product.manage')]` — expect **403**.
{{< /try-it >}}

## Common mistakes

- Protecting `login` by accident
- Expecting `#[Can]` to invent permissions not present on the user
- Mixing `#[Can(['a','b'])]` (all) with `#[CanAny]` (any)

## What's next

{{< card-grid >}}
{{< link-card title="JWT authentication" description="Put permissions in the token." href="/documentation/security/jwt-authentication/" >}}
{{< link-card title="Tutorial Step 9" description="Wire login into Pionia Shop." href="/documentation/shop-tutorial/09-authentication/" >}}
{{< /card-grid >}}
