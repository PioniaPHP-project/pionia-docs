---
title: "Collections (Arrayable)"
slug: "collections"
description: "Working with request data and framework collections via Pionia\\Collections\\Arrayable."
summary: "Typed getters, merging, chain helpers, and the full Arrayable API on Moonlight payloads."
date: 2026-07-02
lastmod: 2026-07-13
draft: false
weight: 405
toc: true
doc_type: reference
parent: "documentation"
seo:
  title: "Arrayable collections in Pionia"
  description: "Request body data as Arrayable — get(), typed getters, merge, map, filter, and validation-friendly accessors."
  noindex: false
---

Every Moonlight action receives request fields as **`Pionia\Collections\Arrayable`** — a typed wrapper around JSON or form data. If you have written `$data['title']` in other PHP projects, this guide shows the Pionia Shop way.

## What you will learn

- Read `title`, `project_id`, and `status` safely in `ProductService`
- Use typed getters and `get($key, $default)` instead of raw arrays
- Chain collection helpers (`map`, `filter`, `only`, `merge`) on payloads and config lists
- Create collections with `new Arrayable([...])` or the `arr()` helper

{{< prerequisites >}}
- [Actions](/documentation/building-api/actions/) — `*Action` method signatures
- [Glossary](/documentation/getting-started/glossary/) — service, action, envelope
{{< /prerequisites >}}

## How it works

```text
POST body (JSON)  →  decode  →  Arrayable $data  →  product.createAction($data)
```

Moonlight actions receive request fields as **`Arrayable`** — not a plain PHP `array`. Use `$data->get('key')` or typed getters; never `$data['key']`.

The first parameter to every `*Action` method is `Arrayable $data`. `$this->request->getData()` on `Service` returns the same object for the current request.

```php
public function createTaskAction(Arrayable $data): ApiResponse
{
    $title = $data->getString('title');
    $projectId = $data->getInt('project_id');
    $status = $data->get('status', 'open'); // default only on get()

    return response(0, 'Task created', compact('title', 'projectId', 'status'));
}
```

## Creating collections

| Approach | Example |
|----------|---------|
| Constructor | `new Arrayable(['service' => 'task', 'action' => 'list'])` |
| From another `Arrayable` | `new Arrayable($existing)` — copies underlying array |
| Static factory | `Arrayable::toArrayable(['a' => 1])` |
| Global helper | `arr(['a' => 1])` — same as `new Arrayable(...)` |

Indexed PHP arrays are normalised to string keys when passed to the constructor (e.g. `['billing', 'reports']` becomes `['0' => 'billing', '1' => 'reports']`).

Framework code uses `Arrayable` for middleware registration (`middlewares()`), provider lists, and INI-backed config merged at boot.

## Reading values

### `get($key, $default = null)`

Primary accessor. Key lookup is **case-insensitive** (`title`, `Title`, and `TITLE` match). Pass `null` as the key to return the full underlying array (same as `toArray()`).

```php
$title = $data->get('title');
$limit = $data->get('limit', 10);
$all = $data->get(null); // array of every field
```

Use `get()` when you need a **default** for optional fields. Typed getters below return `null` when the key is missing — they do not accept a default argument.

### `getOrThrow($key, Throwable|string|null $exception = null)`

Like `get()`, but throws when the value is empty. Stops the action before business logic runs on missing required input (prefer [validation](/documentation/building-api/validation/) for client-facing 422 responses).

```php
$username = $data->getOrThrow('username');
$password = $data->getOrThrow('password', 'Password cannot be empty');
```

### Typed getters

All read through `get()` and coerce when present. Return `null` if the key is missing.

| Method | Returns | Coercion |
|--------|---------|----------|
| `getString($key)` | `?string` | Casts scalars; JSON-encodes nested arrays |
| `getInt($key)` | `?int` | Casts numeric strings from JSON |
| `getFloat($key)` | `?float` | Casts to float |
| `getBool($key)` | `?bool` | Casts to bool |
| `getArray($key)` | `?array` | Casts to array |
| `getArrayable($key)` | `?Arrayable` | Wraps array/scalar in `arr()` |
| `getJson($key)` | `false\|string\|null` | JSON-encodes arrays (`JSON_THROW_ON_ERROR`) |
| `getPositiveInteger($key)` | `?int` | Integers `> 0` only, else `null` |
| `getNegativeInteger($key)` | `?int` | Integers `< 0` only, else `null` |
| `getA($key, $className)` | `object\|null` | Instantiates class with array values as constructor args |

```php
$page = $data->getInt('page') ?? 1;
$tags = $data->getArrayable('tags'); // nested Arrayable for sub-fields
```

### Magic properties

`Arrayable` implements `__get`, `__set`, `__isset`, and `__unset`:

```php
$email = $data->email;           // same as get('email')
$data->status = 'open';          // same as add/set
isset($data->title);             // same as has('title')
unset($data->draft);             // same as remove('draft')
```

Prefer explicit `get()` / `getString()` in service actions for clarity.

## Presence and subset

| Method | Purpose |
|--------|---------|
| `has($key)` | Key exists (case-insensitive) |
| `only($keys)` | Keep listed keys **in place**; returns `$this` |
| `all()` / `toArray()` | Plain PHP array copy |
| `toJson()` / `__toString()` | JSON string of the collection |
| `size()` / `isEmpty()` / `isFilled()` | Count and emptiness checks |
| `keys()` / `values()` | `array_keys` / `array_values` |
| `at($index)` | Value at positional index in key order |
| `first()` / `last()` | First / last value |
| `find(callable $cb)` | First matching value (`array_find`) |
| `any(callable $cb)` | Whether any value matches (`array_any`) |

`only()` mutates the current instance. To keep the original payload, copy first:

```php
$subset = arr($data->all())->only(['title', 'status']);
```

There is no `except()` method — use `only()` on the keys you need, or `filter()` with a callback.

## Mutation (chainable — returns `$this`)

| Method | Purpose |
|--------|---------|
| `set($key, $value)` | Set or overwrite one key |
| `add($key, $value = null)` | Add key; if value omitted, value = key |
| `addAtKey($key, $value)` | Merge arrays, concat strings, or add numbers |
| `remove($key)` | `unset` one key |
| `merge(array\|Arrayable\|null)` | `array_merge` into current data |
| `replace($key, $value = null)` | Overwrite key (value defaults to key) |
| `addBefore($positionKey, $key, $value = null)` | Insert before a key |
| `addAfter($positionKey, $key, $value = null)` | Insert after a key |
| `flush()` | Clear all entries |
| `shift()` / `pop()` | Remove first / last element (returns value) |
| `unshift(array $value)` | Prepend values |

```php
$stack = arr(['request_id' => RequestIdMiddleware::class]);
$stack->merge(['cache' => CacheMiddleware::class]);
```

## Transform (chainable — mutates in place)

| Method | Purpose |
|--------|---------|
| `map(callable)` | `array_map` |
| `mapWithKeys(callable)` | Flatten callback key/value pairs into one array |
| `filter(?callable)` | `array_filter` (values only) |
| `where(callable)` | `array_filter` with key and value |
| `reduce(callable, $initial = null)` | `array_reduce` |
| `each(callable)` | Side-effect loop; returns `$this` |
| `sort(callable)` | `usort` on values |
| `sortKeys(callable)` | `uksort` |
| `sortValues(callable)` | `uasort` |
| `reverse()` | `array_reverse` |
| `slice($offset, $length, $preserve_keys)` | `array_slice` |
| `chunk($size, $preserve_keys)` | `array_chunk` |
| `keysToLowerCase()` / `keysToUpperCase()` | Normalise key casing |
| `valuesToLowerCase()` | `strtolower` on scalar values |

`differenceFrom(Arrayable|array $other)` returns a **new** `Arrayable` of values in `$this` not in `$other`.

## Array shape introspection

| Method | Purpose |
|--------|---------|
| `type()` | `EMPTY`, `INDEXED`, `ASSOCIATIVE`, or `MIXED` (uppercase) |
| `arrayType(?array)` | `indexed`, `associative`, or `mixed` |
| `isAssoc(?array)` | Associative keys |
| `isMixed(?array)` | Both int and string keys |

## Macros (`Microable`)

`Arrayable` uses the `Microable` trait. Register app-wide extensions:

```php
Arrayable::macro('pluck', function (string $key) {
    return $this->map(fn ($row) => is_array($row) ? ($row[$key] ?? null) : null);
});

arr([['id' => 1], ['id' => 2]])->pluck('id');
```

## JSON vs form data

`Arrayable` normalises both JSON bodies and `multipart/form-data` into the same accessor API. File uploads are **not** inside `$data` — use `FileBag` (second action parameter or `$this->request->getFileByName()`). See [Actions — request files](/documentation/building-api/actions/#request-files).

## With validation

Validate and read in one line with `validate(...)->…->get()` — see [Validation — validate and extract](/documentation/building-api/validation/#validate-and-extract---get).

```php
$email = validate('email', $data)->required()->email()->get();
$title = validate('title', $data)->required()->string()->min(3)->get();
```

## Common mistakes

- **Using array syntax `$data['key']`** — always use `$data->get()` or typed getters.
- **Passing defaults to `getString()` / `getInt()`** — only `get($key, $default)` supports defaults; use `getInt('page') ?? 1` or validate with `->get()`.
- **Calling `except()`** — not part of `Arrayable`; use `only()` on a copy or `filter()`.
- **Assuming integers from JSON** — JSON numbers may arrive as strings; use `getInt()` for coercion.
- **Looking for uploaded files in `$data`** — attachments live on `FileBag`, not in the JSON body.
- **Expecting `only()` to return a new instance** — it mutates in place; copy with `arr($data->all())` first.

## What's next

{{< card-grid >}}
{{< link-card title="Actions" description="Action signatures and file uploads." href="/documentation/building-api/actions/" >}}
{{< link-card title="Validation" description="validate()->get() and HTTP 422." href="/documentation/building-api/validation/" >}}
{{< link-card title="Helpers" description="arr() and other collection utilities." href="/documentation/extending/helpers/" >}}
{{< /card-grid >}}
