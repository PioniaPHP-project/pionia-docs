---
title: "Step 9 — Authentication"
slug: "09-authentication"
description: "What login and tokens are, then protect Pionia Shop writes with JWT."
summary: "Prove who Ada is; keep catalog browse public"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 109
toc: true
doc_type: tutorial
tutorial_step: 9
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/08-validation/
tutorial_next: /documentation/shop-tutorial/10-middleware/
aliases:
  - /documentation/deskflow-tutorial/09-authentication/
seo:
  title: "Pionia Shop tutorial — Step 9 (Authentication)"
---

Anyone on the internet can browse mugs. **Creating products** and **placing orders** should only work for someone the shop recognizes — Ada after she logs in, or a staff account that manages the catalog.

This step teaches what “authentication” means in any web app, then wires it for Pionia Shop with a JWT.

## What is authentication? (in general)

Two related ideas get mixed up. Keep them separate:

| Word | Plain English | Shop example |
|------|---------------|--------------|
| **Authentication** | *Who are you?* | Ada proves email + password |
| **Authorization** | *What may you do?* | Staff may `product.create`; Ada may `order.place` |

Without authentication, every request is anonymous. Your API cannot tell “Ada” from “a random bot.”

### Sessions vs tokens (big picture)

Browsers historically used **cookies + server sessions**: “remember this browser.” Mobile apps and SPAs often use **tokens**: after login, the server returns a string; the client sends it on later calls as `Authorization: Bearer …`.

Pionia Shop uses the **token** style with a **JWT** (JSON Web Token): a signed blob that carries Ada’s id (and optional permissions) so the server does not need to look up a session row on every request.

```text
1. Ada → customer.login (email + password)
2. API → { "token": "eyJ…" }
3. Ada → order.place + header Authorization: Bearer eyJ…
4. API verifies signature → knows it is Ada → runs the action
```

If the token is missing or invalid, protected actions return **401**. If the token is fine but she lacks a permission, you return **403** (authorization).

## How Pionia Shop uses it

1. Configure a signing secret (`JWT_SECRET`).
2. Register `JwtAuthentication` so Bearer tokens are read automatically.
3. Implement `customer.login` to issue a token with `jwt_encode()`.
4. Mark write actions with `#[Can('product.manage')]` for staff-only catalog writes.

## What you will learn

- Configure `JWT_SECRET` and register `JwtAuthentication`
- Implement `customer.login` with `jwt_encode()`
- Protect `product.create` while leaving `product.list` public

{{< prerequisites >}}
- [Step 8](/documentation/shop-tutorial/08-validation/)
{{< /prerequisites >}}

## Configure JWT

{{< step >}}
**1. Secret in `.env`**

In `environment/.env`:

```env
JWT_SECRET=paste-a-long-random-value
JWT_TTL=3600
```

Generate a secret in the shell:

```bash
php pionia shell
# then: secure_random_hex(32);
```

Never commit a real secret. Local `.env` stays on your machine.
{{< /step >}}

{{< step >}}
**2. Register the authentication backend**

In `environment/settings.ini`:

```ini
[app_authentications]
jwt = "Pionia\Auth\JwtAuthentication"
```

This tells Pionia: “on each request, look for a Bearer JWT and attach the user when it is valid.”
{{< /step >}}

## Create two local accounts

Create a table with a server-controlled role. A shopper can place orders; staff can also manage the catalog.

```bash
php pionia make:table customers --columns="email:string:unique,password_hash:string,role:string"
php pionia migrate
php pionia shell
```

Run each of these lines in the Pionia shell, then type `exit`. These accounts are for your local tutorial database only:

```php
table('customers')->save(['email' => 'ada@pionia.shop', 'password_hash' => hash_password('shopper-local-demo'), 'role' => 'customer']);
table('customers')->save(['email' => 'staff@pionia.shop', 'password_hash' => hash_password('staff-local-demo'), 'role' => 'staff']);
```

Run the inserts once: `email` is unique. A future registration action should always assign `customer` on the server. Never accept a role or permission list from a registration or login payload.

## CustomerService login

{{< terminal >}}
```bash
php pionia make:service Customer
```
{{< /terminal >}}

Choose **Basic** when prompted. Replace the generated `services/CustomerService.php` with:

```php {title="services/CustomerService.php"}
<?php

namespace Application\Services;

use Pionia\Auth\Attributes\Authenticated;
use Pionia\Collections\Arrayable;
use Pionia\Exceptions\UserUnauthenticatedException;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;
use Pionia\Validations\Attributes\Validated;

#[Authenticated(except: ['login'])]
class CustomerService extends Service
{
    #[Validated(rules: ['email' => 'required|email', 'password' => 'required|string'])]
    protected function loginAction(Arrayable $data): ApiResponse
    {
        $customer = table('customers')
            ->filter(['email' => $data->get('email')])
            ->get();

        if (!$customer || !verify_password($data->get('password'), $customer->password_hash)) {
            throw new UserUnauthenticatedException('Invalid credentials');
        }

        $permissions = $customer->role === 'staff'
            ? ['product.manage', 'order.place']
            : ['order.place'];

        $token = jwt_encode([
            'sub' => $customer->id,
            'email' => $customer->email,
            'permissions' => $permissions,
        ]);

        return response(0, 'Logged in', ['token' => $token]);
    }
}
```

Add `use Application\Services\CustomerService;` to `switches/MainSwitch.php`, then add `'customer' => CustomerService::class` to the array returned by `registerServices()`.

`except: ['login']` keeps login public. Throwing `UserUnauthenticatedException` produces HTTP 401; `response(401, ...)` alone would only set the envelope's `returnCode`. JWT permissions come from the stored role, not the request.

## Protect catalog writes

Keep the validation from Step 8 and require the catalog permission. Add these imports once, above the `ProductService` class:

```php
use Pionia\Auth\Attributes\Can;
use Pionia\Validations\Attributes\Validated;
```

Replace `createAction` with:

```php
#[Can('product.manage')]
#[Validated(rules: [
    'name' => 'required|string|min:2',
    'price' => 'required|numeric',
    'stock' => 'integer|min:0',
])]
protected function createAction(Arrayable $data): ApiResponse
{
    $product = table('products')->save([
        'name' => $data->get('name'),
        'price' => $data->get('price'),
        'stock' => $data->getInt('stock') ?? 0,
    ]);

    return response(0, 'Product created', ['id' => $product->id]);
}
```

`#[Can]` also requires authentication: no token produces HTTP 401; a shopper token without `product.manage` produces HTTP 403.

Leave `listAction` without the attribute so guests can still browse.

## Try the flow

```bash
# 1) log in as staff
curl -i -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"customer","action":"login","email":"staff@pionia.shop","password":"staff-local-demo"}'

# 2) create with token (paste token from step 1)
curl -i -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service":"product","action":"create","name":"Cap","price":15,"stock":20}'
```

Try create **without** the header — you should get HTTP **401**. Then log in with `ada@pionia.shop` and `shopper-local-demo`, and repeat create with Ada's token — expect HTTP **403**. The staff token should succeed with `returnCode: 0` and a scalar `returnData.id`.

Permissions are captured when the token is issued. Changing a stored role does not rewrite existing tokens; sign in again to test role changes. Plan token expiry or revocation before using this pattern in production.

More depth: [JWT authentication](/documentation/security/jwt-authentication/) and [Protecting actions](/documentation/security/protecting-actions/).

## Common mistakes

- Protecting `login` by accident — keep it in `except`
- Forgetting `[app_authentications]` — tokens never attach a user
- Putting the password in the JWT — never; only ids / permissions
- Confusing 401 (not logged in) with 403 (logged in but not allowed)

{{< tutorial-nav >}}
