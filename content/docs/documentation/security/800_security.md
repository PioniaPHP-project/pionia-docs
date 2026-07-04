---
title: "Security — authentication and authorization"
slug: "security-authentication-and-authorization"
description: "Authentication backends, service-level authorization, and secrets hygiene in Pionia v3."
summary: "Implement auth backends and protect actions with can() / mustAuthenticate()."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 801
toc: true
doc_type: topic
parent: "security"
seo:
  title: "Pionia security"
  description: "Authentication backends and authorization in Pionia v3 apps."
  noindex: false
---

## Who this is for

You finished [Steps 5–7](/documentation/deskflow-tutorial/07-create-tasks/) (tasks CRUD) and need **`member.login`** to issue a JWT, plus **`TaskService`** actions that reject anonymous callers with **401** via `mustAuthenticate()`.

## What you will learn

- How to scaffold and register a JWT authentication backend
- When to use `mustAuthenticate()` vs `can('task.update')` in service actions
- Where to store signing keys and how to document auth with `@moonlight-auth`

## Before you start

{{< prerequisites >}}
- [Tutorial Step 7](/documentation/deskflow-tutorial/07-create-tasks/) — `TaskService` with list/create actions
- `php pionia make:auth jwt` available in your app tree
- `JWT_SECRET_KEY` ready for `environment/.env` (generate with `secure_random_hex(32)` — see [Security utilities](/documentation/security/security-utilities/))
{{< /prerequisites >}}

## How it works

Authentication runs **before** your action method. Pionia tries each backend registered in `[app_authentications]` until one returns a `ContextUserObject`. Authorization checks happen **inside** the action when you call `mustAuthenticate()` or `can()`.

{{< mermaid >}}
flowchart TD
  Req[HTTP request] --> Backends["Auth backends in order"]
  Backends --> JWT[JwtAuthBackend]
  JWT -->|Bearer valid| Ctx[ContextUserObject]
  JWT -->|missing/invalid| Null[null user]
  Ctx --> Action[TaskService action]
  Null --> Action
  Action --> Must{mustAuthenticate?}
  Must -->|not logged in| E401[HTTP 401 envelope]
  Must -->|logged in| Can{can permission?}
  Can -->|denied| E403[HTTP 403 envelope]
  Can -->|allowed| OK[returnCode 0]
{{< /mermaid >}}

## Secrets and credentials

**Do not commit real passwords, API keys, or tokens** to git — including in `environment/settings.ini` if that file is tracked.

| Do | Don't |
|----|--------|
| Put secrets in `environment/.env` (gitignored) | Paste production credentials in docs or chat |
| Use placeholders in tutorials | Return password hashes in API `returnData` |
| Rotate tokens if they were ever committed | Reuse example JWT keys from old guides |

Generate local-only values with Pionia's CSPRNG helpers ([Security utilities](/documentation/security/security-utilities/)):

```bash
php pionia shell
```

```php
secure_random_hex(32); // paste into JWT_SECRET_KEY= in environment/.env
```

```ini
# environment/.env
JWT_SECRET_KEY=paste-the-value-here
```

## Authentication overview

Pionia does not ship a fixed auth scheme. You implement **authentication backends** that return a `ContextUserObject` when a request is authenticated.

Common choices: JWT (`firebase/php-jwt`), session cookies, API keys, OAuth proxies.

### Scaffold a backend

```bash
php pionia make:auth jwt
```

Creates `Application\Authentications\JwtAuthBackend` (name + `AuthBackend` suffix).

```php
namespace Application\Authentications;

use Pionia\Auth\AuthenticationBackend;
use Pionia\Auth\ContextUserObject;
use Pionia\Http\Request\Request;

class JwtAuthBackend extends AuthenticationBackend
{
    public function authenticate(Request $request): ?ContextUserObject
    {
        $header = $request->headers->get('Authorization');
        if ($header === null || $header === '') {
            return null;
        }

        // Decode token, load user from db('users'), etc.

        $context = new ContextUserObject();
        $context->authenticated = true;
        $context->user = $userRow;
        $context->authExtra = ['role' => $userRow->role ?? 'USER'];

        return $context;
    }
}
```

Register in `environment/settings.ini`:

```ini
[app_authentications]
jwt = "Application\Authentications\JwtAuthBackend"
```

Order matters — Pionia tries backends in registration order until one returns a user.

Store signing keys in `.env` (`JWT_SECRET_KEY=`), not in committed INI files.

## Authorization in services

Extend `Pionia\Http\Services\Service` (not the removed v2 `BaseRestService`).

DeskFlow example — protect destructive task actions:

```php
namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;

class TaskService extends Service
{
    protected function createAction(Arrayable $data): ApiResponse
    {
        $this->mustAuthenticate();

        // … insert into table('tasks')

        return response(0, 'Task created');
    }

    protected function listAction(Arrayable $data): ApiResponse
    {
        if (!$this->can('task.list')) {
            return response(403, 'Forbidden');
        }

        return response(0, null, table('tasks')->all());
    }
}
```

| Method | Purpose |
|--------|---------|
| `$this->auth()` | Current `ContextUserObject` or null |
| `$this->mustAuthenticate()` | Fail with 401 if not authenticated |
| `$this->can('permission')` | Check permission / role |

Document auth requirements with `@moonlight-auth required` or `@moonlight-auth none` on actions.

## Demo authentication

The app template ships `Application\Authentications\DemoAuthentication` — send `Authorization: Bearer demo-token` to exercise protected actions in development.

## Common mistakes

- Registering the backend in PHP but forgetting `[app_authentications]` in `settings.ini` — requests stay anonymous
- Using `mustAuthenticate()` on `member.login` — login actions should allow unauthenticated callers (`@moonlight-auth none`)
- Checking permissions with string typos (`task.updat` vs `task.update`) — failures look like silent 403s
- Committing `JWT_SECRET_KEY` or demo tokens to git — rotate immediately if exposed

## What's next

{{< card-grid >}}
{{< link-card title="Security utilities" description="Hash passwords for member.login with hash_password()." href="/documentation/security/security-utilities/" >}}
{{< link-card title="Moonlight security model" description="Switch-level auth wiring and catalog." href="/documentation/building-api/moonlight-security/" >}}
{{< link-card title="Middleware" description="CORS, request IDs, global pipeline hooks." href="/documentation/http/middleware/" >}}
{{< /card-grid >}}
