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
parent: "documentation"
seo:
  title: "Arrayable collections in Pionia"
  description: "Request body data as Arrayable — getString, getInteger, merge, and validation-friendly accessors."
  noindex: false
---

Moonlight actions receive request fields as **`Pionia\Collections\Arrayable`** — not a plain PHP `array`. Use `$data->get('key')` or typed getters; never `$data['key']`.

## In service actions

The first parameter to every `*Action` method is `Arrayable $data`:

```php
public function createUserAction(Arrayable $data): ApiResponse
{
    $email = $data->getString('email');
    $age = $data->getPositiveInteger('age');
    $roles = $data->getArray('roles', []);

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

See [Actions](/documentation/services/actions/) for the full list used in validation examples.

## Building and merging

```php
use Pionia\Collections\Arrayable;

$stack = new Arrayable(['request_id' => RequestIdMiddleware::class]);
$stack->merge(['cache' => CacheMiddleware::class]);

$payload = Arrayable::toArrayable(['service' => 'auth', 'action' => 'login']);
```

Framework code uses `Arrayable` for middleware registration (`middlewares()` helper), provider lists, and INI-backed config merged at boot.

## JSON vs form data

`Arrayable` normalises both JSON bodies and `multipart/form-data` into the same accessor API. File uploads are **not** inside `$data` — use `FileBag` (second action parameter or `$this->request->getFileByName()`). See [Actions — request files](/documentation/services/actions/#request-files).

## Related

- [Actions](/documentation/services/actions/) — action signatures and typed getters
- [Validations](/documentation/services/validation/) — `ValidationException` for bad input
- [Helpers](/documentation/helpers/) — `arr()` for lightweight array helpers
