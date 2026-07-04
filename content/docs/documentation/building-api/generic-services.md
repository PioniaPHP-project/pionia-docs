---
title: "Generic services"
slug: "generic-services"
description: "CRUD over Porm tables with mixins — less boilerplate for DeskFlow project rows."
summary: "UniversalGenericService ships list, create, update, delete, and random actions out of the box."
date: 2024-06-29 19:57:09.923 +0300
lastmod: 2026-07-04
draft: false
weight: 240
toc: true
doc_type: topic
seo:
  title: "Generic services in Pionia"
  description: "Build CRUD APIs over Porm tables with GenericService mixins."
  noindex: false
---

---

## Who this is for

DeskFlow's `project` table needs list/create/update with little custom logic, while `TaskService` stays hand-written. **Generic services** give you CRUD actions without boilerplate.

## What you will learn

- Which mixin bundles (`ListMixin`, `CreateMixin`, …) each generic base class includes
- Configuring `$table`, `$createColumns`, and `$listColumns` for Northwind projects
- Hooks (`preCreate`, `postUpdate`) for side effects without overriding every action

## Before you start

{{< prerequisites >}}
- [Services](/documentation/building-api/services/) — how aliases map to PHP classes
- [Making queries](/documentation/database/making-queries/) — `table()` basics
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  JSON["project.list"] --> Generic[ProjectService]
  Generic --> Mixin[ListMixin]
  Mixin --> Porm["table(projects)"]
{{< /mermaid >}}

**Generic services** extend `Pionia\Http\Services\GenericService` and combine **mixins** (`ListMixin`, `CreateMixin`, …) for standard CRUD. Use them when DeskFlow's `project` table needs list/create/update with little custom logic — keep `TaskService` manual when rules get complex.

```bash
php pionia make:service project
# Generic → UniversalGenericService, table name: projects
```

Clients call the same Moonlight envelope:

```json
{ "service": "project", "action": "list", "page": 1 }
```

## Mixins overview

### CreateMixin

This mixin adds the `create` action to whatever generic service you have added. It is used to create a new record in the database.
You can specify the columns to create in the table by providing the `$createColumns` array property in the service.

### DeleteMixin

This mixin adds the `delete` action to whatever generic service you have added.
It is used to delete a record from the database by `pk_field` defined in the service.

### ListMixin

This mixin adds the `list` action to whatever generic service you have added. It also detects if the request is paginated
and applies the pagination to the data accordingly. You can customise the columns to return by defining the
`$listColumns` array property in the service.

### RetrieveMixin

This mixins adds two actions which actually perform the same operation. The `retrieve` and the `details` action.
They are used to get a single record from the database by the `pk_field` defined in the service.
If the `$listColumns` property is defined, it will return only those columns.

### RandomMixin

This mixin adds the `random` action to whatever generic service you have added. The number of records returned is by default `1`.
But this can be overridden by defining the `size` or `limit` parameter in the request. If the size is finally one, it will return
an object otherwise an array of objects.

### UpdateMixin

This mixin adds the `update` action to whatever generic service you have added. It is used to update a record in the database.
You can specify the columns to update in the table by providing the `$updateColumns` array property in the service. If these are not defined,
then all/only the table columns that are defined in the request will be updated(partial update). Also, the item to update will depend on the
`pk_field` defined in the service. By default this is `id`.

{{<callout note>}}
The mixins are not to be used outside services that extend the `GenericService` class. They are already included in the generic services.
But if you want to use them, make sure you're extending the `GenericService` class or any of the generic services defined below.
{{</callout >}}

## The GenericService

This is the core class that provides the basis for all generic CRUD actions. It extends `Pionia\Http\Services\Service`.
All available methods are covered in this guide and [Advanced generic services](/documentation/building-api/advanced-generic-services/).

You don't need to interact with this class directly but through the following generic services.

1. [RetrieveCreateUpdateService](#retrievecreateupdateservice)
2. [RetrieveListCreateService](#retrievelistcreateservice)
3. [RetrieveListCreateUpdateDeleteService](#retrievelistcreateupdatedeleteservice)
4. [RetrieveListDeleteService](#retrievelistdeleteservice)
5. [RetrieveListRandomService](#retrievelistrandomservice)
6. [RetrieveListUpdateDeleteService](#retrievelistupdatedeleteservice)
7. [RetrieveListUpdateService](#retrievelistupdateservice)
8. [UniversalGenericService](#universalgenericservice)

Creating you custom generic service can be done as follows:

```php
use Pionia\Http\Services\GenericService;
use Pionia\Http\Services\Generics\Mixins\CreateMixin;
use Pionia\Http\Services\Generics\Mixins\RandomMixin;

class CreateRandomService extends GenericService
{
    use CreateMixin, RandomMixin;
}
```

Now you can let you services extend this class and you will have the `create` and `random` actions available.

```php

use application\services\CreateRandomService;

class MyService extends CreateRandomService
{
    public string $table = 'users';

    public array $createColumns = ['name', 'age', 'gender']
}
```

Remember you still need to register all these service as usual. In your request you can now call the `create` and `random` actions.

```json
{
  "service": "task",
  "action": "random",
  "size": 3
}
```

The above request will return 3 random records from the `users` table.

{{<callout note>}}
`GenericService` inherits from `Service`, so authentication helpers (`mustAuthenticate()`, `can()`, `auth()`) work the same as custom services.
{{</callout >}}

## RetrieveCreateUpdateService

This generic service provides the `retrieve`, `create` and `update` actions.

```php
use Pionia\Http\Services\Generics\RetrieveCreateUpdateService;

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
    public array $createColumns = [];
}
```

## RetrieveListCreateService

This generic service provides the `retrieve`, `list` and `create` actions.

```php

use Pionia\Http\Services\Generics\RetrieveListCreateService;

class StudentService extends RetrieveListCreateService
{
    public string $table = 'students';
    public array $createColumns = [];
}
```

## RetrieveListCreateUpdateDeleteService

This generic service provides the `retrieve`, `list`, `create`, `update` and `delete` actions.

```php

use Pionia\Http\Services\Generics\RetrieveListCreateUpdateDeleteService;

class StudentService extends RetrieveListCreateUpdateDeleteService
{
    public string $table = 'students';
    public array $createColumns = [];
    public ?array $updateColumns = null;
}
```

## RetrieveListDeleteService

This generic service provides the `retrieve`, `list` and `delete` actions.

```php

use Pionia\Http\Services\Generics\RetrieveListDeleteService;

class StudentService extends RetrieveListDeleteService
{
    public string $table = 'students';
}
```

## RetrieveListRandomService

This generic service provides the `retrieve`, `list` and `random` actions.

```php

use Pionia\Http\Services\Generics\RetrieveListRandomService;

class StudentService extends RetrieveListRandomService
{
    public string $table = 'students';
}
```

## RetrieveListUpdateDeleteService

This generic service provides the `retrieve`, `list`, `update` and `delete` actions.

```php

use Pionia\Http\Services\Generics\RetrieveListUpdateDeleteService;

class StudentService extends RetrieveListUpdateDeleteService
{
    public string $table = 'students';
    public ?array $updateColumns = null;
}
```

## RetrieveListUpdateService

This generic service provides the `retrieve`, `list` and `update` actions.

```php

use Pionia\Http\Services\Generics\RetrieveListUpdateService;

class StudentService extends RetrieveListUpdateService
{
    public string $table = 'students';
    public ?array $updateColumns = null;
}
```

## UniversalGenericService

This generic service provides all the actions. It is the most generic of all the generic services.

```php

use Pionia\Http\Services\Generics\UniversalGenericService;

class StudentService extends UniversalGenericService
{
    public string $table = 'students';
    public array $createColumns = [];
    public ?array $updateColumns = null;
    public ?array $listColumns = ['id', 'name'];
    public string $pk_field = 'id';
}
```

{{<callout note>}}
All cases of `retrieve` can be replaced with `details` thus setting `ACCTON` in
your request as `details` will still work the same as setting it to `retrieve`.
{{</callout >}}

## Customization

### $table

This defines for us the table we are going to be interacting with. It is a required option.

```php
class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
}
```

All the other services will require you to define this. This is the table that the service will be interacting with.

### $pk_field

This defines the primary key field of the table. By default it is `id`. But you can override it to be any other field.

```php

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
    public string $pk_field = 'student_id';
}
```

### $createColumns

This defines the columns that will be created when the `create` action is called. It is an array of strings.

```php

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
    public ?array $createColumns = ['name', 'age', 'gender'];
}
```

Any other columns that are not defined in this array shall be ignored. This is requred for all create services.

### $updateColumns

This defines the columns that will be updated when the `update` action is called. It is an array of strings.

```php

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
    public ?array $updateColumns = ['name', 'age', 'gender'];
}
```

If this is not defined, then all the columns that are defined in the request will be updated. This param is optional.

Optional fields: append `?` to a column name (e.g. `'bio?'`) so the field is updated only when present in the request.

### `$skipUpdatePrefetch`

When `true`, `update` skips loading the existing row before merge. `preUpdate` receives only request fields plus the primary key — use with `$updateColumns` for predictable payloads:

```php
public bool $skipUpdatePrefetch = true;
public ?array $updateColumns = ['title', 'score'];
```

### `$cacheListTtl` / `$cacheRetrieveTtl`

Cache list and retrieve responses (seconds). `null` disables caching. Keys include table, filters, and request params.

```php
public ?int $cacheListTtl = 60;
public ?int $cacheRetrieveTtl = 300;
```

### Validation errors

Missing required fields in `create` / `update` throw `Pionia\Exceptions\ValidationException` (HTTP **422**). Register `->dontReport(ValidationException::class)` on the exception pipeline if you do not want these logged.

### $listColumns

This defines the columns that will be returned for all actions that return data back to the end user. It is an array of strings.

```php

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
    public ?array $listColumns = ['id', 'name'];
}
```

The above implies that whether we are hitting `list`, `retrieve`, `random` or any other action that returns data,
only the `id` and `name` columns will be returned. This is optional and defaults to `*` if not defined.

### $limit

This defines the size of records to return. It is an integer. It will henceforth be replaced
by the `LIMIT` or `limit` on the request if it is defined or in the `PAGINATION` or `pagination` key in the request.

By default, this is set to 10 records.

```php

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
    public int $limit = 10;
}
```

### $offset

This defines the offset where to start querying from. It is an integer. It will henceforth to be replaced
by the `OFFSET` or `offset` on the request if it is defined or in the `PAGINATION` or `pagination` key in the request.

By default, this is set to 0 records.

```php

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';
    public int $offset = 0;
}
```

{{<callout note>}}
`limit` or `LIMIT` and `offset` or `OFFSET` must both be defined on the request or in the `PAGINATION` or `pagination` or in the `SEARCH` or `search` key in the request
for pagination to kick in, otherwise, each will perform its respective duty without pagination.
{{</callout >}}

## Overriding Actions

You can override any of the actions provided by the generic services. This is done by defining the action in the service.

The dispatcher calls **`yourAction(Arrayable $data, FileBag $files, Request $request)`** — declare `Arrayable $data` (and only the parameters you use).

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';

    public function createAction(Arrayable $data): ApiResponse
    {
        // Your custom logic here — $data is Arrayable; same as $this->request->getData()

        return response(0, 'your message', ['id' => $data->get('id')]);
    }
}
```

The fact that Pionia is structured in an OOP way, you can override any of the actions provided by the generic services.
This is just normal PHP OOP inheritance.

## Adding Custom Actions

You can add your own custom actions to the generic services. This is done by defining the action in the service.

```php
use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';

    public function customAction(Arrayable $data): ApiResponse
    {
        // Your custom logic here

        return response(0, 'your message', $data->only(['field'])->all());
    }
}
```

You can call this action by setting `"action": "custom_action"`:

```json
{
  "service": "task",
  "action": "custom_action"
}
```

{{<callout note>}}
The name of your custom action must not conflict with any of the actions provided by the generic services.
Otherwise you stand a chance of overriding the generic action.
{{</callout >}}

## Overriding getters

You can also tell the service `how to query one` item and `how to list multiple` items. This is can be handy where
for example you want to add complex where clauses to your queries.

For this cause, you can override the `getItem` and `getItems` methods in service.

```php

class StudentService extends RetrieveCreateUpdateService
{
    public string $table = 'students';

    /**
     * Override this in your service to define the basis to return single item details
     * @return null|object
     */
    public function getItem(): ?object
    {
        return null;
    }

    /**
     * Override this in your service to define the basis to return multiple items from the database
     * @return null|object
     */
    public function getItems(): ?array
    {
        return null;
    }
}
```

## Generic Services Signals(Hooks)

Generic Services come baked with hooks that enable you to run custom code before or after the CRUD operations.
The following are some of these hooks:

### preCreate

This hook is called before the `create` action is executed.

```php
    public function preCreate(?array $createItem = null): array|bool|null
    {
        if ($createItem) {
            $createItem['title'] = $createItem['title'] . " - " . date('Y-m-d H:i:s');
        }

        return $createItem;
    }
```

If this hook returns `null` or a false value, the `create` action will abort.

Also, this hook has access to the `createItem` that is about to be created. You can mutate data as you see fit at this point or add extra data.

On success, hooks must return the `createItem` that will be used to create the record.

### postCreate

This hook is called after the `create` action is executed.

```php
    public function postCreate(object|array|null $createdItem = null): object|array|null
    {
        $createdItem->created = true;
        return $createdItem;
    }
```

It gives you access to the currently create record. You can mutate the return data as you see fit, but this won't affect
the object that has already been saved. This is just for the response.

Whatever object or array you return from here is what shall be sent back to the user.

### preUpdate

This hook is called before the `update` action is executed.

```php
    public function preUpdate(?array $updateItem = null): array|bool|null
    {
        if ($updateItem) {
            $updateItem['title'] = $updateItem['title'] . " - " . date('Y-m-d H:i:s');
        }

        return $updateItem;
    }
```

If this hook returns `null` or a false value, the `update` action will abort.

Also, this hook has access to the `updateItem` that is about to be updated. You can mutate data as you see fit at this point or add extra data.

The object that is returned from this hook is what shall be used to update the record.

### postUpdate

This hook is called after the `update` action is executed.

```php
    public function postUpdate(object|array|null $updatedItem = null): object|array|null
    {
        $updatedItem->updated = true;
        return $updatedItem;
    }
```

It gives you access to the currently updated record. You can mutate the return data as you see fit, but this won't affect
the object that has already been saved. This is just for the response.

Whatever object or array you return from here is what shall be sent back to the user.

### preDelete

This hook is called before the `delete` action is executed.

```php
    public function preDelete(object|array|null $itemToDelete = null): array|null|object|bool
    {
        if ($itemToDelete->id > 10){
            return false;
        }
        return $itemToDelete;
    }
```

If this hook returns `null` or a false value, the `delete` action will abort. Otherwise, the `$itemToDelete` will be deleted.

The hook also gives you access to the item to be deleted. You can perform any conditions or any other logic you see fit.

### postDelete

This hook is called after the `delete` action is executed.

```php
    public function postDelete(PDOStatement $deleteInstance, object|array|null $deletedItem = null): mixed
    {
        return $deletedItem;
    }
```

However much the record is nolonger in the db, this hook gives you access to the record that was deleted.
You can use it as you see fit. The object that is returned from this hook is what shall be sent back to the user.

### Why would you need these hooks?

1. Hooks can be used to mutate data before it is saved to the database.
2. Hooks can be used to transform the response back to the user to meet your needs.
3. It is in these hooks where you have a chance to log, send emails or do any other action that is not directly related to the CRUD operation.

{{<callout note>}}
The hooks are not to be used outside services that extend the `GenericService` class. They are already included in the generic services.
{{</callout >}}

## Securing Generic Services.

Generic services use the same auth traits as custom services — protect actions with `@moonlight-auth` and `mustAuthenticate()` where needed.

You can still use `$serviceRequiresAuth` to protect the entire service from unauthenticated access.

```php
public bool $serviceRequiresAuth = true;
```

You can also define a few actions that will require authentication like below.

```php
public ?array $actionsRequiringAuth = ['create', 'update', 'delete'];
```

You can also protect actions by permissions using the `$actionPermissions` property.

```php
public ?array $actionPermissions = [
    'create' => ['create_student'],
    'update' => ['update_student'],
];
```

This will ensure that only users with the listed permissions can access the action.

{{<callout note>}}
Please note that the permissions are represented as an `array` not a `string`.
{{</callout >}}

## Conclusion

The generic services are there to help you with the CRUD operations. They are there to help you focus on the complex business logic.

You can use the mixin to come up with your own custom generic services. You can also override the actions provided by the generic services.

This is all to turbocharge your development process which is the main goal of Pionia.

## Common mistakes

- **Using generic services for task assignee rules** — override actions or switch to a manual `TaskService` when logic outgrows CRUD.
- **Forgetting `$createColumns`** — create actions ignore undeclared columns; required fields must be listed explicitly.
- **Conflicting custom action names** — a `listAction` override replaces the mixin; name custom actions distinctly (`archiveAction`).
- **Skipping switch registration** — generic services still need `'project' => ProjectService::class` on `MainSwitch`.

## What's next

{{< card-grid >}}
{{< link-card title="Advanced generic services" description="Joins, file uploads, relationships." href="/documentation/building-api/advanced-generic-services/" >}}
{{< link-card title="Validation" description="422 on missing create columns." href="/documentation/building-api/validation/" >}}
{{< link-card title="Database relationships" description="Join projects to tasks." href="/documentation/database/relationships/" >}}
{{< /card-grid >}}