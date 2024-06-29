---
title: 'Pionia Services'
parent: 'documentation'
description: 'Guides you through services processing in Pionia Framework.'
summary: 'All business logic in Pionia is stored in services. This guide will show you how to create, protect and use services in Pionia.'
date: 2024-06-29 19:57:09.923 +0300
lastmod: 2024-06-29 19:57:09.923 +0300
draft: false
weight: 5
toc: true
seo:
    title: 'Pionia Services' # custom title (optional)
    description: 'Handling Services in Pionia' # custom description (recommended)
    canonical: '' # custom canonical URL (optional)
    noindex: true # false (default) or true
---

{{<callout tip>}}
This section assumes that you have a basic understanding of the Pionia framework. If you are new to Pionia, you can start with the [tutorial](/documentation/api-tutorial/).
{{</callout >}}

# Introduction

Services in Pionia Framework are central holders of business logic. This is where most of the work happens. Pionia has tried to reduce your work from other areas so that you mainly focus on this essential area. Services are in actual PHP code, just php classes that extend the `BaseRestService`. As you might already know, a class can have multiple methods. In Pionia we cann these `Actions`. Therefore, henceforth, the terms `service` and `actions` will be used for the same meaning throughout the same guide.

## Creating a service

You can create a service using our pionia console or manually. All services, as a convention, must be located in the `services` folder.

{{<callout tip >}}
We recommend to name your services after your database tables. Example, if your table is called 'users', you can name your service 'UserService'.

If you are using our 'pionia console', then you can just name your service 'user'. These are just conventions!
{{</callout>}}

{{< tabs "create-new-service" >}}
{{< tab "pionia command" >}}

Let's create a service called `TodoService`. In the terminal run the following command.

```bash
php pionia addservice todo
```

By defualt, running the above command alone create a service called `TodoService` in `services` folder with four actions.

1. `getTodo` - For getting one todo item.
2. `listTodo` - For getting all available (paginated) todos.
3. `deleteTodo` - For deleting a todo item.
4. `createTodo` - For creating a todo item.

You can delete or add more actions as you see fit.

If you want to override the above behaviour, you can define your actions with the `addservice` command.

```bash
php pionia addservice auth login register reset
```

The above will add actions `loginAuth`, `registerAuth` and `resetAuth`.

Note that everything that is listed after the service name is an action.

{{< /tab >}}
{{< tab "Manually" >}}
>>>
1. Head over to your services folder.
2. Create a new service with a clear name, such as UserService, AuthService, CartService
3. Extend BaseRestService
4. Add your own actions each taking in `data`(post request data), `files`(ff your service is expecting files) and returning `BaseResponse`.
5. Add your logic
>>>
{{< /tab >}}
{{< /tabs >}}

## Service Registration

Creating a service is not enough in Pionia. You also need to register it in our switcher to make it discoverable by the kernel. Service registration happens in the associated switch.

In the switches folder, find the switch you want to use for this service. You can add your service as below.

```php

 public function registerServices(): array
    {
        return [
            'user' => new UserService(),
            "todo" => new TodoService(),
            'auth' => new AuthService(), // like this.
        ];
    }
```

The `key` of this method is the name you shall use in your proceeding requests to access this service. Therefore it must be unique!

## Targeting a service in the request

In the request, you can target a service by determining the `SERVICE` key with your service name as the `key` defined in the `registerServices` method.

```js
{
    SERVICE: 'user'
    // rest of your request data.
}
```

## Targeting a service action

To target an action in a certain service, you need to define both the service and action as below.

```js

{
    SERVICE: "user",
    ACTION: "loginAuth",
    // rest of your service data
}
```

{{<callout note>}}

The action in every request should match the name of your method in your service action. Pionia uses auto-discovery to automatically call the method passing in every requered data needed for the request.

{{</callout>}}

## Action protection

You can protect your actions by determining that they require only authenticated requests(users) to be accessed. You can do this in three ways.

### Globally in the service

#### Entire service
You can mark an entire service as requiring authentication by setting the `$serviceRequiresAuth` parameter to `true`.

```php

class TodoService extends BaseRestService
{
    public bool $serviceRequiresAuth = true; // all actions in this service require authentication.

    // your other actions here
}
```

#### Specific actions
You can also mark specific actions in a service as requiring authentication. Use the `$actionsRequiringAuth` parameter and add action names of actions that should be reached by authenticated users only.

This, unlike `$serviceRequiresAuth`, will only protect the actions listed in the array not the entire service.

```php

class TodoService extends BaseRestService
{
    public bool $actionsRequiringAuth = ['getTodo'];

    // your other actions here
}
```

### Internally in the action

You can also call the `mustAuthenticate` method anywhere in your action, preferably the first line in the action method.

```php

class TodoService extends BaseRestService
{
    // your other actions here

    protected functon getTodo($data): BaseResponse
    {
        $this->mustAuthenticate(); // only authenticated will exceed this point.

        // rest of actions logic

    }
}
```

{{<callout note>}}
Details of how Pionia achieves authentication and authorization can be found in the [authentication section](/documentation/authentication/).
{{</callout>}}
## Request Data and Response

### Accessing the Request object in the services

You can access the request object in your service by calling the `$this->request` method on the service object. This returns the `Pionia\Request\Request` object.
You can use this to access anything on the request.

```php

class TodoService extends BaseRestService
{
    // your other actions here

    protected functon getTodo($data): BaseResponse
    {
        $request = $this->request;
        
        $uri = $this->request->getUri();

        // rest of actions logic

    }
}
```

### Request Data

#### JSON and Form Request Data
An action takes `$data` as the first parameter which is an array of the request data. You can access you post data from this parameter.

```php 
    $username = $data["username"];
    $email = $data["email"];
```

#### Multipart Data(Uploads)

If your action expects multipart upload files, then you can get these from the second action parameter called `$files`.
This is an associative array of all uploads.

```php

protected function profileUpdates(array $data, ?array $files)
{
        $profilePic = $files['profile_pik'];
}
```

> NOTE: This does not consist of base64 encoded uploads, for those, they'll be part of the `$data`.

### Action Response.

All actions must return a `Pionia\Response\BaseResponse` object. This is the object that is sent back to the client. You can use the `BaseResponse` object to send back a response with a status code, message, and data.

A helper method `BaseResponse::JsonResponse` is provided to help you create a response object that is ready to be serialized to JSON.

```php
use Pionia\Response\BaseResponse;

class TodoService extends BaseRestService
{
    // your other actions here

    protected functon getTodo($data): BaseResponse
    {
        $this->mustAuthenticate();

        // rest of actions logic

        return BaseResponse::JsonResponse(200, 'Todo fetched successfully', $todo);
    }
}
```

{{<callout note>}}
For details about request and responses, you can check the [request and response section](/documentation/request-response/).
{{</callout>}}

## Error Handling

According to Moonlight architecture, all requests should return a 200 Ok status code. This is because the client should 
be able to know if the request was successful or not by checking the `returnCode` in the response body.

All normal responses set this internally and are always returning a 200 status code. By convention and by default, all requests 
that are successful return 0 as the `returnCode`. This implies that the server can define multiple other return codes 
for other scenarios.

In Pionia, we have a global exception handler that catches all exceptions thrown anywhere in the code. This is to ensure that
the client always gets the same response format.

All exceptions thrown are caught will raise a 500 status code and the message of the exception will be sent back to the client
as the `returnMessage`.

Therefore, in your services and actions, you can throw exceptions as you see fit. And you don't need to catch them at all!

```php

protected function getTodo($data): BaseResponse
{
    $this->mustAuthenticate();

    if($data['id'] == null){
        throw new \Exception('Todo id is required'); // will be caught globally!
    }

    // rest of actions logic

    return BaseResponse::JsonResponse(200, 'Todo fetched successfully', $todo);
}
```

Please note that all exceptions are caught globally and sent back to the client. Therefore, you do not need to catch exceptions in your services.
Developers need to set clean, descriptive exception messages in their exceptions to help the client understand what went wrong. 

## Deactivating actions in a service

BaseRestService provides a parameter `$deactivatedActions` that can be used to register all deactivated actions in a service. 
This is useful when you want to deactivate an action in a service without deleting it.

```php
class TodoService extends BaseRestService
{
    public array $deactivatedActions = ['getTodo']; // one or more actions to deactivate.
   
}
```

{{<callout note>}}
Deactivated actions will not be called by the switcher. Therefore, they will not be accessible by the client.
{{</callout>}}


