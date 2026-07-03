---
title: "Pionia Helpers"
slug: "helpers"
description: "Helpers just provide us shortcuts to accessing rather complex logic"
summary: "Helpers assist in quickly accessing parts of our application without implicitly creating instances."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 4000
toc: true
seo:
  title: "Pionia Helpers" # custom title (optional)
  description: "Guides on which helpers we have and how to use them in our code cycle" # custom description (recommended)
  noindex: false # false (default) or true
---

# Introduction

Pionia exposes global **helpers** after the application boots (`bootstrap/application.php` → HTTP or console). They wrap `AppRealm`, Porm, cache, logging, and Moonlight dispatch.

{{<callout context="note" icon="outline/information-circle">}}
Helpers like `app()`, `realm()`, and `logger()` are not available in `bootstrap/application.php` before `AppRealm::create()` returns. Use [service providers](/documentation/extending/app-providers/) for boot-time wiring.
{{</callout>}}

### app() / realm() / container()

All three return the booted **`AppRealm`** singleton (v3):

```php
$debug = app()->environment()->get('DEBUG');
$routes = realm()->getRoutes();
$service = container()->get(MyService::class);
```

`realm()` and `container()` are aliases for the same instance after boot.

### db() / table() / connectionManager()

See [Database (Porm)](/documentation/database/). `db()` is an alias of `table()`.

```php
$row = table('users')->get(1);
$pdo = connectionManager()->connection('default');
```

### cache()

```php
cache()->set('key', $value, 300);
cache('redis')->get('session:1');
```

See [Caching](/documentation/caching-in-pionia/).

### logger() / report()

```php
logger()->info('Order placed', ['id' => $orderId]);
logger('api')->debug('Payload', $payload);
report($throwable); // exception pipeline logging only
```

### moonlight() / defer() / async()

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
moonlight()->dispatch('auth', 'list_users', ['limit' => 10]);         // sync programmatic call
```

See [Background work](/documentation/background-work/) for execution order and runtime tables.

### API path helpers

| Helper | Example |
|--------|---------|
| `apiBase()` | `/api/` |
| `defaultApiVersion()` | `v1` |
| `apiVersionPath()` | `/api/v1/` |
| `apiPingPath()` | `/api/v1/ping` |
| `apiCatalogPath()` | `/api/v1/__catalog` |

Use these in templates and frontend config — not hard-coded `/api/v1` strings.

### env() / setEnv() / serverPort()

```php
$port = serverPort();              // PORT → SERVER_PORT → settings.ini → 8003
$port = serverPort(9001);          // CLI override
setEnv('RUNTIME_FLAG', '1');       // request-scoped
```

### security() and secure_* helpers

`security()` returns the `Pionia\Security\Security` singleton. Every method has a snake_case helper — use whichever reads better in your action.

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

## Additional helpers

### alias()

Resolve a path alias registered on the realm (e.g. `PUBLIC_DIR`, `STORAGE_DIR`):

```php
$public = alias(\DIRECTORIES::PUBLIC_DIR->name);
```

### addIniSection()

Add or update an INI section at runtime (defaults to `environment/generated.ini`):

```php
addIniSection('plugin_settings', ['foo' => 'bar']);
```

### tap()

Run a value through a closure and return the original value:

```php
$user = tap($user, fn ($u) => logger()->info('Created', ['id' => $u->id]));
```

### rules()

Validate multiple fields with pipe-separated rules (same syntax as action attributes):

```php
rules($data, [
    'email' => 'required|email',
    'password' => 'required|password|min:8',
]);
```

### validate()

Build a field validator from request or service data:

```php
validate('email', $this->request)->required()->email();
validate('phone', $data)->required()->rule('kenya_phone');
```

### validations()

Shared registry for custom rules (register in a provider or at bootstrap):

```php
validations()->extend('kenya_phone', function (ValidationContext $ctx): void {
    // …
});
```

See [Validations](/documentation/services/validation/).

### envKeys()

List all `.env` variable names loaded at boot (used by the developer stats page):

```php
foreach (envKeys() as $name) {
    // ...
}
```

### renderToString() / render()

Prefer `renderToString()` for templates — it returns HTML without terminating the process. `render()` is deprecated and exits in FPM/CLI mode.

```php
$html = renderToString('emails/welcome', ['name' => $user->name]);
```

### cachedResponse() / recached()

Cache a Moonlight action response when the service has caching enabled:

```php
return cachedResponse($this, response(0, 'OK', $rows), 300);
return recached($this, 0, 'OK', $rows, null, 300);
```

### yesNo() / asBool()

```php
$label = yesNo($user->active, 'Active', 'Inactive');
if (asBool(env('FEATURE_X'))) { /* ... */ }
```

### router() vs route()

Use `router($app)` in provider `routes()` hooks or advanced boot code. App switches belong in `[app_switches]` in `settings.ini`. The `route()` helper is a deprecated alias.

### baseUrl() vs apiBase()

Prefer `apiBase()` and the versioned helpers (`apiVersionPath()`, `apiPingPath()`) in application code. `baseUrl()` reads the raw `API_BASE` environment variable directly.

### Framework metadata

`framework()`, `version()`, `frameworkLogo()`, `frameworkTag()`, and `appName()` expose branding from the booted realm. `version()` returns the installed `pionia/pionia-core` Composer version (same value shown by `php pionia` in the CLI banner).

For framework internals (providers, kernel, cache adapters), generate local reference docs with `composer document:framework` → `build/docs/`.

