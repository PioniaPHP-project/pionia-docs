---
title: "Security"
description: "Authentication backends and service-level authorization in Pionia v3."
summary: "Protect Moonlight actions with backends, can(), and mustAuthenticate()."
date: 2026-07-01
lastmod: 2026-07-01
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

DeskFlow lets Northwind Studio members log in and only see tasks they are allowed to edit. Pionia handles that with **authentication backends** (who you are) and **authorization** on each action (what you may do).

## First steps

If you are following the [API tutorial](/documentation/getting-started/api-tutorial/), Part 5 adds `member.login` and protects `task.create`. Start there for a working JWT flow.

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
