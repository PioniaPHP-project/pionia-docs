---
title: "Validation"
slug: "validation"
description: "ValidationException, rules(), attributes, and custom validation rules."
summary: "Return HTTP 422 when DeskFlow clients omit required fields like task title."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 230
toc: true
doc_type: topic
seo:
  title: "Pionia service validation"
  description: "Validate Moonlight request data with attributes, rules(), or validate() chains."
  noindex: false
---

When Alex submits `task.create` without a `title`, DeskFlow should respond with **HTTP 422** and a clear JSON message — not a generic 500. Pionia maps `ValidationException` to that status automatically.

Client errors (missing fields, bad input) should return **422 Unprocessable Entity**. Pionia throws `Pionia\Exceptions\ValidationException` — the exception pipeline maps it automatically.



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

protected function registerAction(Arrayable $data): ApiResponse

{

    rules($data, [

        'email' => 'required|email',

        'password' => 'required|password|min:8',

        'password_confirmation' => 'required|confirmed:password',

        'role' => 'required|in:admin,user,guest',

        'age' => 'integer|min:18',

        'website' => 'nullable|url',

        'invite_code' => 'nullable|uuid',

        'tags' => 'array|min:1',

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

        $validations->extend('kenya_phone', function (ValidationContext $ctx): void {

            if (!preg_match('/^\+254/', (string) $ctx->value())) {

                $ctx->fail('Phone must be a Kenyan number');

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

#[Validated(rules: ['phone' => 'required|kenya_phone'])]

protected function saveAction(Arrayable $data): ApiResponse { /* … */ }



rules($data, ['phone' => 'required|kenya_phone']);

validate('phone', $data)->required()->rule('kenya_phone');

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



class PostService extends UniversalGenericService

{

    public string $table = 'posts';

    public ?array $createColumns = ['title', 'body'];

    public ?array $updateColumns = ['title', 'body?']; // title? = optional

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

  "returnMessage": "email must be a valid email address",

  "returnData": null

}

```



Related: [Actions](/documentation/building-api/actions/) · [Requests & responses](/documentation/http/requests-and-responses/) · [Generic services](/documentation/building-api/generic-services/).

