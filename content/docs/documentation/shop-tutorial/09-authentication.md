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
4. Mark write actions with `#[Authenticated]` (or `#[Can(...)]` for permissions).

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

## CustomerService login

You need a place to store shoppers. Scaffold a `customers` table (email + password_hash), migrate, and store passwords with `hash_password()` when someone registers.

{{< terminal >}}
```bash
php pionia make:service Customer
```
{{< /terminal >}}

```php
use Pionia\Auth\Attributes\Authenticated;

#[Authenticated(except: ['login', 'register'])]
class CustomerService extends Service
{
    protected function loginAction(Arrayable $data): ApiResponse
    {
        $customer = table('customers')
            ->filter(['email' => $data->get('email')])
            ->get();

        if (!$customer || !verify_password($data->get('password'), $customer->password_hash)) {
            return response(401, 'Invalid credentials');
        }

        $token = jwt_encode([
            'sub' => $customer->id,
            'email' => $customer->email,
            'permissions' => ['product.manage', 'order.place'],
        ]);

        return response(0, 'Logged in', ['token' => $token]);
    }
}
```

Register `'customer' => CustomerService::class` on `MainSwitch`.

`except: ['login', 'register']` keeps those actions **public** — otherwise Ada could never log in.

## Protect catalog writes

```php
use Pionia\Auth\Attributes\Authenticated;
// or #[Can('product.manage')] when you care about permissions

#[Authenticated]
protected function createAction(Arrayable $data): ApiResponse
{
    // same save as Step 7–8
}
```

Leave `listAction` without the attribute so guests can still browse.

## Try the flow

```bash
# 1) login
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"customer","action":"login","email":"ada@pionia.shop","password":"secret"}'

# 2) create with token (paste token from step 1)
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service":"product","action":"create","name":"Cap","price":15,"stock":20}'
```

Try create **without** the header — you should get **401**.

More depth: [JWT authentication](/documentation/security/jwt-authentication/) and [Protecting actions](/documentation/security/protecting-actions/).

## Common mistakes

- Protecting `login` by accident — keep it in `except`
- Forgetting `[app_authentications]` — tokens never attach a user
- Putting the password in the JWT — never; only ids / permissions
- Confusing 401 (not logged in) with 403 (logged in but not allowed)

{{< tutorial-nav >}}
