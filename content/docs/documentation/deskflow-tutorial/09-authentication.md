---
title: "Step 9 — Authentication"
slug: "09-authentication"
description: "Add member.login, JWT, and protect task.create with mustAuthenticate()."
summary: "MemberService login and JWT header"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 109
toc: true
doc_type: tutorial
tutorial_step: 9
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/08-validation/
tutorial_next: /documentation/deskflow-tutorial/10-middleware/
seo:
  title: "DeskFlow tutorial — Step 9"
---

Only **Northwind members** should create tasks. Add login and protect writes.

## What you will learn

- Scaffold auth with `make:auth`
- Issue a JWT from `member.login`
- Call `$this->mustAuthenticate()` in `createAction`

{{< prerequisites >}}
- [Step 8](/documentation/deskflow-tutorial/08-validation/)
{{< /prerequisites >}}

## Generate auth backend

{{< terminal >}}
```bash
php pionia make:auth jwt
```
{{< /terminal >}}

Follow prompts to register **JwtAuthentication** in `environment/settings.ini` under `[app_authentications]`.

## MemberService login

{{< terminal >}}
```bash
php pionia make:service member
```
{{< /terminal >}}

Implement a minimal `loginAction` that validates email/password and returns a token via `security()` helpers — see [Security guide](/documentation/security/security-authentication-and-authorization/) for a full DeskFlow example with `team_members` table.

Register `'member' => MemberService::class` on `MainSwitch`.

## Protect createAction

At the top of `createAction`:

```php
$this->mustAuthenticate();
```

## Login curl

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"member","action":"login","email":"alex@northwind.studio","password":"secret"}'
```

Create with token:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service":"task","action":"create","title":"Client kickoff"}'
```

## Common mistakes

- **401 on list** — protect only mutating actions unless product requires auth everywhere.
- **Token in JSON body** — send `Authorization: Bearer` header.

{{< tutorial-nav >}}
