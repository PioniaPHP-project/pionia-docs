---
title: "App Providers"
description: "These are the Pionia mechanisms to extend the framework through external composer packages."
summary: ""
date: 2024-10-28 07:23:58.954 +0300
lastmod: 2024-10-28 07:23:58.954 +0300
draft: false
weight: 6002
toc: true
seo:
  title: "App Providers" # custom title (optional)
  description: "These are the Pionia mechanisms to extend the framework through external composer packages." # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

## Introduction

Pionia allows you to extend the framework through external composer packages. Most of the composer packages are supported by the Pionia framework and can be used out of the box. However, some packages require additional configuration to work with the Pionia framework.

Package that only depend on the framework but do not hook into the framework or register any middlewares, authentications, commands etc shall be called **Pionia Plugins**.

However composer packages that extend the Pionia framework and go ahead to register middlewares, authentications, commands etc or hook into the Application lifecycle shall be called **Pionia Providers**.

## App providers

While building everything in the framework might be possible, it makes the framework bloated and hard to maintain. Therefore, some framework specific logic is abstracted into external packages. These packages are called **App Providers**.

They have access to the application `booted` and `terminating` hooks. They also have access to the container and can register "things" in the container especially in the `booted` hook.

## Creating an App Provider

App providers are essentially supposed to be created in external packages that need to hook into the Pionia application lifecycle. 

A valid app provider should have a class that extends `Pionia\Base\Provider\AppProvider`. There are various methods on this class that help you hook into the application itself.

### 1. middlewares()

This method takes in the `MiddlewareChain` object and allows you to register middlewares to the application. With the middleware chain, you can even register your middlewares before, after or anywhere in the middleware stack.

```php

use Pionia\Base\Provider\AppProvider;

class MyProvider extends AppProvider
{
    public function middlewares(MiddlewareChain $chain): MiddlewareChain
    {
        return $chain->add(YourPackageMiddleware::class);
    }
}

```

It must return the `MiddlewareChain` object after registering the middlewares.
Methods like `add`, `addBefore`, `addAfter` and `addAll` are available on the `MiddlewareChain` object.

This method will be called while the application is bootstrapping its middlewares.

### 2. commands()

This method allows you to register commands to the application. The commands defined here are then merged with the inbuilt commands of the application.

```php

use Pionia\Base\Provider\AppProvider;

class MyProvider extends AppProvider
{
    public function commands(): array
    {
        return [
            'sample_name'=> YourCommand::class
        ];
    }
}

```

{{<callout context="note"  icon="outline/pencil">}}
Remember commands should be registered in an associative array where the key is the command name and the value is the command class. The command name can be anything you want.
It will not be used anywhere in the application but only to identify the command while registering it.
{{</callout>}}

This method will be called while the application is bootstrapping its commands.

### 3. onBooted()

This hook is called when the application is fully booted. This is the best place to register "things" in the container or do any other thing that you want to do after the application is booted.

```php

use Pionia\Base\Provider\AppProvider;

class MyProvider extends AppProvider
{
    public function onBooted(): void
    {
        app()->set('something', function (){
            return 'something';
        });
    }
}
```

This hook will be run after the application is full booted and all the middlewares, routes, commands, aliases etc are registered in the container.

### 4. authentications()

This method allows you to register authentications to the application. The authentications defined here are then merged with the inbuilt authentications of the application.

This method also takes in the `AuthenticationChain` object and allows you to register authentications to the application. With the authentication chain, you can even register your authentications before, after or anywhere in the authentication stack.
```php

use Pionia\Base\Provider\AppProvider;

class MyProvider extends AppProvider
{
    public function authentications(AuthenticationChain $chain): AuthenticationChain
    {
        return $chain->addAuthenticationBackend(YourPackageAuthentication::class);
    }
}
```
This method should be used only by the packages that need to register authentications or provide authentication mechanisms to the application.

Methods like `addAuthenticationBackend`, `addBefore`, `addAfter` and `addAll` are available on the `AuthenticationChain` object.

It must return the `AuthenticationChain` object after registering the authentications.

This method will be called while the application is bootstrapping its authentications.

### 5. onTerminate()

This hook is called when the application is terminating. This is the best place to do any cleanup or any other thing that you want to do before the application is terminated.

```php

use Pionia\Base\Provider\AppProvider;

class MyProvider extends AppProvider
{
    public function onTerminate(): void
    {
        // do something before the application is terminated
    }
}
```

This hook will be run in the terminating phase of the application, this ensure that all app providers are terminated gracefully before calling the `terminated` hook of the application.

### 6. routes()

This method allows you to register routes to the application. The routes defined here are then merged with the inbuilt routes of the application.

This essentially implies that you package introduces new services and switches that are outside the main application but shall be used by the application.

It received the `PioniaRouter` as an argument and allows you to register routes to the application.
```php

use Pionia\Base\Provider\AppProvider;

class MyProvider extends AppProvider
{
    public function routes(PioniaRouter $router): PioniaRouter
    {
        $router->wireTo(MyPackageSwitch:class, 'v2');
        return $router;
    }
}

```

This implies that your package's version 2 switch will be available in the application. 

{{<callout context="danger"  icon="outline/pencil">}}
You might get issues if you define a version string `v2` that is already registered by another package. Therefore, it is advisable to use a unique string that is not likely to be used by another package.
This can be your package name or a unique string that you are sure no other package will use.
{{</callout>}}

With the above methods, you can extend the Pionia framework to do anything you want. You can register middlewares, commands, authentications, routes and do anything you want with the application. 

{{<callout context="tip"  icon="outline/pencil">}}
Remember, you have more hooks and methods available to you in your middlewares, authentications and routes which can help you intercept and do more logic on the request cycle. Make sure to check these out in the related parts of the documentation.
{{</callout>}}

## Registering an App Provider

To register an app provider, you need to add the provider class to the `app_providers` secion in any `.ini` file. 

Since `.ini` files take up `key=value` pairs, you can add a fully qualified class name of the provider to the `app_providers` section with a name of your choice to identify the provider.

```ini
[app_providers]
my_provider=Fully\Qualified\Class\Name\Of\MyProvider
```

If you do not prefer this method, then you can also, register you providers in the `bootstrap/application.php` file.

```php

$app->addAppProvider(MyProvider::class);
```

The last method is more recommended as it is more flexible and you can chain the providers by calling the `addAppProvider` as many times as you see fit.

{{<callout context="danger"  icon="outline/pencil">}}
Remember, very many app providers can make your application slow. Therefore, only add the providers that you need and remove the ones that you do not need.

Pionia caches the app providers, therefore, once you remove a provider, you need to clear the cache to remove the provider from the application by running 
    
```bash
php pionia cache:clear
```
This will unregister the middlewares, commands, authentications, routes and any other thing that the provider had registered in the application.

You can also determine how long these should be cached by setting the `$appItemsCacheTTL` in the `boostrap/application.php` by calling `$app->appItemsCacheTTL=0`.
This is the number of seconds that the app providers will be cached. If you set it to `0`(which is also the default), then the app providers will be cached indefinitely.
{{</callout>}}

