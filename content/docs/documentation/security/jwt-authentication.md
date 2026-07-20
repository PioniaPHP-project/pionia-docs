---
title: "JWT authentication"
slug: "jwt-authentication"
description: "Customer login tokens with jwt_encode and JwtAuthentication."
summary: "Ada logs in once, carries a Bearer token, and checkout recognizes her."
date: 2026-07-20
lastmod: 2026-07-21
draft: false
weight: 800
toc: true
doc_type: topic
parent: "security"
seo:
  title: "JWT authentication — Pionia"
  description: "Issue and verify JWTs for Pionia Shop customers."
  noindex: false
---

## Who this is for

Pionia Shop needs a simple login: Ada enters email and password, gets a token, and later calls `order.place` with that token. You do not want to invent a custom auth class for that everyday path.

## What you will learn

- Where to keep the signing secret
- How `customer.login` returns a token
- How Pionia reads `Authorization: Bearer …`
- When `make:auth` is worth it instead

## Before you start

{{< prerequisites >}}
- A booted app (Pionia Shop tutorial through Step 3 is enough)
- [Protecting actions](/documentation/security/protecting-actions/) — useful right after login works
{{< /prerequisites >}}

## The flow

1. `customer.login` checks the password and calls `jwt_encode(…)`.
2. The client stores the token and sends `Authorization: Bearer …`.
3. `JwtAuthentication` verifies the signature and fills `$this->auth()`.
4. Attributes like `#[Authenticated]` decide whether this action may run.

{{< mermaid >}}
flowchart LR
  Login["customer.login"] --> Encode["jwt_encode"]
  Encode --> Client[Bearer token]
  Client --> Jwt[JwtAuthentication]
  Jwt --> Auth["$this->auth()"]
  Auth --> Attr["#[Authenticated]"]
{{< /mermaid >}}

## Keep the secret in `.env`

```env
JWT_SECRET=paste-a-long-random-value
JWT_TTL=3600
JWT_ALG=HS256
```

```bash
php pionia shell
# secure_random_hex(32);
```

Never commit real secrets. Optional INI section: `[jwt]` with `SECRET`, `TTL`, `ALG`.

## Register the built-in backend

```ini
[app_authentications]
jwt = "Pionia\Auth\JwtAuthentication"
```

## Issue a token in customer.login

```php
$token = jwt_encode([
    'sub' => $customer->id,
    'email' => $customer->email,
    'permissions' => ['order.place', 'wallet.topup'],
]);

return response(0, 'Logged in', ['token' => $token]);
```

| Helper | Role |
|--------|------|
| `jwt_encode($claims)` | Create the token |
| `jwt_decode($token)` | Read claims (verifies by default) |
| `jwt_verify($token)` | Soft true/false check |
| `jwt_refresh_token()` | Opaque refresh string — **not** a new JWT |

`sub` / `id` become the user id; `permissions` / `perms` feed `#[Can]`.

## Call a protected action

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service":"order","action":"place","product_id":1,"quantity":2}'
```

## Custom backends

Use `php pionia make:auth ApiKey` for partner keys or sessions. Prefer `JwtAuthentication` for normal Bearer JWT.

## Common mistakes

- Protecting `login` itself — leave it public
- Forgetting `[app_authentications]`
- Putting permissions only in docs, not in the token

## What's next

{{< card-grid >}}
{{< link-card title="Protecting actions" description="Require login or permissions on checkout." href="/documentation/security/protecting-actions/" >}}
{{< link-card title="Tutorial Step 9" description="End-to-end in Pionia Shop." href="/documentation/shop-tutorial/09-authentication/" >}}
{{< /card-grid >}}
