---
title: "Services"
parent: "documentation"
description: "Abstracting most of the CRUD work for so that you focus on only complex business logic."
summary: "Some actions like list, delete, create, retrieve/details, random, updated, are provided by default. You can still add more actions as you see fit."
date: 2024-07-05 01:06:18.709 +0300
lastmod: 2024-07-05 01:06:18.709 +0300
draft: false
weight: 500
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

# Introduction

Services in Pionia Framework are central containers of business logic. This is where most of the work happens.
Pionia has tried to reduce your work from other areas so that you mainly focus on this essential area.
Services are in actual PHP code, just php classes that extend the `Pionia\Http\Services\Service`.
As you might already know, a class can have multiple methods. In Pionia we call these `Actions`. Therefore, henceforth, the terms `service` and `actions` will be used for the same meaning throughout the same guide.

## Creating a service

You can create a service using our pionia console or manually. All services, as a convention, MUST be located in the `services` folder.

{{<callout tip >}}
We recommend to name your services after your database tables. Example, if your table is called `users`, you can name your service `UserService`.

If you are using our 'pionia console', then you can just name your service `user`. These are just conventions!
{{</callout>}}

{{< tabs "create-new-service" >}}
{{< tab "pionia command" >}}

Let's create a service called `TodoService`. In the terminal run the following command.

```bash
php pionia gen:service todo
```

Running the above command will prompt you for two options.

1. `Basic` - These are services that extend the `Pionia\Http\Services\Service`. They are close to creating manual services.
   If you select this option, you will be prompted to add actions to your service. You can add as many actions as you want
   or let the cli add the default actions of `create`, `retrieve`, `update`, `delete` for you. Once you are done, the service will be created in the `services` folder.

You can delete or add more actions as you see fit.

2. `Generic` - These are services that extend the `Pionia\Http\Services\GenericService`. They come with an entire CRUD logic out of the box.
   Once you select this option you will be presented with a list of nine options to choose from. If you are not sure of what to select,
   just hit enter and the cli will select the default option for you which is the `UniversalGenericService`. This service comes with all the CRUD logic out of the box.

Other Options are :-

[0] UniversalGenericService

[1] RetrieveListUpdateDeleteService

[2] RetrieveListUpdateService

[3] RetrieveListRandomService

[4] RetrieveListDeleteService

[5] RetrieveListCreateUpdateService

[6] RetrieveListCreateService

[7] RetrieveCreateUpdateService

[8] GenericService

Choosing option 8 gives you freedom to define your own mixins to extend.

{{< /tab >}}
{{< tab "Manually" >}}

> > >

1. Head over to your `services` folder.
2. Create a new service with a clear name, such as UserService, AuthService, CartService
3. Extend Service
4. Add your own actions each taking in `data`(post request data), `files`(if your service is expecting files) and returning `BaseResponse`.
5. Add your logic

```php {title="services\AuthService.php"}
namespace Application\Services;

use Exception;
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\BaseResponse;
use Pionia\Http\Services\Service;
use Symfony\Component\HttpFoundation\FileBag;

class AuthService extends Service
{
 /**
  * getUserAction action
  * @throws Exception
  */
  protected function retrieveUserAction(Arrayable $data): BaseResponse
   {
     $this->requires('id');

     $id = $data->get('id');

     $user = db("users")->get($id);

     if (!$user){
         throw new Exception("No user with id $id found.");
     }

   return response(0, null, $user);
  }
}
```
   > > > {{< /tab >}}
   > > > {{< /tabs >}}

{{<callout note >}}
Remember generic services target a base table.

Therefore, you shall be asked the database table name you want to target. This is required.

However, starting from version 1.1.7, you can target relationships too!

You can read more about this in the [Generic Services Section](/documentation/generic-services/).
{{</callout>}}

## Service Registration

Creating a service is not enough in Pionia. You also need to register it in any switch to make it discoverable by the kernel.
Service registration happens in the associated switch.

In the switches folder, find the switch you want to use for this service. You can add your service as below.

```php

 public function registerServices(): Arrayable
    {
        return arr([
            'user' => new UserService(),
            "todo" => TodoService::class, // this is okay
            'auth' => AuthService::class, // and this too
        ]);
    }
```

The `keys` of are the names you shall use in your proceeding requests to access/identify this service. Therefore, it must be unique per switch!

{{<callout note>}}
A single service can be registered in multiple switches. This is useful when you want to use the same service in different api versions.
{{</callout>}}

## Targeting a service in the request

In the request, you can target a service by determining the `SERVICE` key with your service name as the `key` defined in the `registerServices` method.

```js
{
  SERVICE: "user";
  // rest of your request data.
}
```


{{<callout note>}}
For details about request and responses, you can check the [request and response section](/documentation/requests-and-responses).
{{</callout>}}

## Actions

You can read more about actions in the [actions section](/documentation/services/actions/).

### Service Security

You can mark an entire service as requiring authentication by setting the `$serviceRequiresAuth` parameter to `true`.

```php

class TodoService extends Service
{
    public bool $serviceRequiresAuth = true; // all actions in this service require authentication.

    // your other actions here
}
```

If the flag is set to true, all actions in the service will require authentication. This means that only authenticated users will be able to access the service.

#### Specific actions

You can also mark specific actions in a service as requiring authentication. Use the `$actionsRequiringAuth` parameter and add action names of actions that should be reached by authenticated users only.

This, unlike `$serviceRequiresAuth`, will only protect the actions listed in the array not the entire service.

```php

class TodoService extends Service
{
    public bool $actionsRequiringAuth = ['getTodo'];

    // your other actions here
}
```

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

protected function getTodoAction($data): BaseResponse
{
    $this->mustAuthenticate();

    if(blank($data->get('id'))){
        throw new \Exception('Todo id is required'); // will be caught globally!
    }

    // rest of actions logic

    return response(200, 'Todo fetched successfully', $todo);
}
```

Please note that all exceptions are caught globally and sent back to the client. Therefore, you do not need to catch exceptions in your services.
Developers need to set clean, descriptive exception messages in their exceptions to help the client understand what went wrong.

## Deactivating actions in a service

BaseRestService provides a parameter `$deactivatedActions` that can be used to register all deactivated actions in a service.
This is useful when you want to deactivate an action in a service without deleting it.

```php
class TodoService extends Service
{
    public array $deactivatedActions = ['getTodo']; // one or more actions to deactivate.

}
```

{{<callout note>}}
Deactivated actions will not be called by the switcher. Therefore, they will not be accessible by the client.
{{</callout>}}
