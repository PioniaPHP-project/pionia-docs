---
title: "Pionia Helpers"
description: "Helpers just provide us shortcuts to accessing rather complex logic"
summary: "Helpers assist in quickly accessing parts of our application without implicitly creating instances."
date: 2024-10-07 19:48:09.318 +0300
lastmod: 2024-10-07 19:48:09.318 +0300
draft: false
weight: 4000
toc: true
seo:
  title: "Pionia Helpers" # custom title (optional)
  description: "Guides on which helpers we have and how to use them in our code cycle" # custom description (recommended)
  noindex: true # false (default) or true
---

# Introduction

Pionia comes with a number of helpers to assist in quickly accessing parts of our application without implicitly creating instances.
These helpers can be accessed anywhere on the app after the app has booted. 

{{<callout context="danger" title="Piont to remember!" icon="outline/note">}}
Please not that most Pionia helpers cannot be accessed in the `bootstrap/application.php` as they might be available yet. This does not affect all the helpers
but those that have to do with the application context like `app`, `container`, `logger`.
{{</callout>}}


### app()
This holds the currently booted `Pionia\Base\PioniaApplication`. It can only be used post application bootup otherwise,
it will boot a new and context-free Pionia application. Unlike in most traditional frameworks, Pionia Application initialises the container. 
Therefore, the container is part of `PioniaApplication` not the other way round.

#### Usage

```php
$env = app()->environment();
echo $env; // dev
```
{{<callout note>}}
Remember this helper can only be used post application booting. Therefore, it cannot be used in the following directories:-
    - bootstrap/application.php
    - bootstrap/routes.php
    - public/index.php

In other places, the application will already be booted making this helper available for use.
{{</callout>}}

### container()

In Pionia, the `PioniaApplication` initialises the container. Pionia uses [`php-di`](https://php-di.org/doc/getting-started.html) for dependency management. This container is tightly coupled with the application 
instance. Therefore, it is also available post application bootup. However, adding things to the container does not depende on this. 
You can access and add content in the Pionia container even before the application boots.

The dependency on the application only depends on this helper's usage.

This helper exposes all [`php-di`](https://php-di.org/doc/getting-started.html) container methods directly to you. It is as if you're interacting with the actual `php-di` itself while using this helper.
#### Usage
```php 
// getting something from the container.
$something  = container()->get('something');

// adding something to the container.
container()->set('something', 'some_value_for_something');

// using it for making factories

$instance = container()->make($name, $parameters);
```

Using the above directly throws some exceptions, that's why you should use methods provided for you on the [app](#app) helper.

### db()
This is an acronym for [table()](#table) helper. It assists one to begin building PiQL(Pionia Query Language) queries. 
By default, this will be using the database connection defined with `default=true` option or the first connection found in the database settings. 

You can also specify which database connection to use here too.

#### Usage

```php 
$users = db('users')->all(); // select * from users;

// defining an explicit db connection

$users = db('users', null, 'db2')->all(); 

// adding the table alias.

$users = db('users', 'u', 'db2')->get(1); // select * from users where id = 1;
```

### table()

This is similar to [db()](#db) but was added for semantic reasons since it is more readable. The implementation is as the same as that if `db()`.

#### Usage

```php 
$users = table('users')->all(); // select * from users;

// defining an explicit db connection

$users = table('users', null, 'db2')->all(); 

// adding the table alias.

$users = table('users', 'u', 'db2')->get(1); // select * from users where id = 1;
```

### alias()

This is used to get any alias added in the application container. It is also equivalent to calling `app()->alias($key)`.

Aliases can be added the application using `app()->addAlias(string $key, mixed $value)`. Then this method can be used to retrieve them.

```php 
// assuming we had added an alias like app()->addAlias('one', 1);
$one = alias('one'); 
```
You can view all the available aliases by running the following command.
```bash
php pionia app:aliases
```

{{<callout note>}}
Since this helper also depends on the application, then it should be used after application booting, while the application is booting, 
you can use `this->addAlias($key, $value)` to add an alias and also get it using `$this->alias($key)` instead.
{{</callout>}}

### logger() 
This provides an interface to the application logger set. It is used for logging. 

#### Usage

```php
logger()->info("Something awesome happened", array());
```

### addIniSection()

This is used to add a new ini section if it was not existing or update it if it does.
By default, this will add the section in the `generated.ini` file to separate it from other existing ini files.
However, you can define which ever file to use using the last parameter of the helper.

If the file does not exist, this helper will also create it and add the section. This file will now henceforth be read and loaded into the context as other config files in our environment configuration.

#### Usage

```php 
$pluginSettings= ['foo' => 'bar', 'name'=>'Jane Doe'];
addIniSection('plugin_settings', $pluginSettings);
```

The above will create the following section in `environment/generated.ini`.

```ini
[plugin_settings]
foo=bar
name=Jane Doe
```

### env()

Get an item from the environment or default to the default value passed. This does not care about which file or file type you're reading from.
As long as it was defined in the environment or somehow loaded in your environment variables no matter the source.

#### Usage
```php
$env = env('APP_ENV', 'dev'); // get the value of APP_ENV from the environment or default to `dev` if it does not exist.
```

### setEnv()
This is similar to calling `app()->setEnv()`. It sets or updates a key-value pair in the environment context.
This is temporary and will be destroyed on the next request cycle. It is only available from the moment it set in the entire app, till the request ends.

#### Usage
```php 
setEnv('new_port', 5000);

// you can then use env to get the value now

$newPort = env('new_port');
```

### tap()
This helper helps you run a value against a given closure and return the value. The return value of the closure is not necessary here.


