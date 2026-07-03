---
title: "Security"
description: "Authentication backends and service-level authorization in Pionia v3."
summary: "Protect Moonlight actions with backends, can(), and mustAuthenticate()."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 800
toc: false
parent: "documentation"
seo:
  title: "Security"
  description: "Authentication and authorization guides for Pionia apps."
  noindex: false
---

| Guide | Topic |
|-------|--------|
| [Authentication & authorization](/documentation/security/security-authentication-and-authorization/) | Backends, `ContextUserObject`, `can()`, secrets |
| [Security utilities](/documentation/security/security-utilities/) | `security()`, tokens, OTPs, hashing, encryption |
| [Middleware](/documentation/middleware/) | Request/response pipeline |
| [Validations](/documentation/services/validation/) | Input validation on actions |

Moonlight actions declare auth with `@moonlight-auth` PHPDoc tags. See [API reference](/documentation/api-reference/) for OpenAPI export of auth requirements.
