---
title: "Requests and Responses"
slug: "requests-and-responses"
description: "Guides us through the process of handling requests and responses in pionia."
summary: "Moonlight actions receive Arrayable request data and return ApiResponse envelopes."
date: 2024-05-24T13:45:48.890Z
lastmod: 2026-07-02
draft: false
weight: 700
toc: true
seo:
  title: "Requests and Responses" # custom title (optional)
  description: "Guides us through the process of handling requests and responses in pionia." # custom description (recommended)
  noindex: false # false (default) or true
---

{{<picture src="pionia.png" alt="Pionia Logo">}}

## Handling Requests and Responses

In Pionia, every action receives request fields as **`Pionia\Collections\Arrayable`** (not a plain PHP `array`) and returns an **`ApiResponse`** envelope. This guide covers HTTP entry points, reading `$data`, validation, and responses.

{{< callout note >}}
`Arrayable` wraps JSON and form fields with typed getters (`getString`, `getInt`, …). See [Collections (Arrayable)](/documentation/collections/) and [Actions](/documentation/services/actions/) for the full accessor reference.
{{</ callout >}}

### Request

Moonlight APIs use versioned paths. Common patterns:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/ping` | Health check |
| POST | `/api/v1/` | Dispatch `{ "service", "action", ...params }` |
| GET | `/api/v1/{service}/{action}/` | Optional query-string dispatch |

```bash
curl -s http://127.0.0.1:8003/api/v1/ping
curl -s -X POST http://127.0.0.1:8003/api/v1/ \
  -H 'Content-Type: application/json' \
  -d '{"service":"welcome","action":"ping"}'
```

{{<callout context="tip" title="Ping endpoint" icon="outline/pencil">}}
Use **`GET /api/v1/ping`** for health checks. Each switch version gets its own ping route.
{{</callout>}}

**POST** is the primary dispatch verb — send JSON with `service` and `action` keys plus any parameters.

### Endpoint

Each **switch** registers an API version (e.g. `v1` → `/api/v1/`). Register switches in `environment/settings.ini`:

```ini
[app_switches]
v1=Application\Switches\MainSwitch
```

To add a second API version, add another line:

```ini
[app_switches]
v1=Application\Switches\MainSwitch
v2=Application\Switches\SecondSwitch
```

This registers `SecondSwitch` at `/api/v2/`.

{{<callout context="note" title="Note" icon="outline/pencil">}}
All switches registered via `[app_switches]` are mounted under the `/api/` prefix (e.g. `/api/v1/`, `/api/v2/`).

For how routes are matched and cached in production, see [HTTP routing](/documentation/http-routing/).
{{</callout>}}

### Request Data

Pionia supports both **JSON** and **multipart form** bodies. Prefer JSON unless you are uploading files.

Every `*Action` method receives the decoded body as **`Arrayable $data`** — the first parameter:

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;

protected function createUserAction(Arrayable $data): ApiResponse
{
  $name = $data->getString('name');
  $email = $data->getString('email');

  // your logic here
}
```

Use **`$data->get('key', $default)`** or typed getters (`getString`, `getInt`, `getBool`, `getArray`, …). Do **not** use `$data['name']` — `Arrayable` is an object, not a native array.

`$this->request->getData()` on `Service` returns the same `Arrayable` instance for the current request.

### File uploads

When the client sends `multipart/form-data`, non-file fields are still on `$data`. Uploaded files are **not** in `$data` — use the optional second parameter **`FileBag $files`** or `$this->request->getFileByName('avatar')`:

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Bag\FileBag;
use Pionia\Http\Response\ApiResponse;

protected function uploadAction(Arrayable $data, FileBag $files): ApiResponse
{
  $file = $files->get('avatar');
  $title = $data->getString('title');

  // your logic here
}
```

See [Actions — request files](/documentation/services/actions/#request-files).

### Required fields

For **presence only**, call `$this->requires()` (reads `$this->request->getData()` internally):

```php
protected function retrieveAction(Arrayable $data): ApiResponse
{
  $this->requires('id');

  $id = $data->get('id');
  // …
}
```

For presence **and** format, prefer attributes or `rules()` with `required`:

```php
#[Validated(rules: ['name' => 'required|string', 'email' => 'required|email'])]
protected function registerAction(Arrayable $data): ApiResponse
{
  $name = $data->getString('name');
  $email = $data->getString('email');
  // …
}
```

`requires()` throws `FailedRequiredException`. `rules()` and attributes throw `ValidationException` (HTTP 422).

## Validating request data

### Attributes (recommended)

Rules on the action method run automatically before the body:

```php
use Pionia\Validations\Attributes\Validated;

#[Validated(rules: [
    'email' => 'required|email',
    'password' => 'required|password|min:8',
    'password_confirmation' => 'required|confirmed:password',
    'age' => 'integer|min:18',
    'nickname' => 'nullable|string|min:2',
])]
protected function registerAction(Arrayable $data): ApiResponse
{
  // business logic
}
```

See [Validations](/documentation/services/validation/) for `#[ValidateField]`, custom rules, and the full rule list.

### `rules()` — inside the action

```php
rules($data, [
    'email' => 'required|email',
    'password' => 'required|password|min:8',
    'password_confirmation' => 'required|confirmed:password',
    'age' => 'integer|min:18',
    'nickname' => 'nullable|string|min:2',
]);
```

### `validate()` — single field chain

```php
validate('email', $data)->required()->email();
validate('password', $data)->required()->asPassword();
```

Pass **`Arrayable $data`**, `$this`, or `$this->request` as the second argument.

All validation failures throw **`ValidationException`** (HTTP 422).

## Response

All responses that hit the application server return a `200 OK` status code. And as a result, Pionia returns back the power to define
the return code of the response. This is done by returning an `ApiResponse` object.

Pionia returns an `ApiResponse` object for every action. This object is used to send responses back to the client.

This response consists of the following fields:

- `returnCode`: This is the return code of the response. It is an integer and is required.
- `returnMessage`: This is the return message of the response. It is a string or null.
- `returnData`: This is the return data of the response. It is an array or null.
- `extraData`: This is any extra data you want to send back. It is an array or null.

### Exceptions

In Pionia, wherever you're, you can throw an exception. This will be caught by the framework and the response will be sent back to the client.

Therefore, to abort any action or task on going, you can just throw an exception with clear message.

```php
use Pionia\Collections\Arrayable;
use Pionia\Exceptions\ValidationException;
use Pionia\Http\Response\ApiResponse;

protected function saveAction(Arrayable $data): ApiResponse
{
    throw new ValidationException('This stops the action with HTTP 422');
}
```

See [Exceptions & error handling](/documentation/exceptions/) for status codes and the pipeline.

## Static assets & SPA

| URL | Source | Purpose |
|-----|--------|---------|
| `/` | `public/index.html` or framework welcome page | Home / SPA shell |
| `/static/{path}` | `public/static/` | Your CSS, images, uploads served as files |
| `/media/{path}` | `storage/media/` | User media from disk |
| `/__pionia/{path}` | Framework bundle | Welcome page CSS, logos (do not copy into your app) |

`php pionia serve` and RoadRunner both route static paths through Pionia's HTTP kernel. After a Vite build, `public/index.html` and hashed assets are served from `public/`.

SPA client routes (e.g. `/dashboard`) fall back to `index.html` when configured — see [Frontend integration](/documentation/frontend-integration-vite/).

{{<callout context="note" icon="outline/information-circle">}}
Only `public/static/` is wired to `/static/`. A nested `public/public/static/` folder is **not** served unless you add custom routes.
{{</callout>}}

{{<callout context="note" title="Note" icon="outline/pencil">}}
By default, Pionia reserves `returnCode` of `0` for successful responses. This is just a convention, and you can use any other code you want.
{{</callout>}}
