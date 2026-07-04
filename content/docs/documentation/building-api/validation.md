---
title: "Validation"
slug: "validation"
description: "ValidationException, rules(), attributes, and custom validation rules."
summary: "Return HTTP 422 when DeskFlow clients omit required fields like task title."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 230
toc: true
doc_type: topic
seo:
  title: "Pionia service validation"
  description: "Validate Moonlight request data with attributes, rules(), or validate() chains."
  noindex: false
---

## Who this is for

You are building DeskFlow actions and need **clear 422 responses** when Alex submits `task.create` without a `title` or `member.login` with a malformed email.

## What you will learn

- Declarative `#[Validated]` rules that run before your action body
- Imperative `rules()` and `validate()` for conditional checks
- Custom rules registered once on `ValidationManager`

## Before you start

{{< prerequisites >}}
- [Actions](/documentation/building-api/actions/) — `createAction` on `TaskService`
- [Services](/documentation/building-api/services/) — DeskFlow running on port **8000**
{{< /prerequisites >}}

## How it works

When validation fails, Pionia throws `ValidationException`. The exception pipeline maps it to **HTTP 422** with a message in `returnMessage` — not a generic 500.

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"create","project_id":1}'
```

DeskFlow should respond with `"returnCode": 422` and a field-specific message once rules are in place.

## Quick choice

| Style | When |
|-------|------|
| **`#[Validated]` / `#[ValidateField]`** | Declare rules on the action method — runs automatically before the body |
| **`rules($data, [...])`** | Multiple fields inside the action — imperative or conditional |
| **`validate('field', $data)->…`** | One field, custom chain, or dynamic checks |
| **`$this->requires([...])`** | Presence only (no format checks) — prefer `required` in `rules()` instead |
| **GenericService columns** | CRUD scaffolding (`$createColumns`, `$updateColumns`) |

## Attributes (recommended for actions)

Attach validation rules to action methods. Pionia runs them automatically in `processAction()` **before** your action body — no manual `rules()` call needed.

### `#[Validated]` — multiple fields

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Validations\Attributes\Validated;

#[Validated(rules: [
    'email' => 'required|email',
    'password' => 'required|password|min:8',
    'password_confirmation' => 'required|confirmed:password',
    'role' => 'required|in:admin,user,guest',
])]
protected function registerAction(Arrayable $data): ApiResponse
{
    // $data is already validated — business logic only
    return response(0, 'Registered', null);
}
```

DeskFlow `member.login` example:

```php
#[Validated(rules: [
    'email' => 'required|email',
    'password' => 'required|min:8',
])]
protected function loginAction(Arrayable $data): ApiResponse
{
    // alex@northwind.studio already validated as email format
    return response(0, 'OK', ['token' => '…']);
}
```

### `#[ValidateField]` — repeatable, one field per attribute

```php
use Pionia\Validations\Attributes\ValidateField;

#[ValidateField('email', 'required|email')]
#[ValidateField('password', 'required|password|min:8')]
protected function loginAction(Arrayable $data): ApiResponse
{
    return response(0, 'OK', ['token' => '…']);
}
```

You can combine both attributes on the same method; rules for the same field are merged.

{{<callout tip>}}
Attributes use the same pipe syntax and custom rules as `rules()`. Register custom rules once via `validations()->extend()` or `configureValidations()` on a provider.
{{</callout>}}

## `rules()` — imperative validation

Call inside an action when you need conditional rules or prefer inline validation:

```php
protected function createAction(Arrayable $data): ApiResponse
{
    rules($data, [
        'title' => 'required|string|min:3',
        'project_id' => 'required|integer',
        'assignee_email' => 'nullable|email',
    ]);

    // business logic…
}
```

Array syntax works too:

```php
rules($data, [
    'email' => ['required', 'email'],
]);
```

`nullable` / `sometimes` skip remaining rules when the field is missing or blank.

### Available rules

| Rule | Meaning |
|------|---------|
| `required` | Present and non-blank |
| `nullable`, `sometimes` | Optional — skip other rules when empty |
| `string`, `integer` / `int`, `numeric`, `number`, `float`, `boolean` / `bool`, `array` | Type checks (`integer` accepts JSON numeric strings) |
| `email`, `url`, `ip`, `slug`, `uuid`, `ulid`, `otp`, `token`, `password`, `date` | Format validators (`otp:6`, `token:24` for length/entropy) |
| `phone` / `phone:+254` | Phone pattern; optional country prefix |
| `min:n` | Min length (string), value (number), or items (array) |
| `max:n` | Max length, value, or items |
| `between:min,max` | Numeric or string length range |
| `in:a,b,c` | Allow-list |
| `not_in:a,b,c` | Deny-list |
| `regex:pattern` | PCRE pattern |
| `confirmed:field` / `matches:field` | Must equal another field |
| `required_with:field` | Required when another field is present |
| `required_without:field` | Required when another field is absent |
| *custom* | Any name registered on `validations()` |

All failures throw **`ValidationException`** (HTTP 422).

## Custom rules

Register reusable rules once on the shared `ValidationManager` singleton. Attributes, `rules()`, and `validate()->rule()` all use the same registry.

### In a provider (recommended)

```php
use Pionia\Base\Provider\Provider;
use Pionia\Validations\ValidationContext;
use Pionia\Validations\ValidationManager;

class AppProvider extends Provider
{
    public function configureValidations(ValidationManager $validations): void
    {
        $validations->extend('northwind_email', function (ValidationContext $ctx): void {
            if (!str_ends_with((string) $ctx->value(), '@northwind.studio')) {
                $ctx->fail('Email must be a @northwind.studio address');
            }
        });
    }
}
```

### At bootstrap

```php
validations()->extend('sku', function (ValidationContext $ctx): void {
    if (!preg_match('/^[A-Z]{2}-\d{4}$/', (string) $ctx->value())) {
        $ctx->fail('Invalid SKU format');
    }
});
```

### Class-based rules

Implement `Pionia\Validations\Contracts\ValidationRuleContract` and register the class name — the manager instantiates it once per rule:

```php
use Pionia\Validations\Contracts\ValidationRuleContract;
use Pionia\Validations\ValidationContext;

final class EvenNumberRule implements ValidationRuleContract
{
    public function validate(ValidationContext $context): void
    {
        if (!is_numeric($context->value()) || ((int) $context->value()) % 2 !== 0) {
            $context->fail('Value must be an even number');
        }
    }
}

validations()->extend('even', EvenNumberRule::class);
```

### Use custom rules

```php
#[Validated(rules: ['email' => 'required|northwind_email'])]
protected function inviteAction(Arrayable $data): ApiResponse { /* … */ }

rules($data, ['email' => 'required|northwind_email']);
validate('email', $data)->required()->rule('northwind_email');
```

Parameters after `:` are available as `$ctx->parameter` (e.g. `tier:gold` → `'gold'`).

## `validate()` — chainable (single field)

For one-off or dynamic checks inside an action:

```php
validate('email', $data)->required()->email();
validate('password', $data)->required()->asPassword();
validate('phone', $data)->required()->rule('kenya_phone');
validate('code', $data)->string()->between(4, 8);
```

Pass `$data`, `$this`, or `$this->request` as the second argument.

## `$this->requires()` — presence only

Checks that keys exist and are non-blank. Does **not** validate format — use `required` in `rules()` or attributes instead:

```php
$this->requires(['id']);           // quick presence check
rules($data, ['id' => 'required|integer']); // presence + format
```

## GenericService

When `$createColumns` or `$updateColumns` are set, missing **required** fields throw `ValidationException`:

```php
use Pionia\Http\Services\Generics\UniversalGenericService;

class ProjectService extends UniversalGenericService
{
    public string $table = 'projects';
    public ?array $createColumns = ['name', 'client'];
    public ?array $updateColumns = ['name', 'client?']; // client? = optional
}
```

Optional columns: suffix with `?` (e.g. `'bio?'`). File uploads use `$fileColumns`.

## Manual throws

Prefer `rules()` or attributes. Use manual throws only for domain rules that do not map to field rules:

```php
use Pionia\Exceptions\ValidationException;

if ($data->get('quantity') > $stock) {
    throw new ValidationException('Insufficient stock');
}
```

## Exception pipeline

```php
$app->exceptions()->dontReport(ValidationException::class);
```

See [Exceptions](/documentation/http/exceptions/).

## Response shape

```json
{
  "returnCode": 422,
  "returnMessage": "title is required",
  "returnData": null
}
```

## Common mistakes

- **Validating in the action body before calling `rules()`** — use `#[Validated]` so invalid requests never reach business logic.
- **Returning custom error arrays instead of throwing** — let `ValidationException` flow through the pipeline for consistent 422 responses.
- **Using `$this->requires()` for email format** — presence checks do not validate `@northwind.studio` domains; use `required|email`.
- **Expecting HTTP 200 on validation failure** — clients must handle **422** and read `returnMessage`.

## What's next

{{< card-grid >}}
{{< link-card title="Actions" description="Wire validated createAction methods." href="/documentation/building-api/actions/" >}}
{{< link-card title="Generic services" description="Column-based validation on CRUD." href="/documentation/building-api/generic-services/" >}}
{{< link-card title="Requests & responses" description="HTTP status vs returnCode." href="/documentation/http/requests-and-responses/" >}}
{{< /card-grid >}}
