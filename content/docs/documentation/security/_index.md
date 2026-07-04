---
title: "Security"
description: "Authentication backends and service-level authorization in Pionia v3."
summary: "Protect Moonlight actions with backends, can(), and mustAuthenticate()."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 500
url: /documentation/security/
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Security"
  description: "Authentication and authorization guides for Pionia apps."
  noindex: false
---

## Who this is for

You are building DeskFlow (or any Pionia API) and need to know **who** is calling your actions — Alex at Northwind Studio logging in with `member.login`, receiving a JWT, and only editing tasks they are allowed to change.

## What you will learn

- How authentication backends turn a Bearer token into a `ContextUserObject`
- Where to call `mustAuthenticate()` and `can()` in `TaskService`
- Which guide to read next for crypto helpers vs switch-level wiring

## Before you start

{{< prerequisites >}}
- [DeskFlow tutorial Step 3](/documentation/deskflow-tutorial/03-your-first-service/) — working `task.list` on port **8000**
- Optional: [Moonlight overview](/documentation/building-api/moonlight-overview/) — how `{ service, action }` reaches your service class
{{< /prerequisites >}}

## How it works

DeskFlow lets Northwind Studio members log in and only see tasks they are allowed to edit. Pionia handles that with **authentication backends** (who you are) and **authorization** on each action (what you may do).

{{< mermaid >}}
flowchart LR
  Client["POST member.login"] --> Switch["/api/v1/ MainSwitch"]
  Switch --> Member[MemberService]
  Member --> JWT[JWT in returnData]
  Client2["POST task.create + Bearer"] --> Switch2["/api/v1/"]
  Switch2 --> Backend[JwtAuthBackend]
  Backend --> Task[TaskService]
  Task --> AuthZ["mustAuthenticate() / can()"]
  AuthZ --> Action[createAction]
{{< /mermaid >}}

## First steps

If you are following the [DeskFlow tutorial](/documentation/deskflow-tutorial/), [Step 9](/documentation/deskflow-tutorial/09-authentication/) adds `member.login` and protects `task.create`. Start there for a working JWT flow.

Otherwise, read in this order:

| Step | Guide | What you learn |
|------|-------|----------------|
| 1 | [Authentication & authorization](/documentation/security/security-authentication-and-authorization/) | Backends, `ContextUserObject`, `can()`, `@moonlight-auth` |
| 2 | [Security utilities](/documentation/security/security-utilities/) | `security()`, tokens, hashing, encryption |
| 3 | [Validation](/documentation/building-api/validation/) | Reject bad input before auth runs |
| 4 | [Middleware](/documentation/http/middleware/) | Request pipeline, CORS, request IDs |

## DeskFlow scenario

Alex at `alex@northwind.studio` logs in:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"member","action":"login","email":"alex@northwind.studio","password":"secret"}'
```

The response includes a JWT. Protected actions send `Authorization: Bearer …` — see [Examples](/documentation/examples/) for the full envelope.

In `TaskService`, actions that change data call `$this->mustAuthenticate()` or `$this->can('task.update')` so anonymous clients get **HTTP 401** with a JSON error envelope.

## Guide map

| Guide | Topic |
|-------|--------|
| [Authentication & authorization](/documentation/security/security-authentication-and-authorization/) | Backends, secrets, service-level checks |
| [Security utilities](/documentation/security/security-utilities/) | OTPs, password hashing, encryption helpers |
| [Moonlight security model](/documentation/building-api/moonlight-security/) | Switch-level auth wiring |
| [Middleware](/documentation/http/middleware/) | Global pipeline hooks |
| [Validations](/documentation/building-api/validation/) | Input validation on actions |

Moonlight actions declare auth with `@moonlight-auth` PHPDoc tags. Export requirements to OpenAPI via [Documenting your API](/documentation/building-api/api-reference/).

## Common mistakes

- Calling `mustAuthenticate()` only in some mutating actions — protect every action that reads or writes sensitive data consistently
- Storing `JWT_SECRET_KEY` in committed `settings.ini` instead of gitignored `environment/.env`
- Expecting auth to run inside the action body — backends run **before** your method; use `$this->auth()` to read the result
- Returning password hashes or raw tokens in API `returnData` after `member.login`

## What's next

{{< card-grid >}}
{{< link-card title="Authentication & authorization" description="Scaffold JwtAuthBackend and protect TaskService." href="/documentation/security/security-authentication-and-authorization/" >}}
{{< link-card title="Security utilities" description="hash_password(), secure_token(), encrypt()." href="/documentation/security/security-utilities/" >}}
{{< link-card title="Tutorial Step 9 — Authentication" description="DeskFlow login and protected task.create." href="/documentation/deskflow-tutorial/09-authentication/" >}}
{{< /card-grid >}}
