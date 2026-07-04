---
title: "Pionia Helpers"
slug: "helpers"
description: "Global shortcuts to AppRealm, Porm, Moonlight, cache, logging, and security after boot."
summary: "Reference grouped by DeskFlow tasks — responses, database, logging, and more."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 4000
toc: true
doc_type: reference
parent: "extending"
seo:
  title: "Pionia Helpers"
  description: "Global helpers for Moonlight responses, Porm queries, logging, and application access."
  noindex: false
---

## Who this is for

You are writing DeskFlow services and want quick access to common framework entry points — **`response()`** for Moonlight envelopes, **`table()`** for `tasks` / `team_members`, **`logger()`** for action traces — without wiring the container manually.

## What you will learn

- Which helpers to use for Moonlight responses, Porm queries, and logging
- Boot constraints (`AppRealm::create()` before helpers work)
- Where to find security, cache, async, and validation shortcuts

## Before you start

{{< prerequisites >}}
- Booted app via `bootstrap/application.php` (HTTP or `php pionia`)
- [Services](/documentation/building-api/services/) — where helpers are called from actions
- Optional: [App providers](/documentation/extending/app-providers/) — boot-time wiring when helpers are not yet available
{{< /prerequisites >}}

## How it works

Pionia exposes global **helpers** after the application boots. They wrap `AppRealm`, Porm, cache, logging, and Moonlight dispatch.

{{< mermaid >}}
flowchart LR
  Boot[AppRealm::create] --> Helpers[Global helpers]
  Helpers --> R[response]
  Helpers --> T[table / db]
  Helpers --> L[logger / report]
  R --> Task[TaskService actions]
  T --> Task
  L --> Task
{{< /mermaid >}}

{{< callout context="note" title="Boot timing" icon="outline/information-circle" >}}
Helpers like `app()`, `realm()`, and `logger()` are not available in `bootstrap/application.php` before `AppRealm::create()` returns. Use [service providers](/documentation/extending/app-providers/) for boot-time wiring.
{{< /callout >}}

---

## DeskFlow Moonlight responses — `response()`

Return the standard JSON envelope from any service action:

```php
protected function listAction(Arrayable $data): ApiResponse
{
    $rows = table('tasks')->where('status', $data->get('status', 'open'))->all();

    return response(0, 'OK', ['tasks' => $rows]);
}

protected function createAction(Arrayable $data): ApiResponse
{
    $this->mustAuthenticate();

    return response(0, 'Task created', ['id' => $newId]);
}
```

Related response helpers:

| Helper | Purpose |
|--------|---------|
| `response($code, $message, $data?)` | Standard Moonlight envelope |
| `cachedResponse()` / `recached()` | Cache action output when service caching is enabled |
| `renderToString()` | Render a template to HTML without exiting the process |

```php
$html = renderToString('emails/welcome', ['name' => $member->name]);
return cachedResponse($this, response(0, 'OK', $rows), 300);
```

Prefer `renderToString()` over deprecated `render()` (which exits in FPM/CLI).

---

## DeskFlow data access — `table()` / `db()`

Query Northwind tables through Porm:

```php
$task = table('tasks')->get($id);
$members = table('team_members')->where('active', 1)->all();
$pdo = connectionManager()->connection('default');
```

| Helper | Purpose |
|--------|---------|
| `table($name, …)` | Primary query builder entry |
| `db($name, …)` | Alias of `table()` |
| `connectionManager()` | Pooled PDO per process |

See [Database (Porm)](/documentation/database/).

---

## DeskFlow observability — `logger()` / `report()`

Trace actions and report throwables through the exception pipeline:

```php
protected function updateAction(Arrayable $data): ApiResponse
{
    logger()->info('task.update', [
        'task_id' => $data->get('id'),
        'user' => $this->auth()?->user?->email,
    ]);

    try {
        // …
    } catch (\Throwable $e) {
        report($e);
        throw $e;
    }

    return response(0, 'Updated');
}

logger('api')->debug('Payload', $payload);
```

| Helper | Purpose |
|--------|---------|
| `logger()` | Default PSR-3 channel |
| `logger('name')` | Named channel via `LogManager` |
| `report($throwable)` | Log via exception pipeline (no HTTP response) |

See [Logging](/documentation/operations/logging/).

---

## Application access — `app()` / `realm()` / `container()`

All three return the booted **`AppRealm`** singleton (v3):

```php
$debug = app()->environment()->get('DEBUG');
$routes = realm()->getRoutes();
$service = container()->get(MyService::class);
```

`realm()` and `container()` are aliases for the same instance after boot.

---

## Moonlight dispatch — `moonlight()` / `defer()` / `async()`

**Post-response work (same process, not a new thread):**

```php
defer(function () {
    logger()->info('Runs after the client received the JSON response');
});
```

Use **`defer()`** for fire-and-forget. Use **`async(closure)`** only when you need a promise (`.then()`, `await()`). On PHP 8.5+ cast unused promises: `(void) async(...)`.

**Moonlight jobs (durable / heavy work):**

```php
async('mail', 'send_welcome', ['email' => $user->email]);
moonlight()->async('mail', 'send_welcome', ['email' => $user->email]); // 202 + job_id when RR Jobs enabled
moonlight()->dispatch('member', 'list', ['limit' => 10]);             // sync programmatic call
```

See [Background work](/documentation/operations/background-work/) for execution order and runtime tables.

---

## API path helpers

| Helper | Example |
|--------|---------|
| `apiBase()` | `/api/` |
| `defaultApiVersion()` | `v1` |
| `apiVersionPath()` | `/api/v1/` |
| `apiPingPath()` | `/api/v1/ping` |
| `apiCatalogPath()` | `/api/v1/__catalog` |

Use these in templates and frontend config — not hard-coded `/api/v1` strings. Prefer them over deprecated `route()` or raw `baseUrl()` in application code.

---

## Environment and runtime — `env()` / `serverPort()`

```php
$port = serverPort();              // PORT → SERVER_PORT → settings.ini → 8000
$port = serverPort(9001);          // CLI override
setEnv('RUNTIME_FLAG', '1');       // request-scoped
$jwtSecret = env('JWT_SECRET_KEY');
```

---

## Security — `security()` and `secure_*`

`security()` returns the `Pionia\Security\Security` singleton. Every method has a snake_case helper.

| Category | Examples |
|----------|----------|
| Random / IDs | `secure_token()`, `secure_otp()`, `secure_uuid()`, `secure_ulid()`, `secure_password()` |
| Passwords | `hash_password()`, `verify_password()` — use PHP's `password_needs_rehash()` or `security()->needsRehash()` |
| Hashing | `secure_hash()`, `secure_hmac()`, `verify_hmac()`, `secure_equals()` |
| Symmetric crypto | `encrypt()`, `decrypt()` (needs `APP_KEY` + `ext-sodium`) |
| Public-key crypto | `security_key_pair()`, `encrypt_with_public_key()`, `rsa_encrypt()` |
| Validators | `is_uuid()`, `is_ulid()`, `is_otp()`, `is_token()` |

Full reference: [Security utilities](/documentation/security/security-utilities/).

```php
$token = secure_token();
$hash = hash_password($plain);
$sealed = encrypt_with_public_key('payload', $publicKey);
```

---

## Validation — `rules()` / `validate()` / `validations()`

```php
rules($data, [
    'email' => 'required|email',
    'password' => 'required|password|min:8',
]);

validate('email', $this->request)->required()->email();
validate('phone', $data)->required()->rule('kenya_phone');

validations()->extend('kenya_phone', function (ValidationContext $ctx): void {
    // …
});
```

See [Validations](/documentation/building-api/validation/).

---

## Caching — `cache()`

```php
cache()->set('key', $value, 300);
cache('redis')->get('session:1');
```

See [Caching](/documentation/operations/caching/).

---

## Other helpers

| Helper | Purpose |
|--------|---------|
| `alias()` | Resolve path aliases (`PUBLIC_DIR`, `STORAGE_DIR`) |
| `addIniSection()` | Runtime INI section (default `environment/generated.ini`) |
| `tap($value, $closure)` | Side effect then return original value |
| `envKeys()` | List loaded `.env` variable names (stats page) |
| `yesNo()` / `asBool()` | Display and env boolean coercion |
| `router($app)` | Register switches in provider `routes()` — app switches use `[app_switches]` |
| `framework()`, `version()`, `appName()` | Branding and core version metadata |

For framework internals (providers, kernel, cache adapters), generate local reference docs with `composer document:framework` → `build/docs/`.

## Common mistakes

- Calling `table()` or `logger()` inside `bootstrap/application.php` before `AppRealm::create()` returns
- Using `render()` in tests or workers — prefer `renderToString()` to avoid unexpected process exit
- Hard-coding `/api/v1` instead of `apiVersionPath()` — breaks when adding `v2`
- Using deprecated `route()` instead of `router($app)` in providers

## What's next

{{< card-grid >}}
{{< link-card title="Services" description="Where response() and table() are used." href="/documentation/building-api/services/" >}}
{{< link-card title="Logging" description="Channels, redaction, and report()." href="/documentation/operations/logging/" >}}
{{< link-card title="Database" description="Porm queries with table()." href="/documentation/database/" >}}
{{< /card-grid >}}
