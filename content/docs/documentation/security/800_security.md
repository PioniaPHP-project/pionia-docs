---
title: "Security — authentication and authorization"
slug: "security-authentication-and-authorization"
description: "Wire who Ada is, keep secrets safe, and choose attributes or custom backends."
summary: "Backends identify the caller; attributes decide what they may do in the shop."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 801
toc: true
doc_type: topic
parent: "security"
seo:
  title: "Pionia security"
  description: "Authentication backends and authorization for Pionia apps."
  noindex: false
---

## Who this is for

Pionia Shop already lists products. Now you need login and clear rules for who may create catalog rows or place orders. For attribute-only how-tos, start with [Protecting actions](/documentation/security/protecting-actions/). This page covers backends, secrets, and custom authentication classes.

## What you will learn

- What an authentication backend does
- How to keep signing secrets out of git
- When to use built-in JWT vs `make:auth`
- How attributes and in-method checks fit together

## Before you start

{{< prerequisites >}}
- [Shop tutorial Step 7](/documentation/shop-tutorial/07-create-products/) — catalog writes work
- A place for secrets in `environment/.env`
{{< /prerequisites >}}

## Two moments in every request

1. **Identify** — backends look at headers. The first match fills `$this->auth()` (usually `JwtAuthentication`).
2. **Authorize** — attributes on the service/method decide if this action may run.

{{< mermaid >}}
flowchart TD
  Req[HTTP request] --> Backends[Auth backends]
  Backends -->|recognized| User["$this->auth()"]
  Backends -->|unknown| Empty[no user]
  User --> Attr["#[Authenticated] / #[Can]"]
  Empty --> Attr
  Attr -->|no| Stop[401 or 403]
  Attr -->|yes| Action[Your action]
{{< /mermaid >}}

## Secrets stay in `.env`

| Do | Don't |
|----|--------|
| Put `JWT_SECRET` in `.env` | Commit production secrets |
| Use placeholders in tutorials | Return password hashes in `returnData` |
| Rotate leaked values | Reuse sample keys from screenshots |

```bash
php pionia shell
# secure_random_hex(32);
```

## Usual path: JWT

```ini
[app_authentications]
jwt = "Pionia\Auth\JwtAuthentication"
```

Issue tokens in `customer.login` with `jwt_encode()`. Full guide: [JWT authentication](/documentation/security/jwt-authentication/).

## Custom backend

Sessions, partner API keys, or a proxy that already authenticated the user:

```bash
php pionia make:auth ApiKey
```

Return a `ContextUserObject` or `null`. Register under `[app_authentications]`. Order matters — first success wins.

## After identify: authorize

```php
#[Authenticated(except: ['login', 'register'])]
class CustomerService extends Service { /* … */ }
```

Ownership checks (“only cancel your own order”) stay inside the method with `$this->auth()`. Walkthrough: [Protecting actions](/documentation/security/protecting-actions/).

| Helper | Meaning |
|--------|---------|
| `$this->auth()` | Current user context |
| `$this->mustAuthenticate()` | Require login (401) |
| `$this->can('…')` | One permission |
| `$this->canAny` / `canAll` | Any / all permissions |

## Common mistakes

- Backend class exists but missing from `[app_authentications]`
- Locking `login` / `register`
- Permission string typos → quiet 403s
- Scaffolding a custom JWT class when `JwtAuthentication` already fits

## What's next

{{< card-grid >}}
{{< link-card title="Protecting actions" description="Shop-focused attribute guide." href="/documentation/security/protecting-actions/" >}}
{{< link-card title="JWT authentication" description="customer.login tokens." href="/documentation/security/jwt-authentication/" >}}
{{< link-card title="Security utilities" description="hash_password and more." href="/documentation/security/security-utilities/" >}}
{{< /card-grid >}}
