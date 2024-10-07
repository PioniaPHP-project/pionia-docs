---
title: "Requests and Responses"
description: "Guides us through the process of handling requests and responses in pionia."
summary: "All actions take up request data as associated array, and return a BaseResponse object. This guide will show you how to handle requests and responses in pionia."
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 700
toc: true
seo:
  title: "Requests and Responses" # custom title (optional)
  description: "Guides us through the process of handling requests and responses in pionia." # custom description (recommended)
  noindex: true # false (default) or true
---

{{<picture src="pionia.png" alt="Pionia Logo">}}

## Handling Requests and Responses

In Pionia all actions take up request data as associated array, and return a BaseResponse object. This guide will show you how to handle requests and responses in pionia.

### Request

Pionia framework supports only HTTP verbs due to its single endpoint nature. The supported HTTP verbs are:

- GET
  This is used to `ping` api endpoints for every api version you roll out. This implies that every time you create a new switch, you get this action for free.

{{<callout context="tip" title="GET Request" icon="outline/pencil">}}
Remember all switches are matching a certain version of your api. The default `MainApiSwitch` matches `v1` of your api.
{{</callout>}}

If you want to ping the `v1` of your api, you can use the `GET` request.

```
GET http://localhost:8000/api/v1/
```

This will respond with the following:

```json
{
  "returnCode": 0,
  "returnMessage": "pong",
  "returnData": {
    "framework": "Pionia",
    "version": "1.1.7",
    "port": 8000,
    "uri": "/api/v1/",
    "schema": "http"
  },
  "extraData": null
}
```

This is the only use of the `GET` verb in Pionia. All other actions are done using the `POST` verb.

- POST

Every request you make to Pionia is `POST`. This is because Pionia is a single endpoint framework.

So for all the examples that will be mentioned below, you will assume the `POST` verb.

### Endpoint

The endpoint is the URL where your api is hosted. In Pionia, the endpoint is the same for every version of your api. The only thing that changes is the request body.
Each `switch` matches an endpoint. The default `MainApiSwitch` matches the `/api/v1/` endpoint.

All switches alongside their versions are registered in the `routes.php` file. This file is located in the `app` directory.

The highligted code below shows how the `MainApiSwitch` is registered in the `routes.php` file.
If no version is defined, then Pionia assumes `v1` as the default version.

```php {title="app/routes.php" lineNos=1 hl_Lines=7}
<?php

use Pionia\Core\Routing\PioniaRouter;

$router = new PioniaRouter();

$router->addSwitchFor("application\switches\MainApiSwitch");

return $router->getRoutes();

```

To add a second version of the api, you can add a new switch and register it in the `routes.php` file.

```php {title="app/routes.php" lineNos=1 hl_Lines=7}
<?php
use Pionia\Core\Routing\PioniaRouter;

$router = new PioniaRouter();

$router->addSwitchFor("application\switches\MainApiSwitch")
         ->addSwitchFor("application\switches\SecondApiSwitch", "v2");

return $router->getRoutes();
```

This will register the `SecondApiSwitch` to the `/api/v2/` endpoint.

{{<callout context="note" title="Note" icon="outline/pencil">}}
This also implies that all switches registered in the `routes.php` originate from the `/api/` endpoint.

This is all you need to know about Pionia Routing!
{{</callout>}}

### Request Data

Pionia supports both `JSON` and `FormData` data. Whereas using both is possible, it is recommended to use `JSON` data unless you are uploading files.

Every `action` has access to the request `data` as an associated array. This data is passed to the `action` as the first argument.

```php
<?php
public function action(array $data): BaseResponse
{
    // your code here
}
```

You can access the data in the `action` as shown below:

```php

<?php

public function action(array $data): BaseResponse
{
    $name = $data['name'];
    $email = $data['email'];

    // your code here
}
```

However, the above data won't include the `files` if you are uploading files, you can access them from the second parameter `$files`.

{{<callout context="note" title="Note" icon="outline/pencil">}}
The `files` parameter is a symfony `FileBag` object. A file bag is generally a collection of uploaded files.
{{</callout>}}

To get one file from the file bag, you can use the `get` method.

```php {hl_lines=[5]}

public function action(array $data, FileBag $files): BaseResponse
{
    $file = $files->get('file');

    $name = $data['name'];
    $email = $data['email'];

    // your code here
}
```

### Marking Request Data as required

In your action you can define data that must be present in the request.
This is done by calling the `requires` method on the service instance.

```php

<?php

public function action(array $data): BaseResponse
{
    $this->requires(['name', 'email']);

    $name = $data['name'];
    $email = $data['email'];

    // your code here
}
```

This will check if the `$data` array or the `$files` FileBag contains the `name` and `email` keys. If any of the keys are missing, the action will abort.

You can also use the method to check one key at a time.

```php

<?php

public function action(array $data): BaseResponse
{
    $this->requires('name'); // can  be a string too

    $name = $data['name'];
    $email = $data['email'];

    // your code here
}
```

> Whereas you can use the `requires` method on a single key, you should always prefer checking all your keys at once using an array.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->requires(['name', 'email']);

    $name = $data['name'];
    $email = $data['email'];

    // your code here
}
```

## Validating Request Data

Pionia provides a simple way to validate request data. Helper methods are already available on the service instance.

For all the helper methods provided, you can override the underlying regex pattern by passing a custom pattern as the second argument.

### Email

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asEmail($data['email']);

    // your code here
}
```

### URL

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asUrl($data['url']);

    // your code here
}
```

### IP

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asIp($data['ip']);

    // your code here
}
```

### Slug

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asSlug($data['slug']);

    // your code here
}
```

### International Phone Number

You can also validate international phone numbers. The second argument is the country code you want to validate against. This is optional.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asPhoneNumber($data['phone'], '+254');

    // your code here
}
```

### Password

Strong Passwords have rules that they must adhere to. You can validate passwords using the `asPassword` method.
Rules considered are:

- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character
- At least 8 characters long

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asPassword($data['password']);

    // your code here
}
```

### Number

This checks for both Integers and Floats.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asNumber($data['number']);

    // your code here
}
```

### Numeric

This checks for numbers and numbers in string format.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asNumeric($data['numeric']);

    // your code here
}
```

### Numeric Integers

This checks for integers and integers in string format.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asNumericInt($data['int']);

    // your code here
}
```

### Mac Address

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asMac($data['mac']);

    // your code here
}
```

### Domain

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->asDomain($data['domain']);

    // your code here
}
```

### Should Be

This is a special method that allows you to define a custom validation. The second argument can be a regex or anything to match.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->shouldBe($data['custom'], '/^([a-zA-Z0-9\s_\\.\-:])+$/');

    // your code here
}
```

### All Should Be

Checks if all the keys in the array are valid. The second argument is the validation method to use.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->allShouldBe($data, '/^([a-zA-Z0-9\s_\\.\-:])+$/');

    // your code here
}
```

### Custom Validation

You can also define a custom validation using the validate method. The method should return a boolean or int.

```php {hl_lines=4}
<?php
public function action(array $data): BaseResponse
{
    $this->validate(string $regex, mixed $data, $message = 'Invalid data');

    // your code here
}
```

## Response

All responses that hit the application server return a `200 OK` status code. And as a result, Pionia returns back the power to define
the return code of the response. This is done by returning a `BaseResponse` object.

Pionia returns a `BaseResponse` object for every action. This object is used to send responses back to the client.

This response consists of the following fields:

- `returnCode`: This is the return code of the response. It is an integer and is required.
- `returnMessage`: This is the return message of the response. It is a string or null.
- `returnData`: This is the return data of the response. It is an array or null.
- `extraData`: This is any extra data you want to send back. It is an array or null.

### Exceptions

In Pionia, wherever you're, you can throw an exception. This will be caught by the framework and the response will be sent back to the client.

Therefore, to abort any action or task on going, you can just throw an exception with clear message.

```php
<?php
public function action(array $data): BaseResponse
{
    throw new Exception('This is an exception message that will stop this action from proceeding');
}
```

{{<callout context="note" title="Note" icon="outline/pencil">}}
By default, Pionia reserves `returnCode` of `0` for successful responses. This is just a convention, and you can use any other code you want.
{{</callout>}}
