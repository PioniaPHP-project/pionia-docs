---
title: "Actions"
description: "Action methods — the logic behind each Moonlight request."
summary: "Map JSON action names to *Action methods; read Arrayable data and return response() envelopes."
date: 2024-10-07 20:24:56.303 +0300
lastmod: 2026-07-04
draft: false
weight: 220
toc: true
doc_type: topic
seo:
  title: "Actions"
  description: "Create and invoke Pionia service actions via the Moonlight envelope."
  noindex: false
---

## Who this is for

You registered DeskFlow services on `MainSwitch` and need to **write and call action methods** — the PHP functions behind `"action": "list"` and `"action": "create"`.

## What you will learn

- How Moonlight maps JSON action names to `listAction()` and `createAction()`
- Reading request data from `Arrayable` and returning `response()` envelopes
- Auth helpers (`mustAuthenticate()`, `can()`) inside actions

## Before you start

{{< prerequisites >}}
- [Services](/documentation/building-api/services/) — `TaskService` registered as `task`
- [DeskFlow tutorial Step 1](/documentation/deskflow-tutorial/01-create-project/) — working `task.list` curl on port **8000**
- Optional: [Documenting your API](/documentation/building-api/api-reference/) for `@moonlight-*` tags
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  Body["{ service: task, action: list }"] --> Dispatch[processAction]
  Dispatch --> Method[listAction]
  Method --> Envelope["response(0, OK, returnData)"]
{{< /mermaid >}}

DeskFlow POSTs to **`http://127.0.0.1:8000/api/v1/`**. Pionia resolves `"list"` → `listAction()` on the service registered as `"task"`.

---

## Introduction
Actions are the actual logic that is executed when a request is made to the API. Actions are the central logic for the entire app. They are responsible for handling the request, processing the data, and returning the response.

In Pionia, `actions` MUST be defined in services. If you haven't created a service yet, you can check out the [services documentation](/documentation/building-api/services/).

## Creating an Action

In Pionia, an action is a method in a service class. To create an action, you need to create a method in the service class. The method should be public and should have the `Action` suffix such as `loginAction`.

Here is an example of an action in a service class:

```php

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        // Your logic here
    }
}
```

In the above example, we have created a `loginAction` method in the `UserService` class. The method takes an `Arrayable` object as a parameter. The `Arrayable` object contains the data sent in the `POST` request body.
{{<callout note>}}
You can define other helper methods in the service class to help with the logic in the action method. Anything that is not suffixed with `Action` is considered a helper method and is not accessible via the API as an endpoint.
{{</callout>}}

## Request and Response

The action method takes an `Arrayable` object as a parameter. The `Arrayable` object contains the data sent in the request body. You can access the data using the `get` method of the `Arrayable` object.

### Request Action

To target an action in your request, set the **`action`** key (lowercase) in the JSON body. Pionia maps `"list"` → `listAction()` on the service registered as `"task"`.

DeskFlow example:

```json
{
  "service": "task",
  "action": "list"
}
```

You may also pass the full method name:

```json
{
  "service": "member",
  "action": "loginAction"
}
```

Prefer short action names (`login`, `list`, `create`) in client code — they match the `@moonlight-action` tags in your PHPDoc.

## Accessing Request Data

Request data comes in various formats such as JSON, form data, etc. The `Arrayable` object provides a unified way to access the data regardless of the format.

### get($key, $default = null)

Since the request data is received as a Pionia Collections `Arrayable` object, you can access the data using the `get` method. The `get` method takes two parameters: the key of the data you want to access and the default value to return if the key is not found.

Given the request data:-

```json
{
    "username": "john.doe",
    "password": "<user-password>",
    "action": "login"
}
```

We can access the `username` and `password` fields in our action as follows:

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $username = $data->get('username');
        $password = $data->get('password');

        // Your logic here
    }
}
```

The get method also takes on an optional second parameter which is the default value to return if the key is not found. For example, if the `limit` key is not found in the request data below, the `get` method will return assign it to 10.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $limit = $data->get('limit', 10);

        // Your logic here
    }
}
```

You can henceforth use `$limit` in your logic without expecting any null values.

### getOrThrow($key, Throwable|string|null $exception = null)

This method is similar to the `get` method but throws an exception if the key is not found in the request data. The `getOrThrow` method takes two parameters: the key of the data you want to access and an optional exception to throw if the key is not found.
If no exception is provided, a normal php Exception is thrown with the message `$key not found`.

This operation also prevents the code below from executing if the key is not found.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $username = $data->getOrThrow('username');
        $password = $data->getOrThrow('password', new Exception('Password cannot be empty'));

        // Your logic here
    }
}
```

This ensures that you do not proceed with null values in your logic.

### getString($key)

This returns the value of the key as a `string` or `null`. If the value is not a string, it is cast to a string.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $username = $data->getString('username');
        $password = $data->getString('password');

        // Your logic here
    }
}
```

### getInt($key)

This returns the value of the key as an `int` or `null`. If the value is not an integer, it is cast to an integer.

```php

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $age = $data->getInt('age');

        // Your logic here
    }
}
```

### getFloat($key)

This returns the value of the key as a `float` or `null`. If the value is not a float, it is cast to a float.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $price = $data->getFloat('price');

        // Your logic here
    }
}
```

### getBool($key)

This returns the value of the key as a `bool` or `null`. If the value is not a boolean, it is cast to a boolean.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $is_active = $data->getBool('is_active');

        // Your logic here
    }
}
```

### getJson($key)

This returns the value of the key as a `json` or `null`. If the value is not a json, it is cast to a json.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $json = $data->getJson('json');

        // Your logic here
    }
}
```

### getArray($key)

This returns the value of the key as an `array` or `null`. If the value is not an array, it is cast to an array.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $array = $data->getArray('array');

        // Your logic here
    }
}
```

### getArrayable($key)

This returns the value of the key as an `Arrayable` object or `null`. If the value is not an array, it is cast to an array.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $arrayable = $data->getArrayable('arrayable');

        // Your logic here
    }
}
```

### getA($key, $className)

This returns the value of the key as an object of the specified class. If the value is not an object of the specified class, an exception is thrown.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $user = $data->getA('user', User::class);

        // Your logic here
    }
}
```

### getPositiveInteger($key)

This returns the value of the key as a positive integer or `null`. If the value is not a positive integer, an exception is thrown.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $age = $data->getPositiveInteger('age');

        // Your logic here
    }
}
```

### getNegativeInteger($key)

This returns the value of the key as a negative integer or `null`. If the value is not a negative integer, an exception is thrown.

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        $age = $data->getNegativeInteger('age');

        // Your logic here
    }
}
```

All methods available in the `Arrayable` class can be found [here](/documentation/http/collections/).

## Request Files

If the request contains files, use the second parameter (`Pionia\Http\Bag\FileBag`) or `$this->request->getFileByName()` on services that extend `Service`:

```php
namespace Application\Services;

use Pionia\Http\Bag\FileBag;
use Pionia\Http\Services\Service;
use Pionia\Http\UploadedFile;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function uploadAction(Arrayable $data, FileBag $files)
    {
        $avatar = $files->get('avatar');

        if ($avatar instanceof UploadedFile) {
            // move, validate, store path in DB
        }
    }
}
```

Multipart requests must use `Content-Type: multipart/form-data`. Uploaded files are `Pionia\Http\UploadedFile` instances.

## Further Request Validation

Validate Moonlight request data before business logic. Prefer **attributes** or **`rules()`** — both use the same pipe syntax and throw `ValidationException` (HTTP 422).

### Attributes (automatic)

Rules on the action method run before the body — no manual call inside the action:

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Validations\Attributes\Validated;
use Pionia\Validations\Attributes\ValidateField;

#[Validated(rules: [
    'email' => 'required|email',
    'password' => 'required|password|min:8',
])]
protected function loginAction(Arrayable $data): ApiResponse
{
    // validated — add logic here
    return response(0, 'Login successful', ['token' => '…']);
}
```

Or one field per repeatable attribute:

```php
#[ValidateField('email', 'required|email')]
#[ValidateField('password', 'required|password|min:8')]
protected function loginAction(Arrayable $data): ApiResponse
{
    return response(0, 'Login successful', ['token' => '…']);
}
```

### `rules()` — inside the action

Use when rules depend on runtime conditions:

```php
protected function loginAction(Arrayable $data): ApiResponse
{
    rules($data, [
        'email' => 'required|email',
        'password' => 'required|password|min:8',
    ]);

    return response(0, 'Login successful', ['token' => '…']);
}
```

### `validate()` — single field chain

For one field or dynamic checks:

```php
$email = validate('email', $data)->required()->email()->get();
$password = validate('password', $data)->required()->asPassword()->get();
```

Pass `$data`, `$this`, or `$this->request` as the second argument. Use **`->get()`** after the chain to validate and return the value in one line — see [Validation](/documentation/building-api/validation/#validate-and-extract---get).

### `$this->requires()` — presence only

Checks keys are present and non-blank. Does not validate format — prefer `required` in `rules()` or attributes:

```php
$this->requires(['email', 'password']);
```

Full rule list, custom rules, and `validations()` registry: [Validations](/documentation/building-api/validation/).

## Response

All actions must return an instance of `Pionia\Http\Response\ApiResponse`. That envelope is what Moonlight clients expect (`returnCode`, `returnMessage`, `returnData`).

Here is an example of how to return a response in an action method:

```php

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        // Your logic here

        return response(0, 'Login successful', ['token' => 'some token here']);
    }
}
```

The response has three parts:
    
1. **The status code - `returnCode`**: This is a number that represents the status of the response. A status code of `0` means the request was successful. Any other status code means there was an error.
You can therefore return and modify status codes as per your business requirements. `0` SHOULD be reserved for successful requests as a standard.
2. **The message - `returnMessage`**: This is a string that provides additional information about the response. The message is optional and can be nulled if not needed.
3. **The data - `returnData`**: This is any data that you want to return to the client. The data can be an array, object, or any other data type.

There is also an extra fourth parameter that can be used to pass extra data - `extraData` to the response. This is optional and can be used to pass additional data to the response.

```php

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        // Your logic here

        return response(0, 'Login successful', ['token' => 'some token'], ['extra' => 'some extra data']);
    }
}
```

{{<callout note>}}
Only the `returnCode` is required in the response. The `returnMessage`, `returnData` and `extraData` are optional and can be nulled if not needed.
{{</callout>}}

## Returning Cached Responses

Pionia provides a way to return cached responses to the client. This is useful when you want to cache the response of an action to reduce the load on the server.

This can be achieved by replacing the `response` method with the recached method. The `recached` method takes the same parameters as the `response` method.

Here is an example of how to return a cached response in an action method:

```php
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        // Your logic here

        return recached($this, returnCode:0, returnMessage: "hey there", returnData: $todo, extraData: null, ttl:120);
    }
}
```
Note that the `recached` method takes an additional parameter `ttl` which is the time to live of the cached response in seconds. The default value is 60 seconds.

{{<callout note>}}
The `recached` method caches the response of the action for the specified time. If the same request is made within the specified time, the cached response is returned to the client.
And this is how Pionia handles caching of responses even over `POST` requests.
{{</callout>}}

## Error Handling

In Pionia, whenever and wherever an exception is thrown in an action or anywhere in the app, it is caught and a response is returned to the client. The response conforms to the [Moonlight Paradigm](/documentation/building-api/moonlight-overview/).

This ensures that a status code of 200 OK is always returned to the client whenever a request reaches the application server.

{{<callout note>}}
The exception message is returned as the `returnMessage` in the response with a non-zero `returnCode`. The `returnData` is nulled in the response.
{{</callout>}}


## Securing Actions

Pionia provides a way to secure actions using various methods.

The following are some of the ways you can secure actions in Pionia:

### mustAuthenticate(?string $message)

The `mustAuthenticate` method is used to secure an action by ensuring that the request is authenticated. If the request is not authenticated, an exception is thrown and the response is returned to the client.

Here is an example of how to use the `mustAuthenticate` method:

```php {linenos=table}

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function getUserAction(Arrayable $data)
    {
        $this->mustAuthenticate();

        // Your logic here
    }
}
```
Anything beyond line 11 will not be executed if the request is not authenticated.

By default, the `mustAuthenticate` method throws an exception with the message `You must be authenticated to access this resource`. You can provide a custom message as a parameter to the `mustAuthenticate` method.

### can(string $permission, ?string $message)

The `can` method is used to secure an action by ensuring that the request has the specified permission. If the request does not have the specified permission, an exception is thrown and the response is returned to the client.

Here is an example of how to use the `can` method:

```php {linenos=table}
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function getUserAction(Arrayable $data)
    {
        $this->can('view_users');

        // Your logic here
    }
}
```

Anything beyond line 10 will not be executed if the incoming request user instance does not have the specified permission.

By default, the `can` method throws an exception with the message `You do not have permission to access this resource`. You can provide a custom message as a second parameter to the `can` method to override this behaviour.

### canAll(array $permissions, ?string $message)

Similar to the `can` method, the `canAll` method is used to secure an action by ensuring that the request has all the specified permissions. If the request does not have all the specified permissions, an exception is thrown and the response is returned to the client.

Here is an example of how to use the `canAll` method:

```php {linenos=table}
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function getUserAction(Arrayable $data)
    {
        $this->canAll(['view_users', 'edit_users']);

        // Your logic here
    }
}
```

Anything beyond line 10 will not be executed if the incoming request user instance does not have all the specified permissions.

The user must have all the permissions specified in the array for the action to proceed.

By default, the `canAll` method throws an exception with the message `You do not have permission to access this resource`. You can provide a custom message as a second parameter to the `canAll` method to override this behaviour.

### canAny(array $permissions, ?string $message)

Similar to the `can` method, the `canAny` method is used to secure an action by ensuring that the request has any of the specified permissions. If the request does not have any of the specified permissions, an exception is thrown and the response is returned to the client.

Here is an example of how to use the `canAny` method:

```php {linenos=table}
namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function getUserAction(Arrayable $data)
    {
        $this->canAny(['view_users', 'edit_users']);

        // Your logic here
    }
}
```

Anything beyond line 10 will not be executed if the incoming request user instance does not have any of the specified permissions.

The user must have any of the permissions specified in the array for the action to proceed.

By default, the `canAny` method throws an exception with the message `You do not have permission to access this resource`. You can provide a custom message as a second parameter to the `canAny` method to override this behaviour.

{{<callout danger>}}
The methods `can`, `canAll`, and `canAny` check for `mustAuthenticate()` before proceeding with the permission checks. If the request is not authenticated, the permission checks are not executed. You therefore do not need to call `mustAuthenticate()` before calling `can`, `canAll`, or `canAny`. 
{{</callout>}}

## Common mistakes

- **Forgetting the `Action` suffix** — `"action": "list"` calls `listAction()`, not `list()`.
- **Returning raw arrays** — always use `response()` so clients get `returnCode`, `returnMessage`, and `returnData`.
- **Reading query strings for Moonlight actions** — business params belong in the POST JSON body, not `?title=`.
- **Assuming HTTP 200 means success** — check both status code and `returnCode` (validation failures use **422**).
- **Public methods without `Action`** — helper methods are fine, but any public `*Action` method is reachable from the API.

## What's next

{{< card-grid >}}
{{< link-card title="Validation" description="Reject task.create without a title." href="/documentation/building-api/validation/" >}}
{{< link-card title="Documenting your API" description="@moonlight-* tags and /docs." href="/documentation/building-api/api-reference/" >}}
{{< link-card title="Moonlight security" description="Where auth runs in the pipeline." href="/documentation/building-api/moonlight-security/" >}}
{{< /card-grid >}}
