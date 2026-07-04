---
title: "Moonlight security model"
slug: "moonlight-security"
description: "Why Moonlight uses POST bodies, switch-level auth, and real HTTP status codes."
summary: "Transport security, credential handling, and where authentication runs in the pipeline."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 203
toc: true
doc_type: topic
seo:
  title: "Moonlight security model"
  description: "POST payloads, switch authentication, and DeskFlow login patterns."
---

## Who this is for

You are securing DeskFlow and want to understand **where** auth runs — at the switch, in middleware, or inside an action.

## What you will learn

- Why Moonlight action payloads use **POST** JSON bodies
- How **switch-level** authentication protects groups of actions
- The difference between HTTP **401** and envelope `returnCode`

## POST bodies and access logs

Moonlight sends credentials and business fields in the **request body**, not query strings:

```json
{
  "service": "member",
  "action": "login",
  "email": "alex@northwind.studio",
  "password": "your-secret"
}
```

Query strings often appear in proxy and CDN access logs. POST bodies typically do not — still use **HTTPS in production** and never log raw passwords in application code.

Health checks like `GET /api/v1/ping` remain ordinary GET requests.

## Switch-level authentication

Pionia v3 evaluates authentication **before** dispatching to your action — at the **switch** layer. DeskFlow can require JWT for all `task.create` calls while leaving `task.list` public, configured on `MainSwitch`.

See [Authentication & authorization](/documentation/security/security-authentication-and-authorization/) for JWT setup with `member.login`.

## Action-level rules

Inside an action you still enforce **authorization** — e.g. only project leads may delete tasks. Authentication proves who Alex is; authorization decides what Alex may do.

## Real HTTP status codes

| Situation | HTTP status | Envelope |
|-----------|-------------|----------|
| Success | 200 | `returnCode: 0` |
| Validation error | 422 | `returnCode` non-zero |
| Not authenticated | 401 | error message in envelope |
| Forbidden | 403 | error message in envelope |

Do not assume HTTP 200 for every error — clients must read **both** status and JSON.

## What's next

- [Authentication](/documentation/security/security-authentication-and-authorization/) — implement `member.login`
- [Security utilities](/documentation/security/security-utilities/) — password reset tokens for Alex
- [Middleware](/documentation/http/middleware/) — request IDs for support tickets
