---
title: "Security"
description: "Help Pionia Shop know who is calling — and what they may do."
summary: "From Ada’s login to protected checkout — a clear path through Pionia security."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 500
url: /documentation/security/
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Security"
  description: "Authentication and authorization for Pionia Shop and other apps."
  noindex: false
---

## Who this is for

You are building **Pionia Shop**. Browsing the catalog can stay public. Creating products, placing orders, and topping up a wallet should only work for the right people. This section teaches that story without jargon piles.

## What you will learn

- How login turns into a Bearer token Ada can reuse
- How to lock actions with attributes instead of copy-pasted checks
- Where secrets belong, and which guide to open next

## Before you start

{{< prerequisites >}}
- [Shop tutorial Step 3](/documentation/shop-tutorial/03-your-first-service/) — working `product.list`
- Optional: [Moonlight overview](/documentation/building-api/moonlight-overview/)
{{< /prerequisites >}}

## How a shop request is secured

1. Ada logs in with email/password → `customer.login` returns a JWT.
2. Her next call sends `Authorization: Bearer …`.
3. `JwtAuthentication` attaches her user to the request.
4. `#[Authenticated]` / `#[Can]` on the action decide if she may continue.
5. Only then does your method talk to `orders` or `wallets`.

{{< mermaid >}}
flowchart LR
  Login["customer.login"] --> Token[JWT]
  Token --> Call["order.place + Bearer"]
  Call --> Jwt[JwtAuthentication]
  Jwt --> Attr["#[Authenticated] / #[Can]"]
  Attr --> Work[placeAction]
{{< /mermaid >}}

## Suggested reading order

| Step | Guide | Idea |
|------|-------|------|
| 1 | [JWT authentication](/documentation/security/jwt-authentication/) | Issue and verify tokens |
| 2 | [Protecting actions](/documentation/security/protecting-actions/) | `#[Authenticated]`, `#[Can]`, exemptions |
| 3 | [Authentication & authorization](/documentation/security/security-authentication-and-authorization/) | Custom backends and secret hygiene |
| 4 | [Security utilities](/documentation/security/security-utilities/) | Password hashing, OTPs, encryption |

## A minute with Ada

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"customer","action":"login","email":"ada@pionia.shop","password":"secret"}'
```

Use the returned token on protected actions. Mark `product.create` or `order.place` with `#[Authenticated]` so anonymous callers never reach your database code.

## Common mistakes

- Leaving one write action unprotected — prefer `#[Authenticated(except: ['login', 'register'])]` on `CustomerService`
- Storing `JWT_SECRET` in tracked files — use `.env`
- Expecting the action body to “notice” auth by itself — checks run before your method

## What's next

{{< card-grid >}}
{{< link-card title="JWT authentication" description="Login tokens for customers." href="/documentation/security/jwt-authentication/" >}}
{{< link-card title="Protecting actions" description="Attributes for catalog and checkout." href="/documentation/security/protecting-actions/" >}}
{{< link-card title="Tutorial Step 9" description="Wire this into Pionia Shop." href="/documentation/shop-tutorial/09-authentication/" >}}
{{< /card-grid >}}
