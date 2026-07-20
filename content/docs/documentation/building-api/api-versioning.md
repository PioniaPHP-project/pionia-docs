---
title: "API versioning in Moonlight"
slug: "api-versioning"
description: "How switches map to /api/v1/, /api/v2/, and separate service catalogs."
summary: "One switch per API version; register in environment/settings.ini."
date: 2026-07-01
lastmod: 2026-07-04
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

## Who this is for

Pionia Shop is shipping Pionia Shop v2 with breaking payload changes. You need **two API versions running in parallel** — `/api/v1/` for existing clients and `/api/v2/` for the new contract.

## What you will learn

- Creating a `V2Switch` class and registering it in `settings.ini`
- Which Pionia Shop changes warrant a new version vs a new action on `v1`
- How each version gets its own ping and service catalog

## Before you start

{{< prerequisites >}}
- [Moonlight overview](/documentation/building-api/moonlight-overview/) — switches and service aliases
- [Services](/documentation/building-api/services/) — `MainSwitch` with `task`, `member`, `project`
{{< /prerequisites >}}

## How it works

Each **switch** is bound to one API version path (`/api/v1/`, `/api/v2/`, …). A switch lists which services are exposed on that version.

{{< mermaid >}}
flowchart LR
  INI["[app_switches]"] --> V1["/api/v1/ MainSwitch"]
  INI --> V2["/api/v2/ V2Switch"]
  V1 --> TaskV1["task / member / project"]
  V2 --> TaskV2[task v2 contract]
{{< /mermaid >}}

## Define a switch

```php
namespace Application\Switches;

use Application\Services\CustomerService;
use Application\Services\V2\ProductService as ProductServiceV2;
use Pionia\Collections\Arrayable;
use Pionia\Http\Switches\ApiSwitch;

class V2Switch extends ApiSwitch
{
    public static function registerServices(): Arrayable
    {
        return arr([
            'task' => ProductServiceV2::class,
            'member' => CustomerService::class,
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

The framework registers routes at boot — no `bootstrap/routes.php` required. See [HTTP routing](/documentation/http/http-routing/) for provider-based registration and advanced cases.

Clients POST to the version prefix:

```json
POST http://127.0.0.1:8000/api/v2/
{ "service": "product", "action": "list" }
```

Each version has its own ping endpoint:

```bash
curl -s http://127.0.0.1:8000/api/v1/ping
curl -s http://127.0.0.1:8000/api/v2/ping
```

## When to add a version

- Breaking action contracts or payload shapes (e.g. renaming `assignee_id` to `member_id`)
- Removing services from the public surface
- Running old and new implementations in parallel during migration

Non-breaking additions (new actions on existing services) usually stay on the current version — Ada's mobile app keeps calling `/api/v1/` until Pionia Shop sunsets it.

## Common mistakes

- **Creating v2 for every new action** — `task.archive` can live on `v1` if existing clients ignore unknown actions.
- **Forgetting to register the switch in `settings.ini`** — the class alone does not create a route.
- **Different service aliases per version without documentation** — if `v2` removes `project`, update `/docs` and notify frontend teams.
- **Hardcoding `/api/v1/` in the SPA** — use `apiVersionPath()` or env config so Pionia Shop can migrate gradually.

## What's next

{{< card-grid >}}
{{< link-card title="Moonlight overview" description="One URL per version explained." href="/documentation/building-api/moonlight-overview/" >}}
{{< link-card title="Documenting your API" description="Tag actions per version." href="/documentation/building-api/api-reference/" >}}
{{< link-card title="HTTP routing" description="Provider routes and route cache." href="/documentation/http/http-routing/" >}}
{{< /card-grid >}}
