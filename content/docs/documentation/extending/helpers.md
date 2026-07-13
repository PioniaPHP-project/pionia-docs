---
title: "Pionia Helpers"
slug: "helpers"
description: "Global shortcuts to AppRealm, Porm, Moonlight, cache, logging, and security after boot."
summary: "Reference grouped by DeskFlow tasks — responses, database, logging, and more."
date: 2026-07-01
lastmod: 2026-07-13
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
  Boot["AppRealm::create"] --> Helpers[Global helpers]
  Helpers --> R[response]
  Helpers --> T["table / db"]
  Helpers --> L["logger / report"]
  R --> Task[TaskService actions]
  T --> Task
  L --> Task
{{< /mermaid >}}

{{< callout context="note" title="Boot timing" icon="outline/information-circle" >}}
Helpers like `app()`, `realm()`, and `logger()` are not available in `bootstrap/application.php` before `AppRealm::create()` returns. Use [service providers](/documentation/extending/app-providers/) for boot-time wiring.
{{< /callout >}}

---

## Application & container

### `app()`

Returns the booted **`AppRealm`** singleton — the same object as `realm()`, `container()`, and `pionia()`. Use it anywhere you need the application container after boot. Returns `AppRealm`.

```php
$cacheTtl = app()->appItemsCacheTTL;
$projectRoot = app()->appRoot();
```

### `pionia()`

Alias of `app()` for readable boot-time chaining (`pionia()->addAppProvider(...)`). Returns the booted `AppRealm` instance.

```php
pionia()->addAppProvider(\Application\Providers\DeskFlowProvider::class);
```

### `realm()`

Returns the booted `AppRealm` singleton. Identical to `app()` and `container()` after `AppRealm::create()` completes. Returns `AppRealm`.

```php
$pipeline = realm()->exceptions();
```

### `container()`

Bootstraps and returns the `AppRealm` singleton on first call (loads `bootstrap/application.php`). All other container helpers delegate here. Returns `AppRealm`.

```php
$memberService = container()->get(\Application\Services\MemberService::class);
```

### `container_path()`

Resolves the absolute path to `bootstrap/application.php` (or `CONTAINER_PATH` when defined). Used internally by `container()`; rarely needed in application code. Returns `string`.

```php
$bootstrap = container_path(); // …/DeskFlow/bootstrap/application.php
```

### `runtimeMode()`

Detects how PHP is running: `fpm`, `cli`, `worker`, or `testing` (from `PIONIA_RUNTIME`, `PIONIA_TESTING`, or `PHP_SAPI`). Use it to branch behaviour in tests vs RoadRunner workers. Returns `RuntimeMode`.

```php
if (runtimeMode() === \Pionia\Runtime\RuntimeMode::Worker) {
    logger()->debug('DeskFlow worker handling task sync');
}
```

### `setRuntimeMode(RuntimeMode $mode)`

Defines `PIONIA_RUNTIME` when not already set — typically in `worker.php` or test bootstrap. Call once per process before helpers that depend on runtime mode. Returns `void`.

```php
setRuntimeMode(\Pionia\Runtime\RuntimeMode::Worker);
```

---

## Moonlight responses

### `response(int $returnCode = 0, ?string $returnMessage = null, mixed $returnData = null, mixed $extraData = null)`

Builds the standard Moonlight JSON envelope (`ApiResponse`). This is the primary return type from service actions. Returns `ApiResponse`.

```php
protected function listAction(Arrayable $data): ApiResponse
{
    $tasks = table('tasks')
        ->where('project_id', $data->get('project_id'))
        ->where('status', 'open')
        ->all();

    return response(0, 'OK', ['tasks' => $tasks]);
}
```

### `cachedResponse(Service $instance, ApiResponse $response, mixed $ttl = 60)`

Stores the response in cache when the service has caching enabled. Cache key is `{service}_{action}` in snake_case. Pass `$this` as the service instance. Returns the same `ApiResponse` unchanged.

```php
protected function listAction(Arrayable $data): ApiResponse
{
    $rows = table('tasks')->where('assignee', 'alex@northwind.studio')->all();
    $envelope = response(0, 'OK', ['tasks' => $rows]);

    return cachedResponse($this, $envelope, 300);
}
```

### `recached(Service $instance, ?int $returnCode = 0, ?string $returnMessage = null, mixed $returnData = null, mixed $extraData = null, mixed $ttl = 60)`

Shorthand for `cachedResponse($instance, response(...), $ttl)` with readable positional arguments. Only effective when service caching is enabled. Returns `ApiResponse`.

```php
protected function summaryAction(Arrayable $data): ApiResponse
{
    $count = table('tasks')->where('project_id', $data->get('project_id'))->count();

    return recached($this, 0, 'Project summary', ['open_tasks' => $count], null, 120);
}
```

### `renderToString($file, ?array $data = [])`

Renders a template to an HTML string without terminating the process. Preferred in tests, workers, and email bodies. Returns `string`.

```php
$html = renderToString('emails/task-assigned', [
    'member' => 'alex@northwind.studio',
    'task' => table('tasks')->get($taskId),
]);
```

### `render($file, ?array $data = [])` — deprecated

**Deprecated since v3.0.** Echoes template output and calls `exit(0)` in FPM/CLI mode. Use `renderToString()` and send the result yourself. Returns `void` (or returns early in worker/testing mode).

```php
// Avoid in new code — use renderToString() instead
render('pages/welcome', ['app' => 'DeskFlow']);
```

---

## Collections

### `arr(null|Arrayable|array $array = [])`

Wraps an array or existing `Arrayable` in a new `Arrayable` instance. Same as `new Arrayable(...)`. Returns `Arrayable`.

```php
$payload = arr(['service' => 'task', 'action' => 'create', 'project_id' => 42]);
$title = $payload->get('title');
```

---

## Database

### `table(string $tableName, ?string $tableAlias = null, ?string $using = null)`

Primary Porm query-builder entry for a database table. Chain `where()`, `get()`, `all()`, etc. Returns `Porm`.

```php
$task = table('tasks')->where('id', $taskId)->get();
$members = table('team_members')->where('project_id', $projectId)->all();
```

### `db(string $tableName, ?string $tableAlias = null, ?string $using = null)`

Alias of `table()`. Use whichever reads more naturally in your action. Returns `Porm|null` (always non-null in practice).

```php
$project = db('projects')->where('slug', 'deskflow-alpha')->first();
```

### `connectionManager()`

Returns the pooled `ConnectionManager` for the current process. Use for raw PDO access or multi-connection setups. Returns `ConnectionManager`.

```php
$pdo = connectionManager()->connection('default');
$stmt = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE project_id = ?');
```

---

## Validation

Prefer **`validate('field', $data)->…->get()`** to validate and extract a value in one expression. See [validate and extract with `->get()`](/documentation/building-api/validation/#validate-and-extract---get).

### `validate(string $field, Arrayable|Request|Service $data)`

Starts a chainable single-field validator. Accepts action payload (`Arrayable`), `Request`, or `Service` (uses request data). Returns `Validator`.

```php
protected function assignAction(Arrayable $data): ApiResponse
{
    $taskId = validate('task_id', $data)->required()->integer()->get();
    $email = validate('assignee', $data)->required()->email()->get();

    table('tasks')->where('id', $taskId)->update(['assignee' => $email]);

    return response(0, 'Task assigned', ['assignee' => $email]);
}
```

### `rules(Arrayable|Request|Service $data, array $fieldRules)`

Validates multiple fields at once using pipe-delimited rule strings. Throws on failure. Returns `void`.

```php
rules($data, [
    'title' => 'required|string|min:3',
    'project_id' => 'required|integer',
    'assignee' => 'required|email',
]);
```

### `validations()`

Returns the shared `ValidationManager` singleton for registering custom rules. Returns `ValidationManager`.

```php
validations()->extend('deskflow_member', function (\Pionia\Validations\ValidationContext $ctx): void {
    if (!table('team_members')->where('email', $ctx->value)->exists()) {
        $ctx->fail('Member not found in this project.');
    }
});
```

---

## Logging & exceptions

### `logger(?string $channel = null)`

Returns the default PSR-3 logger, or a named channel via `LogManager`. Use in every service action for traceability. Returns `LoggerInterface`.

```php
logger()->info('task.create', [
    'project_id' => $data->get('project_id'),
    'created_by' => 'alex@northwind.studio',
]);

logger('api')->debug('Moonlight payload', $data->all());
```

### `report(\Throwable|string $message, array $context = [])`

Reports a throwable through the exception pipeline, or logs a string message at error level. Does not render an HTTP response. Returns `void`.

```php
try {
    table('tasks')->insert(['title' => $title, 'project_id' => $projectId]);
} catch (\Throwable $e) {
    report($e);
    throw $e;
}

report('DeskFlow sync failed for project', ['project_id' => $projectId]);
```

### `pionia_handle_exception(\Throwable $e, ?Request $request = null)`

Resolves a throwable through the configured global exception handler and returns a Moonlight-shaped `ApiResponse`. Use in custom front controllers or tests. Returns `ApiResponse`.

```php
$response = pionia_handle_exception($e, $request);
```

### `shouldLogResponses()`

Returns whether API responses should be written to the log (`[logging] LOG_RESPONSES` in settings). Returns `bool`.

```php
if (shouldLogResponses()) {
    logger('api')->info('response', ['action' => 'task.list']);
}
```

---

## Environment

### `env(?string $key = null, mixed $default = null)`

Reads a value from the loaded environment. Pass `null` for both key and default to receive the entire environment array. Returns `mixed`.

```php
$jwtSecret = env('JWT_SECRET_KEY');
$port = env('PORT', 8000);
```

### `setEnv(string $key, mixed $value)`

Sets a request-scoped environment value retrievable only via `env()`. Preserves the original key casing when the key already exists in `$_ENV` / `$_SERVER`. Returns `void`.

```php
setEnv('DESKFLOW_SYNC', '1');
```

### `envKeys()`

Lists all variable names loaded from `.env` (from `PIONIA_ENV_VARS`). Useful for the stats page and debugging. Returns `list<string>`.

```php
$loaded = envKeys(); // ['APP_NAME', 'PORT', 'JWT_SECRET_KEY', …]
```

### `serverPort(int|string|null|false $cliOverride = null)`

Resolves the HTTP port: CLI override → `PORT` / `SERVER_PORT` → `settings.ini` → default **8000**. Use in Vite proxy config and health checks. Returns `int`.

```php
$port = serverPort();           // 8000 for DeskFlow dev
$apiUrl = 'http://127.0.0.1:' . serverPort() . apiPingPath();
```

### `isDebug()`

Returns whether debug mode is active (`DEBUG` / `APP_DEBUG`). Docs and stats gates follow this when not explicitly configured. Returns `bool`.

```php
if (isDebug()) {
    logger()->debug('task payload', $data->all());
}
```

---

## API paths

Use these helpers in templates, frontend config, and emails — never hard-code `/api/v1`.

### `apiBase()`

Unversioned API prefix registered on the realm (default `/api/`). Returns `string`.

```php
$base = apiBase(); // '/api/'
```

### `defaultApiVersion()`

First registered switch version from `[app_switches]`, e.g. `v1`. Returns `string`.

```php
$version = defaultApiVersion(); // 'v1'
```

### `apiVersionPath(?string $version = null)`

Versioned API prefix, e.g. `/api/v1/`. Pass a version to target `v2` when registered. Returns `string`.

```php
$postUrl = apiVersionPath() . ''; // POST target: /api/v1/
```

### `apiPingPath(?string $version = null)`

Health-check path for a switch version, e.g. `/api/v1/ping`. Returns `string`.

```php
curl -s http://127.0.0.1:8000$(php -r "require 'bootstrap/application.php'; echo apiPingPath();")
```

### `apiCatalogPath(?string $version = null)`

Debug-only Moonlight catalog path (`/__catalog`). Requires `DEBUG` or explicit docs gate. Returns `string`.

```php
$catalog = apiCatalogPath(); // '/api/v1/__catalog'
```

### `baseUrl()`

Reads unversioned API prefix from the `API_BASE` environment variable with slash normalization. Prefer `apiBase()` in application code. Returns `string`.

```php
$legacy = baseUrl(); // '/api/' when API_BASE is unset
```

### `apiDocsConfig()`

Returns the `[docs]` section from environment/settings as an array. Returns `array<string, mixed>`.

```php
$docs = apiDocsConfig();
```

### `apiDocsEnabled()`

Whether runtime API docs (`/docs`) are exposed. Explicit `DOCS_ENABLED` overrides; otherwise follows `isDebug()`. Returns `bool`.

```php
if (apiDocsEnabled()) {
    $docsUrl = 'http://127.0.0.1:' . serverPort() . '/docs';
}
```

### `apiDocsToken()`

Optional shared secret for docs routes. `null` means no token required. Returns `?string`.

```php
$token = apiDocsToken();
```

### `apiDocsAuthorized(Request $request)`

Whether the incoming request satisfies the optional docs token gate (`X-Docs-Token` or `?token=`). Returns `bool`.

```php
if (!apiDocsAuthorized($request)) {
    return response(403, 'Docs access denied');
}
```

### `apiStatsConfig()`

Returns the `[stats]` section from environment/settings. Returns `array<string, mixed>`.

```php
$stats = apiStatsConfig();
```

### `apiStatsEnabled()`

Whether the developer stats dashboard (`/stats`) is exposed. Returns `bool`.

```php
$showStats = apiStatsEnabled();
```

### `apiStatsToken()`

Optional shared secret for stats routes. Returns `?string`.

```php
$statsToken = apiStatsToken();
```

### `apiStatsAuthorized(Request $request)`

Whether the request satisfies the stats token gate (`X-Stats-Token` or `?token=`). Returns `bool`.

```php
if (!apiStatsAuthorized($request)) {
    return response(403, 'Stats access denied');
}
```

---

## Moonlight dispatch

### `moonlight()`

Returns the `Moonlight` dispatcher for sync calls, async jobs, and WebSocket frames. Returns `Moonlight`.

```php
$result = moonlight()->dispatch('member', 'list', ['project_id' => 7]);
$accepted = moonlight()->async('mail', 'task_assigned', ['email' => 'alex@northwind.studio']);
```

### `defer(\Closure $work)`

Queues a closure to run **after** the HTTP response is sent (same PHP process, not a new thread). Requires `react/promise`. Returns `void`.

```php
defer(function () {
    logger()->info('DeskFlow notified alex@northwind.studio after task create');
});
```

### `async(\Closure|string $target, string $action = '', array $payload = [], ?string $switch = null)`

Queues post-response work or submits a Moonlight job. Closure form returns a `PromiseInterface`; string form dispatches `{service, action}`. Returns `PromiseInterface`.

```php
async('mail', 'task_assigned', [
    'email' => 'alex@northwind.studio',
    'task_id' => $taskId,
]);

(void) async(function () {
    table('tasks')->where('id', $taskId)->update(['notified' => 1]);
});
```

### `await(\React\Promise\PromiseInterface $promise, ?float $timeoutSeconds = null)`

Blocks until a promise settles. Triggers deferred flush when work is still buffered. Returns `mixed`.

```php
$result = await(async(function () {
    return table('tasks')->where('project_id', 42)->count();
}));
```

### `promiseCatch(\React\Promise\PromiseInterface $promise, callable $onRejected)`

Attaches a rejection handler and returns the promise. Returns `PromiseInterface`.

```php
promiseCatch(async(function () {
    throw new \RuntimeException('Sync failed');
}), fn (\Throwable $e) => report($e));
```

### `promiseFinally(\React\Promise\PromiseInterface $promise, callable $onFinally)`

Runs a callback when the promise settles (success or failure). Returns `PromiseInterface`.

```php
promiseFinally(async(function () {
    logger()->info('DeskFlow export started');
}), fn () => logger()->info('DeskFlow export finished'));
```

---

## Caching

There is **no** global `cache()` helper. Access cache through the application container.

### `app()->cacheInstance()`

Returns the default PSR-16 cache adapter (`PioniaCache`). Use for get/set/delete on the active store from `[cache] STORE`.

```php
app()->cacheInstance()->set('project:7:tasks', $taskList, 300);
$cached = app()->cacheInstance()->get('project:7:tasks');
```

### `app()->cache()`

Returns the `CacheManager` for named stores (`redis`, `filesystem`, etc.). Chain `->store('name')` for non-default backends.

```php
app()->cache()->store('redis')->set('session:alex', $memberPayload, 900);
$hit = app()->cache()->store('redis')->get('session:alex');
```

See [Caching](/documentation/operations/caching/).

---

## Security helpers

`security()` returns the `Security` singleton. Every method has a snake_case helper. For algorithm details see [Security utilities](/documentation/security/security-utilities/).

### `security()`

Returns the cryptographic `Security` service from the container. Returns `Security`.

```php
$needsRehash = security()->needsRehash($storedHash);
```

### `secure_random_bytes(int $length)`

Cryptographically secure random bytes. Returns `string`.

```php
$bytes = secure_random_bytes(32);
```

### `secure_random_string(int $length, string $alphabet = Security::ALPHABET_ALPHANUMERIC)`

Random string from the given alphabet. Returns `string`.

```php
$inviteCode = secure_random_string(12);
```

### `secure_random_hex(int $bytes = 16)`

Random hex string (`$bytes` raw bytes encoded). Returns `string`.

```php
$correlationId = secure_random_hex(8);
```

### `secure_random_base64(int $bytes = 32, bool $urlSafe = true)`

Random base64 (optionally URL-safe) string. Returns `string`.

```php
$state = secure_random_base64(24);
```

### `secure_uuid()`

Generates a random UUID v4. Returns `string`.

```php
$taskUuid = secure_uuid();
table('tasks')->insert(['uuid' => $taskUuid, 'title' => 'Review wireframes']);
```

### `secure_ulid()`

Generates a sortable ULID. Returns `string`.

```php
$publicId = secure_ulid();
```

### `secure_otp(int $length = 6, bool $numericOnly = true)`

Generates a one-time code for member verification. Returns `string`.

```php
$code = secure_otp(6, true);
```

### `secure_token(int $bytes = 32)`

Generates a URL-safe random token. Returns `string`.

```php
$resetToken = secure_token();
```

### `secure_secret(int $bytes = 32)`

Alias of `secure_token()` for API keys and shared secrets. Returns `string`.

```php
$webhookSecret = secure_secret();
```

### `secure_password(int $length = 16, bool $symbols = true)`

Generates a random password meeting framework password rules. Returns `string`.

```php
$temporaryPassword = secure_password(20);
```

### `hash_password(string $password, array $options = [])`

Hashes a password for database storage. Returns `string`.

```php
$hash = hash_password('DeskFlow!2026');
table('team_members')->where('email', 'alex@northwind.studio')->update(['password' => $hash]);
```

### `verify_password(string $password, string $hash)`

Verifies a plaintext password against a stored hash. Returns `bool`.

```php
$valid = verify_password($submitted, $member->password_hash);
```

### `secure_hash(string $data, string $algo = 'sha256', bool $binary = false)`

General-purpose hash (not for passwords). Returns `string`.

```php
$digest = secure_hash('project-42-task-list');
```

### `secure_hmac(string $data, string $key, string $algo = 'sha256', bool $binary = false)`

HMAC of data with a secret key. Returns `string`.

```php
$signature = secure_hmac(jsonify(['task_id' => 99]), env('WEBHOOK_SECRET'));
```

### `verify_hmac(string $data, string $key, string $expected, string $algo = 'sha256')`

Timing-safe HMAC verification. Returns `bool`.

```php
$ok = verify_hmac($body, env('WEBHOOK_SECRET'), $headerSignature);
```

### `secure_equals(string $known, string $user)`

Timing-safe string comparison for tokens and secrets. Returns `bool`.

```php
$match = secure_equals($expectedBypass, $request->query->get('bypass', ''));
```

### `csrf_token(int $bytes = 32)`

Generates a CSRF token (URL-safe random string). Returns `string`.

```php
$token = csrf_token();
```

### `encrypt(string $plaintext, ?string $key = null)`

Symmetric encryption with `APP_KEY` or an explicit key (requires `ext-sodium`). Returns `string`.

```php
$sealed = encrypt('deskflow-internal-notes');
```

### `decrypt(string $payload, ?string $key = null)`

Decrypts a payload from `encrypt()`. Returns `string`.

```php
$notes = decrypt($task->encrypted_notes);
```

### `security_key_pair()`

Generates an X25519 key pair for libsodium box encryption. Returns `array{public_key: string, private_key: string}`.

```php
$keys = security_key_pair();
```

### `encrypt_with_public_key(string $plaintext, string $publicKey)`

Sealed box encryption for a recipient's public key. Returns `string`.

```php
$sealed = encrypt_with_public_key('task payload', $memberPublicKey);
```

### `decrypt_with_private_key(string $payload, string $publicKey, string $privateKey)`

Decrypts a message sealed with `encrypt_with_public_key()`. Returns `string`.

```php
$plain = decrypt_with_private_key($payload, $publicKey, $privateKey);
```

### `encrypt_for_recipient(string $plaintext, string $recipientPublicKey, string $senderPrivateKey)`

Authenticated encryption from sender to recipient (libsodium box). Returns `string`.

```php
$boxed = encrypt_for_recipient('assign task 7', $recipientPk, $senderSk);
```

### `decrypt_from_sender(string $payload, string $senderPublicKey, string $recipientPrivateKey)`

Decrypts a payload from `encrypt_for_recipient()`. Returns `string`.

```php
$message = decrypt_from_sender($payload, $senderPk, $recipientSk);
```

### `public_key_from_private(string $privateKey)`

Derives a libsodium box public key from a private key. Returns `string`.

```php
$public = public_key_from_private($keys['private_key']);
```

### `rsa_key_pair(int $bits = 2048)`

Generates a PEM-encoded RSA key pair. Returns `array{public_key: string, private_key: string}`.

```php
$rsa = rsa_key_pair(2048);
```

### `rsa_encrypt(string $plaintext, string $publicKey)`

RSA hybrid encryption for large payloads. Returns `string`.

```php
$encrypted = rsa_encrypt(jsonify(['member' => 'alex@northwind.studio']), $rsa['public_key']);
```

### `rsa_decrypt(string $payload, string $privateKey)`

Decrypts an `rsa_encrypt()` payload. Returns `string`.

```php
$json = rsa_decrypt($payload, $rsa['private_key']);
```

### `is_uuid(string $value)`

Validates UUID v4 format. Returns `bool`.

```php
if (!is_uuid($data->get('task_uuid'))) {
    return response(1, 'Invalid task UUID');
}
```

### `is_ulid(string $value)`

Validates ULID format. Returns `bool`.

```php
$valid = is_ulid($publicId);
```

### `is_otp(string $value, int $length = 6, bool $numericOnly = true)`

Validates OTP format and length. Returns `bool`.

```php
if (!is_otp($code, 6)) {
    return response(1, 'Invalid verification code');
}
```

### `is_token(string $value, int $minBytes = 16)`

Validates URL-safe token shape and minimum entropy. Returns `bool`.

```php
$looksValid = is_token($resetToken);
```

---

## String utilities

### `toCamelCase(string $value)`

Converts a string to camelCase. Returns `string`.

```php
$method = toCamelCase('list_open_tasks'); // listOpenTasks
```

### `toSnakeCase(string $value)`

Converts a string to snake_case. Returns `string`.

```php
$column = toSnakeCase('projectId'); // project_id
```

### `classify(string $value)`

Converts a string to StudlyCase class-name form. Returns `string`.

```php
$class = classify('task_service'); // TaskService
```

### `slugify(string $value)`

Converts a string to a URL slug. Returns `string`.

```php
$slug = slugify('DeskFlow Alpha Project'); // deskflow-alpha-project
```

### `singularize(string $word)`

English singular form of a word. Returns `string`.

```php
$table = singularize('tasks'); // task
```

### `pluralize(string $word)`

English plural form of a word. Returns `string`.

```php
$label = pluralize('member'); // members
```

### `capitalize(string $phrase)`

Capitalizes the first character of a string. Returns `string`.

```php
$title = capitalize('review wireframes'); // Review wireframes
```

### `arrayToString(array $value, ?string $separator = ',')`

Joins array elements into a string. Returns `string`.

```php
$tags = arrayToString(['urgent', 'design'], ', ');
```

### `jsonify(mixed $phrase)`

JSON-encodes any value. Returns `string`.

```php
$body = jsonify(['service' => 'task', 'action' => 'list', 'project_id' => 7]);
```

### `flatten(array $flatten)`

Flattens a nested array one level. Returns `array`.

```php
$ids = flatten([1, 2, [3, 4]]); // [1, 2, 3, 4]
```

### `blank(mixed $value)`

Determines whether a value is "blank" (null, empty string, empty countable, etc.). Returns `bool`.

```php
if (blank($data->get('title'))) {
    return response(1, 'Task title is required');
}
```

---

## Paths & config

### `alias($key)`

Resolves a path alias registered on the realm (`PUBLIC_DIR`, `STORAGE_DIR`, etc.). Returns `mixed`.

```php
$public = alias('PUBLIC_DIR');
```

### `path(string $path)`

Resolves a path relative to the application root. Returns `string`.

```php
$logFile = path('storage/logs/deskflow.log');
```

### `directoryFor($key)`

Looks up a directory key from built-in directory registry. Returns `mixed`.

```php
$servicesDir = directoryFor('SERVICES');
```

### `directoryPath(string $key)`

Resolves an absolute path from a `DIRECTORIES` key (e.g. `SERVICES_DIR`). Throws on unknown keys. Returns `string`.

```php
$path = directoryPath('SERVICES_DIR');
```

### `namespaceFor(string $key)`

Resolves a PHP namespace from `app.namespaces` (e.g. `SERVICE_NS` → `Application\Services`). Returns `string`.

```php
$ns = namespaceFor('SERVICE_NS');
$class = $ns . '\\TaskService';
```

### `addIniSection(string $section, ?array $keyValueToAppend = [], string $iniFile = 'generated.ini')`

Creates or merges a section in an INI file (default `environment/generated.ini`). Returns `bool`.

```php
addIniSection('deskflow', ['LAST_SYNC' => now()->format('c')], 'generated.ini');
```

### `write_ini_file(string $file, array $array = [])`

Writes an INI file in a lock-safe manner. Returns `bool` (false on lock failure).

```php
write_ini_file(path('environment/generated.ini'), [
    'deskflow' => ['PORT' => 8000, 'DEFAULT_PROJECT' => 'alpha'],
]);
```

### `is_cached_in($keyCached, $keyToCheck)`

Checks whether a container key is cached under a parent cache tag. Returns `bool`.

```php
if (!is_cached_in('bootstrapped_providers', \Application\Providers\DeskFlowProvider::class)) {
    // provider not yet booted
}
```

---

## Routing

### `router(RealmContract $app)`

Creates a `PioniaRouter` for registering HTTP routes in a provider's `routes()` hook. Returns `PioniaRouter`.

```php
public function routes(PioniaRouter $router): void
{
    router(app())->get('/health', fn () => response(0, 'DeskFlow OK'));
}
```

### `route(RealmContract $app)` — deprecated

**Deprecated since v3.0.** Alias of `router()`. Use `router()` in new code. Returns `PioniaRouter`.

```php
// Deprecated — use router($app) instead
$router = route(app());
```

### `get(string $path)`

Builds a GET `RouteObject` for fluent route registration. Returns `RouteObject`.

```php
router(app())->add(get('/deskflow/status')->to('StatusController@index'));
```

### `post(string $path)`

Builds a POST `RouteObject` for fluent route registration. Returns `RouteObject`.

```php
router(app())->add(post('/deskflow/webhook')->to('WebhookController@handle'));
```

### `allRoutes()`

Returns the compiled `RouteTable` for the application. Returns `RouteTable`.

```php
$routes = allRoutes();
```

---

## Registry introspection

### `commands()`

Returns all CLI commands registered on the container. Returns `Arrayable`.

```php
$registered = commands()->keys();
```

### `services(?string $key = null)`

Returns registered Moonlight services, or actions for one service when `$key` is passed. Returns `array`.

```php
$all = services();
$taskActions = services('task');
```

### `aliases()`

Returns path and container aliases. Returns `Arrayable`.

```php
$map = aliases();
```

### `authentications()`

Returns registered authentication backends. Returns `Arrayable`.

```php
$backends = authentications();
```

### `middlewares()`

Returns registered HTTP middleware. Returns `mixed` (typically `Arrayable`).

```php
$stack = middlewares();
```

---

## Events

### `event(object $event, ?string $eventName = null)`

Dispatches a domain event through the PSR-14 event dispatcher. Returns the event object.

```php
event(new \Application\Events\TaskCreated($taskId, 'alex@northwind.studio'));
```

### `listen(string $eventName, array|callable $listener, int $priority = 0)`

Registers an event listener at boot (e.g. in a provider's `onBooted()`). Returns `void`.

```php
listen(\Application\Events\TaskCreated::class, function ($event) {
    logger()->info('DeskFlow task created', ['id' => $event->taskId]);
});
```

---

## Maintenance & frontend config

### `maintenanceConfig()`

Returns the `[maintenance]` section from `settings.ini` or environment. Returns `array<string, mixed>`.

```php
$config = maintenanceConfig();
```

### `maintenanceModeEnabled()`

Whether maintenance mode is active (`MAINTENANCE_MODE` or `[maintenance] ENABLED`). Returns `bool`.

```php
if (maintenanceModeEnabled()) {
    // visitors receive HTTP 503
}
```

### `maintenanceMessage()`

Human-readable maintenance message for the 503 response. Returns `string`.

```php
$message = maintenanceMessage();
```

### `maintenanceRetryAfter()`

Suggested `Retry-After` seconds for maintenance responses, or `null`. Returns `?int`.

```php
$seconds = maintenanceRetryAfter();
```

### `maintenanceBypassToken()`

Shared secret for bypassing maintenance (`?bypass=` or `X-Maintenance-Bypass`). Returns `?string`.

```php
$token = maintenanceBypassToken();
```

### `maintenanceBypassAuthorized(Request $request)`

Whether the request presents a valid maintenance bypass token. Returns `bool`.

```php
if (maintenanceModeEnabled() && !maintenanceBypassAuthorized($request)) {
    return response(503, maintenanceMessage());
}
```

### `frontendConfig()`

Returns the `[frontend]` section from `settings.ini`. Returns `array<string, mixed>`.

```php
$vite = frontendConfig();
```

### `spaFallbackEnabled()`

Whether client-side routes should fall back to `public/index.html`. Follows `[frontend] SPA_FALLBACK` or presence of that file. Returns `bool`.

```php
if (spaFallbackEnabled()) {
    // non-API GET requests serve the DeskFlow SPA shell
}
```

---

## Jobs & realtime config

### `jobsConfig()`

Returns the `[jobs]` section from `settings.ini`. Returns `array<string, mixed>`.

```php
$jobs = jobsConfig();
```

### `moonlightJobsEnabled()`

Whether RoadRunner Moonlight job queue is enabled (`[jobs] ENABLED` or `JOBS_ENABLED`). Returns `bool`.

```php
if (moonlightJobsEnabled()) {
    moonlight()->async('mail', 'task_assigned', ['email' => 'alex@northwind.studio']);
}
```

### `realtimeConfig()`

Returns the `[realtime]` section from `settings.ini`. Returns `array<string, mixed>`.

```php
$realtime = realtimeConfig();
```

---

## Templates & assets

### `parseHtml($file, ?array $data = [])`

Parses a template into structured data without rendering output. Returns `array<string, mixed>|null`.

```php
$structure = parseHtml('emails/task-digest', ['member' => 'alex@northwind.studio']);
```

### `asset($file, ?string $dir = null)`

Resolves an absolute filesystem path for a static asset under `public/static/` (or custom `$dir`). Returns `?string` (null when file missing).

```php
$logoPath = asset('deskflow-logo.svg');
```

---

## Misc

### `tap($value, ?callable $callback = null)`

Runs a callback for side effects and returns the original value (or a `HighOrderTapProxy` when no callback). Returns `HighOrderTapProxy|TValue`.

```php
$task = tap(table('tasks')->get($id), function ($row) {
    logger()->info('Loaded task', ['id' => $row['id']]);
});
```

### `yesNo(mixed $condition, ?string $yesPhrase = 'Yes', ?string $noPhrase = 'No')`

Returns a display phrase based on a truthy condition. Returns `string`.

```php
$active = yesNo($member->active, 'Active member', 'Inactive');
```

### `asBool(mixed $value)`

Coerces env-style values (`"true"`, `"1"`, `"yes"`) to boolean. Returns `bool`.

```php
$notify = asBool(env('DESKFLOW_NOTIFY', false));
```

### `now()`

Returns the current time as a `DateTime` (Carbon-backed). Returns `DateTime`.

```php
table('tasks')->insert([
    'title' => 'Ship MVP',
    'created_at' => now()->format('Y-m-d H:i:s'),
]);
```

### `timeAgo($datetime)`

Human-readable relative time (e.g. "2 hours ago"). Returns `string`.

```php
$label = timeAgo($task['updated_at']); // "3 days ago"
```

### `time_ago(int|float $time)` — deprecated

**Deprecated since v3.0.** Alias of `timeAgo()`. Use `timeAgo()` in new code. Returns `string`.

```php
// Deprecated — use timeAgo() instead
$label = time_ago(strtotime($task['created_at']));
```

### `framework()`

Returns the framework display name. Returns `string`.

```php
$name = framework(); // Pionia
```

### `version()`

Returns the Pionia core version string. Returns `string`.

```php
logger()->info('DeskFlow boot', ['pionia' => version()]);
```

### `frameworkLogo()`

Returns the framework logo asset reference. Returns `mixed`.

```php
$icon = frameworkLogo();
```

### `frameworkTag()`

Returns the framework description tagline. Returns `string`.

```php
$tagline = frameworkTag();
```

### `appName()`

Returns the configured application name (e.g. DeskFlow). Returns `string`.

```php
$subject = appName() . ': Task assigned to alex@northwind.studio';
```

---

## Common mistakes

- Calling `table()` or `logger()` inside `bootstrap/application.php` before `AppRealm::create()` returns
- Using `render()` in tests or workers — prefer `renderToString()` to avoid unexpected process exit
- Hard-coding `/api/v1` instead of `apiVersionPath()` — breaks when adding `v2`
- Using deprecated `route()` instead of `router($app)` in providers
- Calling a global `cache()` function — use `app()->cacheInstance()` or `app()->cache()->store(...)` instead
- Forgetting `->get()` after `validate()` when you need the validated value in the same expression
- Using `time_ago()` in new code — prefer `timeAgo()`

## What's next

{{< card-grid >}}
{{< link-card title="Services" description="Where response() and table() are used." href="/documentation/building-api/services/" >}}
{{< link-card title="Logging" description="Channels, redaction, and report()." href="/documentation/operations/logging/" >}}
{{< link-card title="Database" description="Porm queries with table()." href="/documentation/database/" >}}
{{< /card-grid >}}
