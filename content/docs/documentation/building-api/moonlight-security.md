---
title: "Moonlight security model"
slug: "moonlight-security"
description: "Why Moonlight uses POST bodies, switch-level auth, and real HTTP status codes."
summary: "Transport security, credential handling, and where authentication runs in the pipeline."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 203
toc: true
doc_type: topic
seo:
  title: "Moonlight security model"
  description: "POST payloads, switch authentication, and Pionia Shop login patterns."
---

## Who this is for

You are securing Pionia Shop and want to understand **where** auth runs — at the switch, in middleware, or inside an action.

## What you will learn

- Why Moonlight action payloads use **POST** JSON bodies
- How **switch-level** authentication protects groups of actions
- The difference between HTTP **401** and envelope `returnCode`

## Before you start

{{< prerequisites >}}
- [Moonlight overview](/documentation/building-api/moonlight-overview/) — POST dispatch model
- [Pionia Shop tutorial Step 1](/documentation/shop-tutorial/01-create-project/) — Pionia Shop on port **8000**
{{< /prerequisites >}}

## How it works

Credentials and business fields travel in the POST JSON body. Authentication backends run before your action — so a missing Bearer token fails early on `order.place`, not halfway through a wallet debit.


## POST bodies and access logs

Moonlight sends credentials and business fields in the **request body**, not query strings:

```json
{
  "service": "customer",
  "action": "login",
  "email": "ada@pionia.shop",
  "password": "your-secret"
}
```

Query strings often appear in proxy and CDN access logs. POST bodies typically do not — still use **HTTPS in production** and never log raw passwords in application code.

Health checks like `GET /api/v1/ping` remain ordinary GET requests.

## Switch-level authentication

Pionia v3 evaluates authentication **before** dispatching to your action — at the **switch** layer. Pionia Shop can require JWT for all `product.create` calls while leaving `product.list` public, configured on `MainSwitch`.

See [Authentication & authorization](/documentation/security/security-authentication-and-authorization/) for JWT setup with `customer.login`.

## Action-level rules

Prefer **attributes** on the service or method (`#[Authenticated]`, `#[Can]`, `#[CanAny]`) so authorization runs before the action body. Use `$this->can()` inside an action only when the rule depends on the payload or a row (for example “only the assignee may close this task”).

Full guide: [Protecting actions with attributes](/documentation/security/protecting-actions/).

## Real HTTP status codes

| Situation | HTTP status | Envelope |
|-----------|-------------|----------|
| Success | 200 | `returnCode: 0` |
| Validation error | 422 | `returnCode` non-zero |
| Not authenticated | 401 | error message in envelope |
| Forbidden | 403 | error message in envelope |

Do not assume HTTP 200 for every error — clients must read **both** status and JSON.

## Common mistakes

- **Putting passwords in query strings** — use POST JSON for `customer.login`; never `?password=` in URLs.
- **Checking auth only inside actions** — configure switch-level rules so unauthenticated requests fail before business logic runs.
- **Logging raw request bodies in production** — redact passwords; use `[logging] HIDE_IN_LOGS` in `settings.ini`.
- **Ignoring HTTP status because `returnCode` exists** — mobile clients must handle **401**, **403**, and **422** explicitly.

## What's next

{{< card-grid >}}
{{< link-card title="Authentication" description="Implement customer.login with JWT." href="/documentation/security/security-authentication-and-authorization/" >}}
{{< link-card title="Security utilities" description="Password hashing for customer.login." href="/documentation/security/security-utilities/" >}}
{{< link-card title="Middleware" description="Request IDs for support tickets." href="/documentation/http/middleware/" >}}
{{< /card-grid >}}
