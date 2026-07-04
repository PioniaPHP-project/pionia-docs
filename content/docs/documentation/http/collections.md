---
title: "Collections (Arrayable)"
slug: "collections"
description: "Working with request data and framework collections via Pionia\\Collections\\Arrayable."
summary: "Typed getters, merging, and chain helpers on Moonlight request payloads."
date: 2026-07-02
lastmod: 2026-07-02
draft: false
weight: 405
toc: true
doc_type: topic
parent: "documentation"
seo:
  title: "Arrayable collections in Pionia"
  description: "Request body data as Arrayable — getString, getInteger, merge, and validation-friendly accessors."
  noindex: false
---

Every Moonlight action receives request fields as **`Arrayable`** — a typed wrapper around JSON or form data. If you have written `$data['title']` in other PHP projects, this guide shows the DeskFlow way.

## What you will learn

- Read `title`, `project_id`, and `status` safely in `TaskService`
- Use typed getters (`getString`, `getInt`) instead of raw arrays
- Merge and subset payloads for validation

{{< prerequisites >}}
- [Actions](/documentation/building-api/actions/) — `*Action` method signatures
- [Glossary](/documentation/getting-started/glossary/) — service, action, envelope
{{< /prerequisites >}}

## How it works

```text
POST body (JSON)  →  decode  →  Arrayable $data  →  task.createAction($data)
```

Moonlight actions receive request fields as **`Arrayable`** — not a plain PHP `array`. Use `$data->get('key')` or typed getters; never `$data['key']`.

## In service actions

The first parameter to every `*Action` method is `Arrayable $data`:

```php
public function createTaskAction(Arrayable $data): ApiResponse
{
    $title = $data->getString('title');
    $projectId = $data->getInt('project_id');
    $status = $data->getString('status', 'open');

    // ...
}
```

`$this->request->getData()` on `Service` returns the same object.

## Common getters

| Method | Use |
|--------|-----|
| `getString($key, $default = null)` | Trimmed string |
| `getInteger` / `getPositiveInteger` / `getNegativeInteger` | Integers with sign checks |
| `getFloat` / `getBoolean` | Numeric and bool coercion |
| `getArray($key, $default = [])` | Nested array |
| `has($key)` | Key present and non-null |
| `only(array $keys)` | Subset as new `Arrayable` |
| `except(array $keys)` | All keys except listed |

See [Actions](/documentation/building-api/actions/) for the full list used in validation examples.

## Building and merging

```php
use Pionia\Collections\Arrayable;

$stack = new Arrayable(['request_id' => RequestIdMiddleware::class]);
$stack->merge(['cache' => CacheMiddleware::class]);

$payload = Arrayable::toArrayable(['service' => 'task', 'action' => 'list']);
```

Framework code uses `Arrayable` for middleware registration (`middlewares()` helper), provider lists, and INI-backed config merged at boot.

## JSON vs form data

`Arrayable` normalises both JSON bodies and `multipart/form-data` into the same accessor API. File uploads are **not** inside `$data` — use `FileBag` (second action parameter or `$this->request->getFileByName()`). See [Actions — request files](/documentation/building-api/actions/#request-files).

## Common mistakes

- **Using array syntax `$data['key']`** — always use `$data->get()` or typed getters.
- **Skipping defaults** — `getString('status', 'open')` avoids null checks for optional fields.
- **Assuming integers from JSON** — JSON numbers may arrive as strings; use `getInt()` for coercion.
- **Looking for uploaded files in `$data`** — attachments live on `FileBag`, not in the JSON body.

## What's next

{{< card-grid >}}
{{< link-card title="Actions" description="Full getter list and file uploads." href="/documentation/building-api/actions/" >}}
{{< link-card title="Validation" description="Reject bad task payloads with 422." href="/documentation/building-api/validation/" >}}
{{< link-card title="Helpers" description="arr() and other collection utilities." href="/documentation/extending/helpers/" >}}
{{< /card-grid >}}
