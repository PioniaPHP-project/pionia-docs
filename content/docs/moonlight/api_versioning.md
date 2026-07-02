---
title: "API versioning in Moonlight"
slug: "api-versioning-in-moonlight"
description: "How switches map to /api/v1/, /api/v2/, and separate service catalogs."
summary: "One switch per API version; register in environment/settings.ini."
date: 2026-07-01
lastmod: 2026-07-02
draft: false
weight: 3
toc: true
sidebar:
  collapsed: true
seo:
  title: "Moonlight API versioning"
  description: "Register switches per version in Pionia v3 settings.ini."
  noindex: false
---

Each **switch** is bound to one API version path (`/api/v1/`, `/api/v2/`, …). A switch lists which services are exposed on that version.

## Define a switch

```php
namespace Application\Switches;

use Application\Services\UserService;
use Pionia\Collections\Arrayable;
use Pionia\Http\Switches\ApiSwitch;

class V2Switch extends ApiSwitch
{
    public static function registerServices(): Arrayable
    {
        return arr([
            'user' => UserService::class,
        ]);
    }
}
```

Scaffold with:

```bash
php pionia make:switch V2Switch
```

## Register versions

Declare switches in `environment/settings.ini`:

```ini
[app_switches]
v1=Application\Switches\MainSwitch
v2=Application\Switches\V2Switch
```

The framework registers routes at boot — no `bootstrap/routes.php` required. See [HTTP routing](/documentation/http-routing/) for provider-based registration and advanced cases.

Clients POST to the version prefix:

```json
POST /api/v2/
{ "service": "user", "action": "profile" }
```

Each version has its own ping endpoint: `/api/v1/ping`, `/api/v2/ping`.

## When to add a version

- Breaking action contracts or payload shapes
- Removing services from the public surface
- Running old and new implementations in parallel during migration

Non-breaking additions (new actions on existing services) usually stay on the current version.

Related: [Moonlight introduction](/moonlight/introduction-to-moonlight-architecture/) · [Services](/documentation/services/services/) · [HTTP routing](/documentation/http-routing/).
