---
title: "API Tutorial"
description: "Guides lead a user through a specific task they want to accomplish, often with a sequence of steps."
summary: ""
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 400
toc: true
seo:
  title: "Sample API tutorial" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

{{<callout tip>}}

This section assumes that you have already setup your pinia framework project. If you haven't done done, please head over to [Installation](/documentation/introduction/#installation).

This guide also introduces you to the implementation of the [Moonlight architecture](/docs/moonlight/), so you can check it out first to get familiar with the terminologies.
{{</callout >}}


## Out Target

We should be able to accomplish the following tasks by the end of this tutorial:

1. [ ] Intialise the project.
2. [ ] Connect to a database.
3. [ ] Create a service.
4. [ ] Create or update a to-do item in the database.
5. [ ] Retrieve all to-do items from the database.
6. [ ] Retrieve a single to-do item from the database.
7. [ ] Retrieve n random to-do item[s] from the database.
8. [ ] Delete a to-do item from the database.

### Prerequisites

- You should have a basic understanding of PHP.
- You should have postman installed on your machine for testing the API.
- You should have a database created already.

### Step 1: Initialize the project

To create a new project, you need to run the following command in the directory you want your project to be created. We are calling ours `todo_api`.

```bash
composer create-project pionia/pionia-app todo_api
```

We can open the project in our favorite code editor or IDE, for this tutorial we will be using PhPStorm IDE.

> All IDEs and Editors should be okay to use since Pionia is powered by PHP that is supported by most of the IDEs.

For explanation of the directories and scripts, please refer to the [Structure Section of this documentation](/documentation/structure/).

- [x] Intialise the project(Completed)

### Step 2: Connect to a database

Pionia removes the section of models and migrations and instead uses a simple and lightweight query builder to [interact with the database - PORM](/documentation/database).

At its heart, PORM is a wrapper on top of [medoo](https://medoo.in/), a lightweight database framework that makes interacting with the database easy and fun.

> You can create a new database or use an existing one as you see fit!

Assuming you have already setup your MySQL database.

Let's first create our MySQL database as below:

```sql
CREATE DATABASE todo_db;

USE todo_db;

```

Then we can create a table called `todos` as below:

```sql
create table if not exists todos (
  id int auto_increment primary key,
  title varchar(200) not null,
  description text,
  created_at timestamp default CURRENT_TIMESTAMP
);

desc todos;
```

Above should return the following:

![alt text](image-2.png)

Open `settings.ini` file and update the database settings as below:

```ini {title="settings.ini"}
[db]
database = "todo_db" # your database name
username = "root" # your database user
type = "mysql" # your database type
host = "localhost"
password = "" # your database password
port = 3306
```

- [x] Connect to a database(Completed)

Throughout this tutorial, we will be creating everything manually, however, pionia cli can be used to create most of the staff for you.

Just run the following command in your terminal to see the available commands.

```bash
php pionia
```

### Step 3: Create the service - `TodoService`

Since all our business logic is related to To-do items, we only need one service called `TodoService`. Head over to services directory and add the following code to `TodoService.php`. All our services should extend `BaseRestService` class.

```php {title="TodoService.php"}
<?php

namespace application\services;


use Pionia\request\BaseRestService;

class TodoService extends BaseRestService
{

}
```

After creating our service, we need to register it in the `MainApiSwitch` class. Open `MainApiSwitch.php` and add the following code:

```php {title="MainApiSwitch.php"}
public function registerServices(): array
    {
        return [
            'user' => new UserService(),
            "todo" => new TodoService(), // add this line here
        ];
    }
```

Now our service is discoverable by the framework.

- [x] Create the service(Completed)

### Step 4: Create or update a to-do item in the database - 1st action.

We create our first action in our service called 'createOrUpdate'. This action will be responsible for creating a new to-do item in the database or update an existing one if an id is provided.

```php {title="TodoService.php"}
namespace application\services;


use Pionia\request\BaseRestService;

class TodoService extends BaseRestService
{
  public function createOrUpdate($data) : BaseResponse
    {
        $title = $data['title'];
        $description = $data['description'];
        $id = $data['id'] ?? null;

        if (!$id) {
            // here we can create
            $saved = Porm::from("todos")
                ->save([
                    'title' => $title,
                    'description' => $description,
                ]);
        } else {
            // here we can update
            Porm::from("todos")
                ->update([
                    'title' => $title,
                    'description' => $description,
                ], $id);

            $saved = Porm::from("todos")
                ->get($id);
        }
        return BaseResponse::JsonResponse(0, "Todo $saved->title created.", $saved);
    }
}
```

Sending the request using any client of choice.

{{<tabs "test-the-api">}}

{{<tab "Axios FormData(postman)">}}

```js
  const axios = require('axios');
  const FormData = require('form-data');
  let data = new FormData();
  data.append('title', 'Pass this ');
  data.append('description', 'Must pass this');
  data.append('SERVICE', 'todo');
  data.append('ACTION', 'create');

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:8000/api/v1/',
    headers: {
      ...data.getHeaders()
    },
    data : data
  };

  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
```
{{</tab>}}

{{<tab "Axios JSON Data(Postman)">}}

```js
  const axios = require('axios');
  let data = JSON.stringify({
    "SERVICE": "todo",
    "ACTION": "create",
    "title": "Become an avenger",
    "description": "Make sure you become an avenger at 10!"
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:8000/api/v1/',
    headers: {
      'Content-Type': 'application/json'
    },
    data : data
  };

  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
```

{{</tab>}}
{{<tab "XHR -JSON (Postman)">}}
```js
  var data = JSON.stringify({
    "SERVICE": "todo",
    "ACTION": "create",
    "title": "Become an avenger",
    "description": "Make sure you become an avenger at 10!"
    "id": 2 // this is optional, only pass it to update.
  });

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", "http://localhost:8000/api/v1/");
  xhr.setRequestHeader("Content-Type", "application/json");
```
{{</tab>}}
{{</tabs>}}

On Successful execution, the above code should return the following:

```json
{
    "returnCode": 0,
    "returnMessage": "Todo Become an avenger created.",
    "returnData": {
        "id": 2,
        "title": "Become an avenger",
        "description": "Make sure you become an avenger at 10!",
        "created_at": "2024-05-26 00:11:23"
    },
    "extraData": "2"
}
```

And in the database, we should have the following:

![Database record insertation](image-4.png)


{{<callout note>}}
Before we proceed, let's first understand what just happened above.
{{</callout>}}

When you hit the endpoint `http://localhost:8000/api/v1/` with the data as shown above, the request came via our `index.php`, which checked out routes. We only have one route as follows:-

```php {title="routes.php"}

$router->addGroup('application\Controller')
    ->post('apiV1', 'api_version_one');

```

The above route implies that all post requests to our only controller should be handled by an action(method) named 'apiV1'.

Therefore, in our controller, the following method was executed:

```php {title="Controller.php"}

  public function apiV1(Request $request): BaseResponse
    {
        try {
            return MainApiSwitch::processServices($request);
        } catch (Exception $e) {
            return BaseResponse::JsonResponse(400, $e->getMessage());
        }
    }
```

The above does two things:
 > Maps the whole request to the `MainApiSwitch` class which is our service registry for v1. It helps to map the request to the service mentioned.

 > Catches any exception that might be thrown during the process and returns a 200 OK response with a returnCode of 400.

 > You can also add logic here as you see fit. But we recommend you keep it as clean as possible.

The main api switch checks in the request body for the `SERVICE` and `ACTION` keys. If they are not found, it throws an exception. If they are found, it maps the request to the service and action mentioned basing on the registered services. Therefore, for your service to be discovered, you must register it [as we did here](#step-3-create-the-service---todoservice).

```php {title="MainApiSwitch.php"}
  public function registerServices(): array
    {
        return [
            'user' => new UserService(),
            "todo" => new TodoService(), // this is our service.
        ];
    }
```

So, after here, the service needed is loaded and the entire request in forwarded to it. When the service receives the request, it checks for the action mentioned in the request body. If the action is not found, it throws an exception. If the action is found, it executes the action and returns a response back to the MainApiSwitch which then returns the response to the controller which then returns the response to the kernel that does final processing and returns the response to the client.

- [x] Create or update a to-do item in the database(Completed)

### Step 5: Retrieve all to-do items from the database - 2nd action.

We created our todo from the above step, please first take time to create as many as you want.

Now, let's create an action called `all` in our service to retrieve all to-do items from the database.

```php {title="TodoService.php"}
## ..rest of the service code
public function all() : BaseResponse
  {
      $data = Por::from("todos")->all();
      return BaseResponse::JsonResponse(0, "Todos found.", $data);
  }

## rest of the service code...

```

Now, let's change our JSON in postman to the following:

```json
{
    "SERVICE": "todo",
    "ACTION": "all"
}
```

Send the request and you should get the following response:

```json
{
    "returnCode": 0,
    "returnMessage": "Todos found.",
    "returnData": [
        {
            "id": 1,
            "title": "Pass this ",
            "description": "Must pass this",
            "created_at": "2024-05-26 00:04:17"
        },
        {
            "id": 2,
            "title": "Become an avenger",
            "description": "Make sure you become an avenger at 10!",
            "created_at": "2024-05-26 00:11:23"
        }
    ],
    "extraData": null
}
```


{{<callout context="tip" title="Point To Ponder" icon="outline/pencil">}}

Notice how the `returnData` is an array yet it was an object in the previous response. `returnData` and `extraData` can be of any type, it is up to you to decide what to return in them.

You can also omit the message by setting it to null which should be logical for cases of listing items.

{{</callout>}}

- [x] Retrieve all to-do items from the database(Completed)

### Step 6: Retrieve a single to-do item from the database - 3rd action.

We will create an action called `one` in our service to retrieve a single to-do item from the database.

```php {title="TodoService.php"}
## ..rest of the service code
  /**
   * @throws DatabaseException
   */
  public function one($data) : BaseResponse
  {
      $id = $data['id'];

      $res = Porm::from('todos')
            ->get($id); // or Porm::from('todos')->get(['id' => $id]);

      if ($res) {
          return BaseResponse::JsonResponse(0, null, $data);
      } else {
          throw new DatabaseException("No todo with id $id found.");
      }
  }
## ..rest of the service code
```

Here we are going to test two scenarios, one is where everything goes smoothly and the other is where the server panics(throws an exception).

```json
{
    "SERVICE":"todo",
    "ACTION": "one",
    "id": 2
}
```

```json
{
    "SERVICE": "todo",
    "ACTION": "one",
    "id": 100
}
```

In the first scenario, we get back a status code of 200 OK but with the following response.

```json
{
    "returnCode": 0,
    "returnMessage": null,
    "returnData": {
        "SERVICE": "todo",
        "ACTION": "one",
        "id": 2
    },
    "extraData": null
}
```

But in the second scenario, we still get a status code of 200 OK but with the following response.

```json
{
    "returnCode": 400,
    "returnMessage": "No todo with id 100 found.",
    "returnData": null,
    "extraData": null
}
```

{{<callout context="tip" title="Point To Ponder" icon="outline/pencil">}}
Notice how the exception message becomes our `returnMessage`. This exception was caught by our controller. Therefore, wherever you're in the services, feel free to throw any exceptions with clean messages.
{{</callout>}}

- [x] Retrieve a single to-do item from the database(Completed)

### Step 7: Grab n random to-do item[s] from the database - 7th action.

```php {title="TodoService.php"}

## ..rest of the service code

public function random($data) : BaseResponse
  {
      $length = $data['length'] ?? 1;

      $porm = Porm::from("todos")
          ->random($length);

      return BaseResponse::JsonResponse(0, "Todos found.", $porm);
  }


```

You can keep hitting this action and on each hit, you should get a different to-do item. You can also play with the `length` parameter to get more or less to-do items.

```json
{
    "SERVICE": "todo",
    "ACTION": "random",
    "length": 1
}
```

- [x] Grab n random to-do item[s] from the database(Completed)

### Step 8: Delete a to-do item from the database - 5th action.

If you followed along upto this far, you should be able to implement this on your own. If you get stuck, you can refer to the code below.

```php {title="TodoService.php"}
public function delete($data) : BaseResponse
  {
      $id = $data['id'];
      Porm::from("todos")->delete($id); // you can now hit 'all' to see if this worked,
      // you should notice item with this id disappears.
      return BaseResponse::JsonResponse(0, "Todo deleted.");
  }
```

Change your request object to the following in your client(postman).

  ```json
  {
      "SERVICE": "todo",
      "ACTION": "delete",
      "id": 2
  }
  ```

If you did everything right, you should get your response as follows

```json
{
    "returnCode": 0,
    "returnMessage": "Todo deleted.",
    "returnData": null,
    "extraData": null
}
```

- [x] Delete a to-do item from the database(Completed)

{{<callout context="tip" title="Point To Ponder" icon="outline/pencil">}}

1. All our requests are made via POST method.
2. All our requests have similar body structure, they have a `SERVICE`, `ACTION`, and other param keys.
3. All our responses have the same response format, `returnCode`, `returnMessage`, `returnData`, and `extraData` keys.
4. We are hitting the same endpoint `http://localhost:8000/api/v1/` for all our requests.
5. We did not touch the controller, routes, or the kernel. but we only focused on the service!

This is the beauty of the Moonlight architecture. It makes it easy to understand and maintain your code.

Imagine how fast you would pull off a new service with Pionia.

{{</callout>}}


### Full Service Source Code

{{<details "Details" >}}

```php {title="TodoService.php"}
<?php

namespace application\services;


use Exception;
use Pionia\exceptions\DatabaseException;
use Pionia\request\BaseRestService;
use Pionia\response\BaseResponse;
use Porm\exceptions\BaseDatabaseException;
use Porm\Porm;

class TodoService extends BaseRestService
{
    /**
     * @throws BaseDatabaseException
     * @throws Exception
     */
    public function createOrUpdate($data) : BaseResponse
    {
        $title = $data['title'];
        $description = $data['description'];
        $id = $data['id'] ?? null;

        if (!$id) {
            // here we can create
            $saved = Porm::from("todos")
                ->save([
                    'title' => $title,
                    'description' => $description,
                ]);
        } else {
            // here we can update
            Porm::from("todos")
                ->update([
                    'title' => $title,
                    'description' => $description,
                ], $id);

            $saved = Porm::from("todos")
                ->get($id);
        }
        return BaseResponse::JsonResponse(0, "Todo $saved->title created.", $saved);
    }

    /**
     * @throws BaseDatabaseException
     * @throws Exception
     */
    public function all() : BaseResponse
    {
        $data = Porm::from("todos")
            ->all();
        return BaseResponse::JsonResponse(0, "Todos found.", $data);
    }

    /**
     * @throws Exception
     */
    public function one($data) : BaseResponse
    {
        $id = $data['id'];

        $res = Porm::from('todos')
            ->get($id);

        if ($res) {
            return BaseResponse::JsonResponse(0, null, $data);
        } else {
            throw new DatabaseException("No todo with id $id found.");
        }
    }

    /**
     * @throws BaseDatabaseException
     */
    public function delete($data) : BaseResponse
    {
        $id = $data['id'];
        Porm::from("todos")->delete($id); // you can now hit all to see if this worked,
        // you should notice item with this id disappears.
        return BaseResponse::JsonResponse(0, "Todo deleted.");
    }

    /**
     * @throws Exception
     */
    public function random($data) : BaseResponse
    {
        $length = $data['length'] ?? 1;

        $porm = Porm::from("todos")
            ->random($length);

        return BaseResponse::JsonResponse(0, "Todos found.", $porm);
    }

}
```

{{</details>}}

## Post Tutorial -- What Next?

{{<link-card
  title="Deep Dive into Pionia Requests"
  description="Explore more features about the Pionia Requests and the request cycle."
  href="/documentation/requests/"
>}}
