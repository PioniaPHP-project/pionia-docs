---
title: "Actions"
parent: "services"
description: "Getting started with Pionia Service Actions"
summary: "Actions are the central logic for the entire app, this will guide you on handling actions in Pionia Framework."
date: 2024-10-07 20:24:56.303 +0300
lastmod: 2024-10-07 20:24:56.303 +0300
draft: false
weight: 501
toc: true
seo:
  title: "Services" # custom title (optional)
  description: "Putting Pionia Services on wheels by providing all the default logic so that you stay focused on the new, complex and special logic!" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

{{<callout tip>}}
This section assumes that you have a basic understanding of the Pionia framework. If you are new to Pionia, you can start with the [tutorial](/documentation/api-tutorial/).
{{</callout >}}

## Introduction
Actions are the actual logic that is executed when a request is made to the API. Actions are the central logic for the entire app. They are responsible for handling the request, processing the data, and returning the response.

In Pionia, `actions` MUST be defined in services. If you haven't created a service yet, you can check out the [services documentation](/documentation/services/services/).

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

To define an action being targeted in your request, you have to specify the `ACTION` or `action` key in the request body. The value of the `ACTION` key should be the name of the action method in the service class.

Here is an example of a request body:

Assuming we have an action `loginAction` in the UserService class, the request body should look like this:

```json
{
    "ACTION": "login"
}
```

The above can also be targeted like this:-
    
```json
{
    "action": "login-action"
}
```

Or by simply the actual method name as the action:-

```json
{
    "ACTION": "loginAction"
}
```



## Accessing Request Data

Request data comes in various formats such as JSON, form data, etc. The `Arrayable` object provides a unified way to access the data regardless of the format.

### get($key, $default = null)

Since the request data is received as a Pionia Collections `Arrayable` object, you can access the data using the `get` method. The `get` method takes two parameters: the key of the data you want to access and the default value to return if the key is not found.

Given the request data:-

```json
{
    "username": "john.doe",
    "password": "password",
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

All methods available in the `Arrayable` class can be found [here](/documentation/collections/).

## Request Files

If the request contains files, you can access them from the second parameter of the action method. The second parameter is an instance of the `Symfony\Component\HttpFoundation\FileBag` class from `Symfony components`.

Here is an example of how to access files in an action method:

```php

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data, FileBag $files)
    {
        $avatar = $files->get('avatar');

        // Your logic here
    }
}
```

The above `$avatar` variable will return an instance of `Symfony\Component\HttpFoundation\File\UploadedFile` which you can use to check and interact with files as you see fit.

## Further Request Validation

Pionia provides a way to validate the request data before proceeding with the logic in the action method.

Various helper methods are available to help you achieve this. Let's break down some of them below.
### requires(string | array $keys)

The `requires` method is used to validate that the request data contains the specified key[s]. The `requires` method takes a string or an array of keys to validate.

If the request data does not contain the specified keys, an exception is thrown with the message `Field $field is required!`.

{{<callout tip>}}
All keys must be present in the request data for the action to proceed.
{{</callout>}}

### validate(string $key, Arrayable | Request | Service $requestData)

The `validate` helper method exposes multiple other validators that you can use to validate the request data. The `validate` method takes two parameters: the key of the data you want to validate and an instance of `Arrayable | Request | Service`.

Here is an example of how to use the `validate` helper:

```php

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;

class UserService extends Service
{
    public function loginAction(Arrayable $data)
    {
        validate('email', $this)->string()->email();
        // above is similar to below
        validate('email', $this)->string()->asEmail();

        // Your logic here
    }
}
```

You can find a complete list of validators [here](/documentation/services/validations/).

## Response

All actions must return an instance of `Pionia\Http\Response\BaseResponse`. The `BaseResponse` class provides a way to return a response to the client that conforms to the [Moonlight Paradigm](/moonlight/introduction-to-moonlight-architecture/).

Here is an example of how to return a response in an action method:

```php

namespace Application\Services;

use Pionia\Http\Services\Service;
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\BaseResponse;

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
use Pionia\Http\Response\BaseResponse;

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

In Pionia, whenever and wherever an exception is thrown in an action or anywhere in the app, it is caught and a response is returned to the client. The response conforms to the [Moonlight Paradigm](/moonlight/introduction-to-moonlight-architecture/).

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
