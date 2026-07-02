---
title: "API tutorial"
slug: "api-tutorial"
description: "Build your first Moonlight service and call it from the browser."
summary: "Hands-on path from ping to a working service action."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 400
toc: true
parent: "documentation"
seo:
  title: "Pionia API tutorial"
  description: "Create a service, register it on a switch, and POST { service, action }."
  noindex: false
---

This tutorial matches **Pionia v3** app layout (`pionia/pionia-app` or `pionia new`). Every API call uses the same JSON envelope:

```json
{
  "service": "auth",
  "action": "list_auth"
}
```

## 1. Boot the API

```bash
php pionia serve          # or: php pionia runserver
curl -s http://127.0.0.1:8003/api/v1/ping | jq
```

Default port is **8003** (`PORT` in `environment/.env`).

## 2. Register a service

Services live in `services/` and are wired in `switches/MainSwitch.php`:

```php
use Application\Services\AuthService;

public static function registerServices(): Arrayable
{
    return arr([
        'auth' => AuthService::class,
    ]);
}
```

Register the switch in `environment/settings.ini`:

```ini
[app_switches]
v1=Application\Switches\MainSwitch
```

## 3. Add an action

Extend `Pionia\Http\Services\Service` and implement `*Action` methods:

```php
namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;

class TodoService extends Service
{
    protected function listAction(Arrayable $data): ApiResponse
    {
        return response(0, null, db('todos')->all());
    }
}
```

Document with `@moonlight-action`, `@moonlight-summary`, and `@moonlight-example` PHPDoc tags — see [API reference](/documentation/api-reference/).

## 4. Call the action

```bash
curl -s -X POST http://127.0.0.1:8003/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"auth","action":"list_auth"}' | jq
```

Response shape:

```json
{
  "returnCode": 0,
  "returnMessage": null,
  "returnData": { },
  "extraData": null
}
```

`returnCode: 0` means success.

## 5. Frontend (optional)

Scaffold Vite and call the same envelope from JavaScript:

```bash
php pionia frontend:scaffold --framework=react-ts --yes
php pionia frontend:dev    # terminal 2 — proxies /api to Pionia
```

```typescript
import { callAction } from './lib/pionia-api'

const result = await callAction('auth', 'list_auth')
```

See [Frontend integration](/documentation/frontend-integration/) and the example app’s `frontend/` demo.

## Next steps

| Topic | Guide |
|-------|--------|
| Generic CRUD | [Generic services](/documentation/services/generic-services/) |
| Validation | [Validations](/documentation/services/validation/) |
| Auth | [Security](/documentation/security/security-authentication-and-authorization/) |
| Database | [Porm getting started](/documentation/database/configuration-getting-started/) |
| CLI | [Commands](/documentation/commands-pionia-cli/) |

For a full v2 → v3 migration checklist, see [Upgrading from v2](/documentation/upgrading-from-v2/).
