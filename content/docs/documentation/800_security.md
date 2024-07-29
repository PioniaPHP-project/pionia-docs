---
title: "Security - Authentication and Authorization"
description: "Authentication and Authorization are two important aspects of security in any application. This guide will show you how to secure your application using pionia."
summary: "Authentication and Authorization are two important aspects of security in any application. This guide will show you how to secure your application using pionia."
date: 2024-06-29 21:06:45.763 +0300
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 800
toc: true
seo:
  title: "Security" # custom title (optional)
  description: "Guides us through Pionia's approach to authentication" # custom description (recommended)
  noindex: true # false (default) or true
---

{{<picture src="pionia.png" alt="Pionia Logo">}}


{{<callout  tip >}}
This guide assumes you have a basic understanding of how Pionia works. If you are new to Pionia, you can start by going through the [API Tutorial](/documentation/api-tutorial) guide.
{{</callout>}}

Security is a very important aspect of any application. In Pionia, Security is approached in two ways.

- Authentication
- Authorization

## Authentication - Authentication Backends.

Currently, Pionia does not dictate on any authentication mechanism but provides a way to implement your own authentication mechanism.

{{<callout note >}}
Pionia keeps an open mind on how you want to secure your apis. Most commonly, you will find JWT, OAuth, Basic Auth, and many more helpful.
You can implement any of these in Pionia. All Pionia is seeking out is context user object that gets returned in your authentication backends.

With this approach, you can make authentication backends that handle mobile, web, and other platforms separately.

Packages like [firebase/php-jwt](https://github.com/firebase/php-jwt) can be used to implement JWT authentication.

Also, you can visit our [jwt authentication sample guide](/documentation/jwt-authentication/) on how to implement JWT authentication in Pionia.

{{</callout>}}

### About Authentication Backends

These are classes that are responsible for authenticating the user. They are responsible for verifying the user's identity and returning the user object.

All authentication backends must extend the `Pionia\Core\Interceptions\BaseAuthenticationBackend` class and implement the `authenticate` method. 
This method receives the request object, this also implies that you have access to your headers, request body, and therefore you can implement any authentication mechanism you want.

Authentication backends must return the `Pionia\Core\Helpers\ContextUserObject` object if the user is authenticated, otherwise, they should return `null`.

You can have multiple authentication backends in the same application. Pionia will iterate through all the authentication backends until one of them returns a user object.

Otherwise, it will proceed to process the request without authenticating the user. And as a result, `this->mustAuthenticate` will be failing if the user is not authenticated.

### Creating an Authentication Backend

To quickly bootstrap your authentication backend, you can use the following command.

Example below creates an authentication backend called `JwtAuthBackend`.
```bash
php pionia  gen:auth  jwt
```

{{<callout  tip >}}
Notice that we only define `jwt` as the authentication backend name. This is because Pionia will automatically append `AuthBackend` to the name.
{{</callout>}}

Upon running the above command, Pionia will create a new authentication backend in the `app/authentications` directory.

```php 
<?php

/**
 * This authentication backend is auto-generated from pionia cli.
 * Remember to register your backend in settings.ini
 */

namespace application\authentications;

use Pionia\Core\Helpers\ContextUserObject;
use Pionia\Core\Interceptions\BaseAuthenticationBackend;
use Pionia\Request\Request;

class JwtAuthBackend extends BaseAuthenticationBackend
{
	/**
	 * Implement this method and return your 'ContextUserObject'. You can use Porm here too!
	 */
	public function authenticate(Request $request):? ContextUserObject
	{
		$userObj = new ContextUserObject();
        
		# your logic here...

		return $userObj;
	}
}
```

You can now implement your authentication logic in the `authenticate` method.

To access the headers, you can get them from the `headers` key on the request like `$authHeader = $request->headers->get('Authorization');`.

The ContextUserObject is a simple object that holds the user's information. You can add any information you want to this object.

It contains the following properties:

- `user` - The object from your db.
- `authenticated` - A boolean value that indicates whether the user is authenticated or not.
- `permissions` - An array of permissions that the user has.
- `authExtra` - Any other extra data you want to set on the user context. This can store staff like role, user id, etc. You will be able to access this data in your services.

### Registering your Authentication Backend

After creating your authentication backend, you need to register it in the `settings.ini` file under the `authentications` section.
Every backend must be given a unique name. Also, you to note that the order of registration matters. Pionia will iterate through the authentications in the order they are registered.

```ini
[authentications]
jwt_auth = application\authentications\JwtAuthBackend

```

And that's it! Your authentication backend is now ready to be used in your application.

### RBAC - Service Level Authorization

#### Accessing the set Context Object

To access the context object in your services, you can access it from the  `$this->auth();`.

This returns the `ContextUserObject` object that you set in your authentication backend.

```php
<?php

class TodoService extends BaseRestService
{
    public function getTodo()
    {
        $user = $this->auth()->user;
        $permissions = $this->auth()->permissions;
        $authExtra = $this->auth()->authExtra;

        // your logic here...
    }
}
```

#### Accessing the AuthExtras
AuthExtras are an associative array that you can use to store any extra data you want to access in your services. To access a single item from this array,
you can use `$this->getAuthExtraByKey($key)`.

You can also check if a certain extra key was set on the extras array by using `$this->authExtraHas($key)`. This will return a boolean value.

```php
<?php

class TodoService extends BaseRestService
{
    public function getTodo()
    {
        $role = $this->getAuthExtraByKey('role');
        $userId = $this->getAuthExtraByKey('userId');

        // your logic here...
    }
}
```

### Protecting your Services

The entire service can be protected by setting the `$serviceRequiresAuth` property to `true`. This will ensure that all actions in the service are secure and only authenticated users can access them.

```php
<?php

class TodoService extends BaseRestService
{
    protected $serviceRequiresAuth = true;

    public function getTodo()
    {
        // your logic here...
    }
}
```

### Protecting your Actions

You can also protect individual actions in two ways.

#### Setting the `$actionsRequiringAuth` property

You can set the `$actionsRequiringAuth` property to an array of actions that require authentication.

```php

class TodoService extends BaseRestService
{
    protected $actionsRequiringAuth = ['getTodo'];

    public function getTodo() // accessing this action will require authentication
    {
        // your logic here...
    }
}
```

#### Using the `mustAuthenticate` method

You can also use the `mustAuthenticate` method in your action to check if the user is authenticated. This method will throw an exception if the user is not authenticated.

```php

class TodoService extends BaseRestService
{
    public function getTodo()
    {
        $this->mustAuthenticate(); // user must be authenticated to go beyond this point

        // your logic here...
    }
}
```

Setting the `$authMessage` property will set a custom message that will be thrown if the user is not authenticated.

```php

class TodoService extends BaseRestService
{
    protected $authMessage = 'You must be authenticated to use any service in the todo context.';

    public function getTodo()
    {
        $this->mustAuthenticate(); // user must be authenticated to go beyond this point

        // your logic here...
    }
}
```
## Authorization

Authorization is the process of determining whether a user has the necessary permissions to access a certain resource.

In Pionia, authorization is done using permissions. Permissions are authorization rules that you can set on your context object in your authentication backend.

### Permissions - Authorities

There are three ways to check if a user has a certain permission[s]/authority[ies].

### Using the `$actionPermission` service property.

This can be used both in the normal and in generic services. It defines an associative array that defines permission list per action.

```php 

public array $actionPermissions = [
    'create' => ['create_todo'],
    'update' => ['update_todo'],
    'delete' => ['delete_todo']
];
```

*From Version 1.1.4, this can also take up strings like below*

```php
public array $actionPermissions = [
    'create' => 'create_todo',
    'update' => 'update_todo',
    'delete' => 'delete_todo'
];
```

Permissions `create_todo`, `update_todo` are permissions you set on the context user object from your authentication backends. 
If these are not defined, the service won't be accessed.


The above implies that to access 

#### Using the `can` method

You can check if a user has a certain permission by using the `can` method that is available on the service.

```php
<?php

class TodoService extends BaseRestService
{
    public function getTodo()
    {
        $this->can('view-todo'); // user must have the permission to go beyond this point
    }
}
```

If the user does not have the permission, the `can` method will throw an exception and the action will not be executed.

#### Using the `canAll` method

`can` checks only one permission, however, you can check multiple permissions by using the `canAll` method.

```php
<?php

class TodoService extends BaseRestService
{
    public function getTodo()
    {
        $this->canAll(['view-todo', 'edit-todo']); // user must have both permissions to go beyond this point
    }
}
```

#### Using the `canAny` method

The two methods mentioned earlier check if the user has the permission. However, you might want to check if the user `has any one` of the permissions. You can do this by using the `canAny` method.

```php

class TodoService extends BaseRestService
{
    public function getTodo()
    {
        $this->canAny(['view-todo', 'edit-todo']); // user must have any of the permissions to go beyond this point
    }
}
```

### Custom Authorization Messages
The above methods take a second parameter `$message` which is a custom message that will be thrown if the user does not have the permission.

```php

class TodoService extends BaseRestService
{
    public function getTodo()
    {
        $this->can('view-todo', 'You do not have permission to view todo'); // user must have the permission to go beyond this point
    }
}
```
{{<callout  note>}}
All the authentication and authorization should happen early in the an action. This is because, if the user is not authenticated or does not have the necessary permissions, the action should not be executed.
{{</callout>}}


{{<callout  tip>}}
Remember, all authentication backends run after middlewares. This is because middlewares can be used to sanatize the request, and therefore, it is important to run them before the authentication backends.
{{</callout>}}


## Custom Return Codes.

By default, Pionia will return a `401` return code if the user is not authenticated and a `403` return code if the user does not have the necessary permissions.

You can override these permissions by defining the `UNAUTHENTICATED_CODE` and the `UNAUTHORIZED_CODE` in the `settings.ini` under the `SERVER` section.

```ini

[SERVER]
; other settings
UNAUTHENTICATED_CODE = 10
UNAUTHORIZED_CODE = 11
; other settings

```
Using the above example, `10` and `11` will override the default `401` and `403` return codes respectively.
