---
title: "Services"
parent: "documentation"
description: "Business logic, actions, validation, and generic CRUD in Pionia."
summary: "Services expose Moonlight actions; GenericService covers list, create, update, delete, and random out of the box."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 500
toc: true
seo:
  title: "Pionia services"
  description: "How services and actions work in the Pionia Moonlight API."
  canonical: ""
  noindex: false
---

All business logic lives in **service classes** under `services/`. The HTTP API dispatches `{ "service": "auth", "action": "list_users" }` to a method on that service. Switches (e.g. `MainSwitch` for `/api/v1/`) register which services are available.

## Guide map

| Topic | Page |
|-------|------|
| Concepts & creating services | [Services](/documentation/services/services/) |
| Action methods, `Arrayable`, files | [Actions](/documentation/services/actions/) |
| **Document services & actions (`@moonlight-*`)** | **[Documenting your API](/documentation/api-reference/)** |
| Validation & `ValidationException` | [Validations](/documentation/services/validation/) |
| CRUD without boilerplate | [Generic services](/documentation/services/generic-services/) |
| Joins, uploads, hooks | [Advanced generic services](/documentation/services/advanced-generic-services/) |

## Request envelope

Every API response uses the same JSON shape:

```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": { }
}
```

`returnCode: 0` means success. Validation failures use **422** via `ValidationException`; other HTTP errors map through the [exception pipeline](/documentation/exceptions/).

## Quick example

```php
namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;

class PingService extends Service
{
    protected function helloAction(Arrayable $data): ApiResponse
    {
        return response(0, 'Hello', ['name' => $data->get('name', 'world')]);
    }
}
```

Register the service on your switch, then:

```bash
curl -s -X POST http://127.0.0.1:8003/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"ping","action":"hello","name":"Pionia"}'
```

## When to use GenericService

| Need | Use |
|------|-----|
| Full CRUD over one table | `UniversalGenericService` + `$createColumns` / `$updateColumns` |
| Subset of CRUD (e.g. list + retrieve only) | Typed generics (`RetrieveListCreateService`, …) |
| Custom workflows, multi-table logic | Extend `Service` with named `*Action` methods |

For custom actions with `db()`, `saveOrUpdate()`, and [background `async()`](/documentation/background-work/), see [Services](/documentation/services/services/) and the API tutorial.
