---
title: 'Services'
description: 'Guides you through processing of using services in Pionia'
summary: ''
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 810
toc: true
seo:
    title: '' # custom title (optional)
    description: '' # custom description (recommended)
    canonical: '' # custom canonical URL (optional)
    noindex: false # false (default) or true
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
    SERVICE: 'user',
    ACTION: 'loginAuth',
    // rest of your service data
}
```

{{<callout note>}}

The action in every request should match the name of your method in your service action. Pionia uses auto-discovery to automatically call the method passing in every requered data needed for the request.

{{</callout>}}

## Action protection

You can protect your actions by determining that they require only authenticated requests(users) to be accessed. You can do this in three ways.

### Globally

At the service level, you can use the `$actionsRequiringAuth` parameter and add those method names of actions that should be reached by authenticated users only.

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
        $this->mustAuthenticate()

        // rest of actions logic

    }
}
```
