---
title: "Services"
description: "PHP classes that hold your business logic — one Pionia Shop service per domain area."
summary: "Register ProductService on MainSwitch; each public *Action method becomes a Moonlight endpoint."
date: 2024-07-05 01:06:18.709 +0300
lastmod: 2026-07-04
draft: false
weight: 210
toc: true
doc_type: topic
seo:
  title: "Services"
  description: "Create and register Pionia services for the Moonlight API."
  noindex: false
---

---

## Who this is for

You scaffolded Pionia Shop and need to **create and register service classes** — the PHP home for `task`, `member`, and `project` business logic.

## What you will learn

- How `make:service` scaffolds `ProductService` under `services/`
- Registering aliases on `MainSwitch` so JSON `"service": "product"` resolves
- Choosing **Basic** vs **Generic** services for Pionia Shop tables

## Before you start

{{< prerequisites >}}
- Completed [Pionia Shop tutorial Step 1](/documentation/shop-tutorial/01-create-project/) or read [Moonlight overview](/documentation/building-api/moonlight-overview/)
- A running Pionia Shop app on port **8000**
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  JSON["service: task"] --> Switch[MainSwitch]
  Switch --> Class[ProductService]
  Class --> Actions["listAction / createAction"]
{{< /mermaid >}}

## What is a service?
**Services** are plain PHP classes under `services/` that extend `Pionia\Http\Services\Service`. Each **action** is a public method named `somethingAction()` — Pionia maps `"action": "list"` to `listAction()`.

In Pionia Shop, Pionia Shop uses three services:

| Registered alias | Class | Role |
|------------------|-------|------|
| `task` | `ProductService` | Tasks for client projects |
| `member` | `CustomerService` | Login and profiles |
| `project` | `OrderService` | Group tasks by client |

Clients POST lowercase keys:

```json
{ "service": "product", "action": "list", "project_id": 1 }
```

## Create a service

Generate a scaffold from your app root:

```bash
php pionia make:service Product
```

Choose **Basic** for hand-written actions, or **Generic** for CRUD over a Porm table — see [Generic services](/documentation/building-api/generic-services/).

The CLI creates `services/ProductService.php`:

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class ProductService extends Service
{
    public function listAction(Arrayable $data)
    {
        return response(0, 'OK', ['tasks' => []]);
    }
}
```

Register the alias on your switch (usually `Application\Switches\MainSwitch`):

```php
protected function registerServices(): array
{
    return [
        'task' => ProductService::class,
    ];
}
```

{{< try-it >}}
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"list"}'
```
Expected: HTTP **200** with `"returnCode": 0` and a `products` array in `returnData`.
{{< /try-it >}}

---
When you run `make:service`, the CLI offers two paths:

{{< tabs "create-new-service" >}}
{{< tab "Basic service" >}}

Creates a class extending `Pionia\Http\Services\Service`. You define each action method yourself — best for Pionia Shop's custom task rules.

```bash
php pionia make:service Product
```

{{< /tab >}}
{{< tab "Generic service" >}}

Creates a class extending `Pionia\Http\Services\GenericService` with CRUD over a Porm table — useful for `project` rows before you add custom rules.

```bash
php pionia make:service Order
# Choose Generic → UniversalGenericService (default)
```

See [Generic services](/documentation/building-api/generic-services/) for mixin options.

{{< /tab >}}
{{< tab "Manually" >}}

1. Create `services/ProductService.php` under your app root.
2. Extend `Pionia\Http\Services\Service`.
3. Add public `*Action` methods; return `response()` envelopes.
4. Register the alias in `MainSwitch::registerServices()`.

```php
namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Services\Service;

class ProductService extends Service
{
    public function listAction(Arrayable $data)
    {
        return response(0, 'OK', ['tasks' => []]);
    }
}
```

{{< /tab >}}
{{< /tabs >}}

{{<callout note >}}
Remember generic services target a base table.

Therefore, you shall be asked the database table name you want to target. This is required.

However, starting from version 1.1.7, you can target relationships too!

You can read more about this in the [Generic Services section](/documentation/building-api/generic-services/).
{{</callout>}}

## Service registration

Register services in your switch — usually `Application\Switches\MainSwitch`:

```php
protected function registerServices(): array
{
    return [
        'task' => ProductService::class,
        'member' => CustomerService::class,
        'project' => OrderService::class,
    ];
}
```

The array **keys** are the `service` names in JSON requests. They must be unique within a switch.

{{<callout note>}}
Register the same service class in `v1` and `v2` switches when Pionia Shop ships a breaking API version — see [API versioning](/documentation/building-api/api-versioning/).
{{</callout>}}

## Targeting a service in the request

In the request, target a service with the lowercase `service` key:

```json
{
  "service": "product",
  "action": "list"
}
```

For envelopes and HTTP status codes, see [Requests and responses](/documentation/http/requests-and-responses/).

## Actions

You can read more about actions in the [actions section](/documentation/building-api/actions/).

### Service Security

You can mark an entire service as requiring authentication by setting the `$serviceRequiresAuth` parameter to `true`.

```php

class TodoService extends Service
{
    public bool $serviceRequiresAuth = true; // all actions in this service require authentication.

    // your other actions here
}
```

If the flag is set to true, all actions in the service will require authentication. This means that only authenticated users will be able to access the service.

#### Specific actions

You can also mark specific actions in a service as requiring authentication. Use the `$actionsRequiringAuth` parameter and add action names of actions that should be reached by authenticated users only.

This, unlike `$serviceRequiresAuth`, will only protect the actions listed in the array not the entire service.

```php

class TodoService extends Service
{
    public bool $actionsRequiringAuth = ['getTodo'];

    // your other actions here
}
```

## Error Handling

According to Moonlight architecture, all requests should return a 200 Ok status code. This is because the client should
be able to know if the request was successful or not by checking the `returnCode` in the response body.

All normal responses set this internally and are always returning a 200 status code. By convention and by default, all requests
that are successful return 0 as the `returnCode`. This implies that the server can define multiple other return codes
for other scenarios.

In Pionia, we have a global exception handler that catches all exceptions thrown anywhere in the code. This is to ensure that
the client always gets the same response format.

Uncaught throwables flow through the [exception pipeline](/documentation/http/exceptions/). Status codes depend on the exception type:

| Exception | HTTP status |
|-----------|---------------|
| `ValidationException` | 422 |
| `ResourceNotFoundException` | 404 |
| `HttpException` | As defined on the exception |
| Other | 500 (message hidden in production) |

Throw `ValidationException` for client input errors; use plain `Exception` only for unexpected server faults. Prefer `rules()` or `#[Validated]` on actions — see [Validations](/documentation/building-api/validation/).

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Validations\Attributes\Validated;

#[Validated(rules: ['id' => 'required|integer'])]
protected function getTodoAction(Arrayable $data): ApiResponse
{
    $this->mustAuthenticate();

    $id = $data->get('id');

    // rest of action logic

    return response(0, 'Todo fetched successfully', $todo);
}
```

Uncaught throwables flow through the [exception pipeline](/documentation/http/exceptions/) — use clear exception messages for clients.

## Common mistakes

- **Wrong service alias** — the JSON key must match `registerServices()` exactly (`task`, not `ProductService`).
- **Forgetting to register after `make:service`** — the CLI creates the class but does not edit `MainSwitch` for you.
- **Using `$serviceRequiresAuth` without JWT configured** — set up `customer.login` first; see [Authentication](/documentation/security/security-authentication-and-authorization/).
- **Expecting every error to be HTTP 200** — validation uses **422**, auth failures **401**; see [Requests & responses](/documentation/http/requests-and-responses/).

## What's next

{{< card-grid >}}
{{< link-card title="Actions" description="Request data, responses, and auth helpers." href="/documentation/building-api/actions/" >}}
{{< link-card title="Validation" description="422 when Ada omits task title." href="/documentation/building-api/validation/" >}}
{{< link-card title="Generic services" description="CRUD for project rows." href="/documentation/building-api/generic-services/" >}}
{{< /card-grid >}}