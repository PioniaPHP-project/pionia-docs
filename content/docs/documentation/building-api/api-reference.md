---
title: "Documenting your API (Moonlight)"
slug: "api-reference"
description: "How to document services and actions with @moonlight-* tags, generate OpenAPI, and expose /docs."
date: 2026-06-25T00:00:00.000Z
lastmod: 2026-07-20
draft: false
weight: 560
toc: true
seo:
  title: "Moonlight API documentation"
  description: "Document Pionia services and actions with @moonlight-* PHPDoc tags; generate OpenAPI and Scalar UI."
  noindex: false
---

## Who this is for

the shop's frontend team needs **`/docs`** and an OpenAPI file they can trust. You have Pionia Shop services with `*Action` methods and want to document every `{ service, action }` pair without maintaining a separate spec by hand.

## What you will learn

- `@moonlight-*` PHPDoc tags for `product`, `customer`, and `order` actions
- Generating `docs/api/openapi.json` with `php pionia api:docs`
- Enabling Scalar UI at **`http://127.0.0.1:8000/docs`** and using **Try it** against real `POST /api/v1/`

## Before you start

{{< prerequisites >}}
- [Services](/documentation/building-api/services/) with `*Action` methods registered on [MainSwitch](/documentation/building-api/api-versioning/)
- Pionia Shop running locally on port **8000**
{{< /prerequisites >}}

## How it works

Moonlight docs scan your `services/` classes at boot and when you run `api:docs`. OpenAPI documents the real endpoint — **`POST /api/v1/`** — with a named **example** per action. Clients never hit a different path per action.

## What Moonlight docs are

Pionia’s HTTP API is **not** one OpenAPI path per REST resource. Clients POST to a versioned URL (e.g. `/api/v1/`) with a JSON body:

```json
{
  "service": "product",
  "action": "list",
  "project_id": 1
}
```

**Moonlight documentation** describes every `{ service, action }` pair your app exposes: parameters, auth, examples, and the response envelope. The framework scans your service classes and produces:

| Output | Command | Typical path |
|--------|---------|----------------|
| OpenAPI 3.1 spec | `php pionia api:docs` | `docs/api/openapi.json` |
| Markdown index | same | `docs/api/index.md` |
| Scalar HTML UI | `php pionia api:docs --ui` | `docs/api/index.html` |
| Live browser UI | runtime | `/docs` (when enabled) |
| JSON catalog | `php pionia api:catalog` | stdout or `/api/v1/__catalog` |

Moonlight docs describe **your application API**, not Pionia framework internals (those use phpDocumentor in the core repo).

## Quick start

1. Add `@moonlight-*` tags to a service class and its action methods (see below).
2. Generate committed docs:

```bash
php pionia api:docs --ui
```

3. In development, open interactive docs:

```bash
php pionia serve
open http://127.0.0.1:8000/docs
```

4. In CI, fail on drift:

```bash
php pionia api:docs --check
```

## Document a service (class level)

Put Moonlight tags on the **service class docblock**. They apply to every action unless overridden on the method.

```php
<?php

namespace Application\Services;

use Pionia\Http\Services\Service;

/**
 * Pionia Shop tasks for Pionia Shop.
 *
 * @moonlight-service task
 * @moonlight-version v1
 * @moonlight-auth partial
 */
class ProductService extends Service
{
    // actions …
}
```

| Tag | Required | Purpose |
|-----|----------|---------|
| `@moonlight-service` | Recommended | Service alias in requests (`"service": "auth"`). Defaults to the switch registry key if omitted. |
| `@moonlight-version` | Optional | API version label in docs (usually `v1`). |
| `@moonlight-auth` | Optional | Default auth for the service: `none`, `optional`, `partial`, or `required`. |
| `@moonlight-table` | Optional | Primary table for [generic CRUD](/documentation/building-api/generic-services/) actions. |

The **service alias** must match how the service is registered on your switch (`registerServices()`), e.g. `auth`, `category`, `mail`.

## Document an action (method level)

Each API action is a `*Action` method on the service. Document it in the method docblock:

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;

/**
 * List auth records with optional filters.
 *
 * @moonlight-action list_auth
 * @moonlight-summary Returns paginated auth rows
 * @moonlight-auth none
 * @moonlight-perm list_auth
 * @moonlight-param int page Page number, default 1
 * @moonlight-param int limit Page size, default 20
 * @moonlight-return object items array of records, total int count
 * @moonlight-example {"service":"auth","action":"list_auth","page":1,"limit":20}
 */
protected function listAuthAction(Arrayable $data): ApiResponse
{
    // …
}
```

### Tag reference (actions)

| Tag | Required | Purpose |
|-----|----------|---------|
| `@moonlight-action` | Recommended | The `action` string clients send in JSON. |
| `@moonlight-summary` | Recommended | One-line description in OpenAPI and `/docs`. |
| `@moonlight-auth` | Optional | `none`, `optional`, or `required` for this action. |
| `@moonlight-perm` | Optional | Permission slug (repeat tag for multiple). |
| `@moonlight-param` | Optional | `type name Description` — documents a request body field. |
| `@moonlight-return` | Optional | Shape of `returnData` in the response envelope. |
| `@moonlight-example` | Optional | Full example JSON payload (include `service` and `action`). |
| `@moonlight-deprecated` | Optional | Mark action deprecated in generated docs. |

**Parameter syntax:** `@moonlight-param type name Description`

Examples:

```php
 * @moonlight-param string email Recipient address
 * @moonlight-param int id Row id
 * @moonlight-param object data Row payload (name, optional id)
```

{{< callout context="tip" title="Params without examples" icon="outline/bulb" >}}
`@moonlight-param` is enough for OpenAPI and Markdown request fields. You do **not** need `@moonlight-example` for parameters to appear — the example tag is optional and only supplies a full sample JSON body (including `service` and `action`).
{{< /callout >}}

### PHP 8 attributes (alternative)

Instead of (or in addition to) PHPDoc, you can use the `MoonlightAction` attribute:

```php
use Pionia\Documentation\Attributes\MoonlightAction;

#[MoonlightAction(
    name: 'list_auth',
    summary: 'Returns paginated auth rows',
    auth: 'none',
    permissions: ['list_auth'],
)]
protected function listAuthAction(Arrayable $data): ApiResponse
{
    // …
}
```

PHPDoc tags and attributes **merge**; attributes win when both define the same field.

## What gets inferred without tags

The doc collector still picks up actions when tags are missing:

| Item | Inference rule |
|------|----------------|
| **Action methods** | Public/protected methods ending in `Action`, plus generic service macros. |
| **Action name** | Snake_case of the method name without the `Action` suffix (`listAuthAction` → `list_auth`). For generated services, actions follow `{verb}_{service}_action` (e.g. `delete_todo_action`). |
| **Auth** | Merged from `$serviceRequiresAuth`, `$actionsRequiringAuth`, `$actionPermissions` on the service. |

Inference is enough for an internal catalog, but **you should add `@moonlight-summary` and `@moonlight-example`** before sharing docs with frontend teams or external consumers.

## Response envelope

Every action returns the same JSON shape (see [Actions](/documentation/building-api/actions/)):

```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": {},
  "extraData": null
}
```

`returnCode: 0` means success. Document the **payload inside `returnData`** with `@moonlight-return`.

## Generate docs (`api:docs`)

```bash
php pionia api:docs
php pionia api:docs --ui
php pionia api:docs --format=openapi,markdown --output=docs/api
php pionia api:docs --check
```

| Option | Purpose |
|--------|---------|
| `--format=openapi,markdown,html` | Output formats (comma-separated). |
| `--output=docs/api` | Destination directory (default: `docs/api/` under app root). |
| `--ui` | Also write `index.html` (Scalar UI bundle). |
| `--check` | Exit with error if generated files differ from disk (CI). |

**Aliases:** `make:api-docs`, `docs:api`

### Print catalog JSON

```bash
php pionia api:catalog
php pionia api:catalog --json   # pretty-printed
```

Same source as `api:docs`, useful for scripts and debugging.

## Runtime docs (`/docs`)

When `DEBUG=true` or docs are explicitly enabled, the app serves live documentation from **registered services at boot** (not only committed files).

| URL | Content |
|-----|---------|
| `/docs` | Scalar interactive UI |
| `/docs/openapi.json` | OpenAPI spec |
| `/api/v1/__catalog` | JSON action catalog (debug gate) |

### Browsing `/docs`

Scalar lists **one document per service** (`auth`, `product`, …). Inside each document the endpoint is still the real Moonlight URL:

```text
POST /api/v1/
```

Pick an **example** for the action (`list_auth`, `create_auth`, …). The combined OpenAPI file (toolbar **OpenAPI** / `/docs/openapi.json`) keeps every action as examples on a single `POST /api/v1/`.

### Try it (Scalar sandbox)

1. Open `/docs` and select **`POST /api/v1/`**
2. Choose an **Example** such as `auth.create_auth`
3. Send — the request goes to `POST /api/v1/` with body `{ "service": "auth", "action": "create_auth", … }`

Optional `Authorization: Bearer …` headers work the same as curl. Clients and SDKs must always call the versioned base path with `{ "service", "action", ...params }` — never invent `/api/v1/auth/create_auth` or `/api/v1#auth.create_auth` URLs.

### Enable in staging/production

`environment/settings.ini`:

```ini
[docs]
ENABLED = true
```

Or `.env`:

```env
DOCS_ENABLED=true
```

Optional token (recommended when `DEBUG=false`):

```ini
[docs]
ENABLED = true
TOKEN = your-secret
```

```env
DOCS_TOKEN=your-secret
```

Access with `?token=your-secret` or header `X-Docs-Token: your-secret`.

See also [Developer stats](/documentation/operations/developer-stats/) — `/stats` uses a separate `STATS_TOKEN`.

## OpenAPI shape

Moonlight OpenAPI matches the runtime: **one POST URL**, many actions in the body.

| Layer | What it is |
|-------|------------|
| **Runtime** | One `POST` per API version (e.g. `/api/v1/`) with JSON `{ "service", "action", ...params }` |
| **OpenAPI / Scalar** | One path `POST /api/v1/` with `oneOf` request schemas and named **examples** per action |
| **Sidebar tags** | One tag per service (`auth`, `product`, …) pointing at that same POST |
| **`x-pionia-dispatch`** | Confirms method + URL for tooling |

Request shapes are inlined under `oneOf` (not a global Models catalog). Scalar is configured with `hideModels: true`.

Commit `docs/api/openapi.json` if your team consumes it in CI or client generators; regenerate after changing `@moonlight-*` tags.

## Full example service

```php
<?php

namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;

/**
 * Company categories.
 *
 * @moonlight-service category
 * @moonlight-version v1
 * @moonlight-table company
 */
class CategoryService extends Service
{
    /**
     * @moonlight-action list
     * @moonlight-summary List all companies
     * @moonlight-example {"service":"category","action":"list"}
     */
    protected function listAction(Arrayable $data): ApiResponse
    {
        return response(0, 'OK', ['items' => []]);
    }

    /**
     * @moonlight-action update
     * @moonlight-summary Update a company by id
     * @moonlight-param int id Row id
     * @moonlight-param string name New name
     * @moonlight-example {"service":"category","action":"update","id":1,"name":"Acme"}
     */
    protected function updateAction(Arrayable $data): ApiResponse
    {
        return response(0, 'Updated', ['id' => $data->get('id')]);
    }
}
```

Register `category` on your switch, run `php pionia api:docs --ui`, then open `/docs` to verify.

## Checklist for new actions

- [ ] Service has `@moonlight-service` (or relies on registry alias).
- [ ] Each public API method has `@moonlight-action` (or follows `*Action` naming).
- [ ] `@moonlight-summary` describes what the action does in one line.
- [ ] `@moonlight-example` shows a copy-paste JSON body with `service` and `action`.
- [ ] Params documented with `@moonlight-param` when non-obvious.
- [ ] `@moonlight-auth` set when auth differs from service default.
- [ ] Run `php pionia api:docs --check` in CI after changing tags.

## Common mistakes

- **Documenting REST URLs per action** — Moonlight clients always POST to `/api/v1/`; OpenAPI paths are for browsing only.
- **Skipping `@moonlight-example`** — frontend teams copy-paste from examples; include `"service"` and `"action"` keys.
- **Mismatching registry alias** — `@moonlight-service task` must match `MainSwitch::registerServices()` exactly.
- **Leaving `/docs` open in staging** — set `DOCS_TOKEN` when `DEBUG=false`.

## What's next

{{< card-grid >}}
{{< link-card title="Actions" description="Write the methods you document." href="/documentation/building-api/actions/" >}}
{{< link-card title="Moonlight security" description="@moonlight-auth and switch auth." href="/documentation/building-api/moonlight-security/" >}}
{{< link-card title="Commands" description="Full api:docs / api:catalog reference." href="/documentation/operations/commands/" >}}
{{< /card-grid >}}
