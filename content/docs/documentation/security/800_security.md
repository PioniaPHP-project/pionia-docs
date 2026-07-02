---
title: "Security — authentication and authorization"
slug: "security-authentication-and-authorization"
description: "Authentication backends, service-level authorization, and secrets hygiene in Pionia v3."
summary: "Implement auth backends and protect actions with can() / mustAuthenticate()."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 801
toc: true
parent: "security"
seo:
  title: "Pionia security"
  description: "Authentication backends and authorization in Pionia v3 apps."
  noindex: false
---

## Secrets and credentials

**Do not commit real passwords, API keys, or tokens** to git — including in `environment/settings.ini` if that file is tracked.

| Do | Don't |
|----|--------|
| Put secrets in `environment/.env` (gitignored) | Paste production credentials in docs or chat |
| Use placeholders in tutorials | Return password hashes in API `returnData` |
| Rotate tokens if they were ever committed | Reuse example JWT keys from old guides |

Generate local-only values:

```bash
openssl rand -hex 32
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

```php
namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;

class TodoService extends Service
{
    protected function deleteAction(Arrayable $data): ApiResponse
    {
        $this->mustAuthenticate();

        return response(0, 'Deleted');
    }

    protected function listAction(Arrayable $data): ApiResponse
    {
        if (!$this->can('todo.list')) {
            return response(403, 'Forbidden');
        }

        return response(0, null, db('todos')->all());
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

## Related

- [Middleware](/documentation/middleware/) — cross-cutting request/response hooks
- [Requests & responses](/documentation/requests-and-responses/)
- [Upgrading from v2](/documentation/upgrading-from-v2/) — namespace and class renames
