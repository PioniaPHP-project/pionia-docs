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


