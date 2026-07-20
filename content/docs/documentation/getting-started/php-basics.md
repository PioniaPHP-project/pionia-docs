---
title: "PHP basics for Pionia"
slug: "php-basics"
description: "The PHP you need before building Pionia Shop — classes, namespaces, Composer, types, attributes, and reading errors."
summary: "A practical PHP primer for people who will write ProductService and CustomerService — not a full language course."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 102
toc: true
doc_type: topic
seo:
  title: "PHP basics for Pionia"
  description: "Learn the PHP you need for Pionia services, actions, Composer, attributes, and debugging."
---

## Who this is for

You can follow a tutorial in another language, but PHP still feels unfamiliar. You are about to build **Pionia Shop** — products, customers, orders — and you want enough PHP to read a service class without guessing.

This is **not** a complete PHP course. It is the slice of the language Pionia actually uses on day one.

## What you will learn

- How a Pionia **service class** is structured (namespace, extends, methods)
- How **Composer** loads your code so `make:service` “just works”
- Types, arrays, and the helpers you will see in every action
- How **attributes** like `#[Authenticated]` attach metadata to methods
- How to read a stack trace when something breaks

## Before you start

{{< prerequisites >}}
- PHP **8.5+** (`php -v`)
- [Composer](https://getcomposer.org/) (`composer -V`)
- A terminal and an editor (VS Code, Cursor, or PhpStorm)
{{< /prerequisites >}}

{{< callout context="tip" title="Learn by typing" icon="outline/bulb" >}}
Open `php pionia shell` after you create `pionia-shop` and try the one-liners in this page. The REPL is the fastest way to feel PHP without a full web request.
{{< /callout >}}

## Check your tools

```bash
php -v          # need 8.5 or newer
composer -V
php -m | grep -i pdo   # database drivers show up here
```

Pionia Shop’s default local database is **SQLite**, so you want the `pdo_sqlite` extension enabled. If `php -m` does not list it, install it with your OS package manager (for example `php-sqlite3` on Debian/Ubuntu, or enable it in `php.ini` on Windows).

## A Pionia service is just a PHP class

When you run `php pionia make:service Product`, you get something like this:

```php
<?php

namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;

class ProductService extends Service
{
    protected function listAction(Arrayable $data): ApiResponse
    {
        return response(0, 'OK', ['products' => []]);
    }
}
```

Read it top to bottom:

| Piece | Meaning |
|-------|---------|
| `namespace Application\Services;` | This class lives in the app’s “Services” package |
| `use …` | Import short names for other classes |
| `class ProductService extends Service` | Your class **inherits** Pionia’s `Service` behaviour |
| `listAction(...)` | An **action** — clients call it with `"action": "list"` |
| `: ApiResponse` | This method must return Pionia’s response type |
| `response(0, 'OK', …)` | Helper that builds the JSON envelope |

You do not invent HTTP controllers. You write **methods on a service**. That is the whole mental model.

## Namespaces and Composer (why files “appear”)

PHP does not magically find `ProductService`. **Composer** maps namespaces to folders.

In a typical app:

```json
"autoload": {
  "psr-4": {
    "Application\\": ""
  }
}
```

Roughly: `Application\Services\ProductService` → `services/ProductService.php` (Pionia’s app layout also uses an application autoloader for lowercase folders — `make:service` places the file correctly either way).

When you rename or move a class and PHP says “class not found”:

```bash
composer dump-autoload
```

That rebuilds the class map. Do this after odd “file exists but class missing” errors.

## Variables, arrays, and types

PHP variables start with `$`:

```php
$name = 'Ada Mug';
$price = 24.50;
$inStock = true;
```

**Arrays** are how you pass JSON-shaped data around:

```php
$product = [
    'name' => 'Ada Mug',
    'price' => 24.50,
    'stock' => 12,
];

echo $product['name']; // Ada Mug
```

Pionia often wraps request data in `Arrayable` so you can write:

```php
$title = $data->get('name');
$qty = $data->getInt('quantity');
```

instead of raw `$_POST` arrays.

### Type hints (read these out loud)

```php
protected function createAction(Arrayable $data): ApiResponse
```

Means: “`$data` must be an `Arrayable`; I return an `ApiResponse`.”

Nullable types use `?`:

```php
public function find(?string $sku): ?array
```

“Maybe a string in; maybe an array out.”

PHP 8 also allows unions (`string|int`) — you will see them in framework signatures; you rarely need them on day one.

## Methods, visibility, and `return`

```php
class WalletService extends Service
{
    // only this class (and children) should call this
    protected function balanceAction(Arrayable $data): ApiResponse
    {
        $balance = 0.0;
        return response(0, 'OK', ['balance' => $balance]);
    }
}
```

| Keyword | Who can call it |
|---------|-----------------|
| `public` | Anyone |
| `protected` | This class and subclasses (typical for `*Action` methods) |
| `private` | Only this class |

Always **`return`** an `ApiResponse` from an action. If you forget, Pionia complains that the action did not return `response()`.

## Inheritance: why `extends Service` matters

```php
class CustomerService extends Service
```

`Service` already knows how to:

- Read the current request
- Run validation attributes
- Enforce `#[Authenticated]` / `#[Can]`
- Call `$this->auth()`, `$this->mustAuthenticate()`, and so on

Your class **adds** shop behaviour (`loginAction`, `registerAction`). You are not rewriting the framework — you are specializing it.

## Attributes: stickers on methods

Pionia uses **PHP attributes** (the `#[…]` syntax) so you can declare behaviour next to the method:

```php
use Pionia\Auth\Attributes\Authenticated;
use Pionia\Auth\Attributes\Can;
use Pionia\Validations\Attributes\Validated;

#[Authenticated]
#[Can('product.manage')]
#[Validated(rules: ['name' => 'required|string', 'price' => 'required|numeric'])]
protected function createAction(Arrayable $data): ApiResponse
{
    // create the product
}
```

Think of attributes as **labels** the framework reads before your method runs:

- `#[Validated]` — check the payload first
- `#[Authenticated]` — require a logged-in customer
- `#[Can('…')]` — require a permission

You will also see older-style **docblocks** (`/** @moonlight-summary … */`) for API documentation. Both can live on the same method.

## The helpers you will see every day

These are ordinary PHP functions Pionia registers for you after boot:

```php
response(0, 'OK', ['products' => $rows]);  // Moonlight envelope
table('products')->all();                  // database query
logger()->info('Order placed', ['id' => $id]);
jwt_encode(['sub' => $customer->id, 'email' => $customer->email]);
```

You call them like built-ins. They only work **after** the app boots (HTTP request, `php pionia …`, or `php pionia shell`) — not in a random standalone `.php` file with no bootstrap.

## Control flow you need for shop logic

```php
if ($stock < 1) {
    return response(400, 'Out of stock');
}

foreach ($items as $item) {
    $total += $item['unit_price'] * $item['quantity'];
}

try {
    table('orders')->save($payload);
} catch (\Throwable $e) {
    report($e);
    return response(500, 'Could not place order');
}
```

In Pionia actions you usually **return** error envelopes instead of throwing for expected business failures (out of stock, bad password). Throw (or let validation throw) for unexpected failures — the exception pipeline turns them into JSON.

## Reading errors without panic

When something breaks with `DEBUG=true`, you get a clear message. Example:

```text
ValidationException: The name field is required.
  in ProductService.php:28
```

How to use it:

1. **Message** — what went wrong (`name` is required)
2. **File:line** — open that file and look at that line
3. **Logs** — `storage/logs/` if the browser response is vague

Common first-week errors:

| Symptom | Likely cause |
|---------|----------------|
| Class not found | Wrong namespace, or run `composer dump-autoload` |
| Call to undefined function `table()` | Code ran outside a booted app |
| Action not found | Method not named `somethingAction`, or not registered on the switch |
| Could not find driver | Missing PDO extension for SQLite/MySQL |

## A mini walkthrough (Pionia Shop)

Imagine Ada lists products:

1. Client POSTs `{ "service": "product", "action": "list" }`
2. Pionia finds `ProductService::listAction`
3. Your PHP runs — often `table('products')->all()`
4. You `return response(0, 'OK', ['products' => $rows])`
5. Client receives JSON with `returnCode`, `returnMessage`, `returnData`

You only wrote step 3–4. The rest is the framework.

{{< try-it >}}
After [Introduction](/documentation/getting-started/introduction/) installs `pionia-shop`:

1. Run `php pionia make:service Product`
2. Open the generated class and find `listAction`
3. Change the empty array to a hard-coded product (`name`, `price`, `stock`)
4. Register the service on your switch and `curl` `product.list`
5. Break the JSON on purpose and read the error — then fix it
{{< /try-it >}}

## What you can skip for now

You do **not** need these to finish the shop tutorial:

- Building your own framework or router
- Deep OOP patterns (interfaces, traits design)
- Generators, fibers, or extensions beyond PDO
- Front-end PHP templates — Pionia APIs return JSON

Learn those later if you enjoy them. Ship `product.list` first.

## Common mistakes

- **Editing the wrong folder** — always work inside your app root (`pionia-shop/`), not a random parent directory
- **Forgetting `Action` in the method name** — `list` alone is not enough; use `listAction`
- **Returning a plain array** — wrap with `response(…)`
- **Copying JavaScript habits** — PHP uses `$` variables, `.` for string concat is `.` not `+`, and arrays use `=>`
- **Ignoring `composer dump-autoload`** after moving classes

## What's next

{{< card-grid >}}
{{< link-card title="Introduction" description="Install Pionia and meet Pionia Shop." href="/documentation/getting-started/introduction/" >}}
{{< link-card title="Pionia Shop tutorial" description="Build catalog, checkout, and wallet step by step." href="/documentation/shop-tutorial/" >}}
{{< link-card title="Glossary" description="service, action, switch, envelope." href="/documentation/getting-started/glossary/" >}}
{{< /card-grid >}}
