---
title: "Pionia Packages(Plugins)"
description: "These are the Pionia mechanisms to extend the framework through external composer packages."
summary: ""
date: 2024-10-28 07:23:58.954 +0300
lastmod: 2024-10-28 07:23:58.954 +0300
draft: false
weight: 6001
toc: true
seo:
  title: "Pionia Package(Plugins)" # custom title (optional)
  description: "These are the Pionia mechanisms to extend the framework through external composer packages." # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

{{<callout context="tip"  icon="outline/pencil">}}
This section assumes you're already familier with the [Pionia Framework](/documentation/introduction/).
It is meant for developers who want to extend the framework to suit their needs.
{{</callout>}}

## Introduction

Whereas the Pionia framework provides a lot of features out of the box, there are times when you may need to extend the framework to suit your needs.
This is where App Providers come in. App Providers are composer packages that extend the Pionia framework. They provide additional features and functionalities that are not available in the core framework.

App Providers are a way to extend the Pionia framework without modifying the core code. This makes it easy to update the framework without losing your customizations.

{{<callout context="note"  icon="outline/pencil">}}
Pionia supports all composer packages but App Providers are specifically designed to extend the Pionia framework. This implies that App Providers can only be used in Pionia applications rather than any other PHP application.
{{</callout>}}

### What is special about App Providers?

App Providers are special because they are designed to work with the Pionia framework. They can hook into the Pionia lifecycle and provide additional features and functionalities to the framework.

App Providers can be used to add new routes, middlewares, authentications, and commands to the Pionia framework. They also have access to the entire PioniaApplication including the container.

### How do App Providers work?

App Providers are composer packages that are installed in the Pionia application. They are registered in the application using `addAppProvider` method in the `bootstrap/application.php` file.
Thay can also be registered in any `.ini` file in the `environments` directory under the `app_providers` key.

```php
// bootstrap/application.php
$app->addAppProvider(App\Providers\MyAppProvider::class);
```
You can chain as many App Providers as you want using the `addAppProvider` method.

```php
// bootstrap/application.php
$app->addAppProvider(Pionia\SamplePackage\SamplePackageProvider::class)
    ->addAppProvider(Pionia\SamplePackage\SamplePackageProvider::class);
```

```ini
; environments/settings.ini
[app_providers]
sample = Pionia\SamplePackage\SamplePackageProvider
```

### Creating a Pionia Package.

Your entire package is still a normal composer package until you add the provider. The provider is what makes your package a Pionia App Provider.

The following steps will guide you on how to create a Pionia App Provider, we shall be creating a simple `SamplePackage` that will add  new route, middleware to the Pionia application.
#### Pre-requisites
i)  composer installed on your machine.

ii) php 8.2 or higher installed on your machine.

#### Step 1: Create a new composer package

Create a new composer package using the following command:

```bash
composer init
```

Make sure to fill in the required details like package name, description, author, etc and mark the package as a `library`.

#### Step 2: Open the package in your favorite code editor

Open the package in your favorite code editor and create a new directory called `src` in the root of the package or any other directory you prefer
that matches the PSR-4 autoloading standard you defined in the `composer.json` file.

#### Step 3: Add Pionia as a dependency

Add Pionia as a dependency in the `composer.json` file.

```json
{
    "require": {
        "pionia/pionia-core": "^2.0"
    }
}
```

{{<callout context="note"  icon="outline/pencil">}}
Please note that, App Providers are introduced in Pionia 2.0.3. Make sure you are using Pionia ^2.0 or higher.
{{</callout>}}

To spice up the package, you can add other dependencies that you may need in your package.
Also, you can make your namespace match the `Pionia` namespace by adding the following to the `composer.json` file.

```json
{
    "autoload": {
        "psr-4": {
            "Pionia\\SamplePackage\\": "src/"
        }
    }
}
```

This ensures that all packages under the Pionia namespace will be grouped together in the `vendor` directory.

{{<callout context="note"  icon="outline/pencil">}}
Please note that your package should/must have a type of `library` in the `composer.json` file.

```json
{
    "type": "library"
}
```
{{</callout>}}

#### Step 4: Create your package class

Create a new class in the `src` directory of your package.

```php {title="src/SamplePackageProvider.php"}

namespace Pionia\SamplePackage;

use Pionia\Base\PioniaApplication;

class SamplePackage
{
    private PioniaApplication $application;

    /**
     * The PioniaApplication instance here shall be auto-injected by the di
     * @param PioniaApplication $application
     */
    public function __construct(PioniaApplication $application)
    {
        $this->application = $application;
    }

    /**
     * Given any string, this method will return its md5 hash
     * @param string $string the string to hash
     * @return string
     */
    public function hash(string $string): string
    {
        return md5($string);
    }

    /**
     * This will help us to get the environment from the Pionia Application itself
     * @return string
     */
    public function environment(): string
    {
        return $this->application->environment();
    }
}
```

With the above class, we have created a php composer package that depends on the PioniaApplication. This class has two methods, `hash` and `environment`.

This class also has a constructor that takes in the `PioniaApplication` instance. This instance is auto-injected by the `php-di` container.

This package cannot be used outside the Pionia framework as it depends on the `PioniaApplication` instance.

{{<callout context="note"  icon="outline/pencil">}}
The pacakge above is not yet an app provider. But it is a Pionia package that can be hosted and used in a Pionia application.

Whereas, this might be all you need, there might be times when your package needs to register middlewares, authentications, routes, etc. This is where the App Provider comes in.
{{</callout>}}

#### Step 5: Create the package middlewares

Create a new directory called `Middlewares` in the `src` directory of your package.

```php {title="src/Middlewares/SamplePacakgeMiddleware.php"}
namespace Pionia\SamplePackage\middlewares;

use Pionia\SamplePackage\SamplePackage;
use Pionia\Http\Request\Request;
use Pionia\Http\Response\Response;
use Pionia\Middlewares\Middleware;

class SamplePackageMiddleware extends Middleware
{

    public function onRequest(Request $request): Request
    {
        $env = app()->getSilently(SamplePackage::class)->environment();
        logger()->info("Logged on Request:- Environment is $env ");
        return $request;
    }

    public function onResponse(Response $response): Response
    {
        $env = app()->getSilently(SamplePackage::class)->environment();
        logger()->info("Logged on Response:- Environment is $env ");
        return $response;
    }

    public function beforeResponse()
    {
        logger()->info("We are running this before entering the the onResponse hook");
    }
}
```

For the above class to qualify as a Pionia Middleware, it must extend the `Pionia\Middlewares\Middleware` class.

Upon extending the `Middleware` class, you must implement the `onRequest` and `onResponse` methods. These methods are called when a request is made and a response is sent respectively.

You can read more about [middlewares here](/documentation/middlewares/).

#### Step 6: Create the package command.

For this simple task, let's create a command that will hash a string.

The command will take up a string and return its md5 hash. We shall register this command in the `app` namespace.

```php {title="src/Commands/HashCommand.php"}
namespace Pionia\SamplePackage\Commands;

use Pionia\SamplePackage\SamplePackage;
use Pionia\Console\BaseCommand;
use Symfony\Component\Console\Input\InputArgument;

class SamplePackageCommand extends BaseCommand
{
    // The command description
    protected string $description = 'Sample command description';
    
    // Register the command in the app namespace
    protected string $name='app:sample-package';

    // The command help
    protected string $help = 'Sample command description, just to test out a sample package targeting Pionia';

    /**
    * The arguments that the command will take
    * @return array
    */
    public function getArguments(): array
    {
        return [
            ['str', InputArgument::REQUIRED, 'Str to hash'],
        ];
    }

    /**
    * The command handler
    * @return int
    */
    public function handle()
    {
        $strToHash = $this->argument('str');
        $hashed = $this->getApp()->getSilently(SamplePackage::class)->hash($strToHash);
        $this->warn("hash of $strToHash is  $hashed");
        return self::SUCCESS;
    }

}
```

For the above class to qualify as a Pionia Command, it must extend the `Pionia\Console\BaseCommand` class.

For more information on commands, you can read more about [commands here](/documentation/commands-pionia-cli/).

{{<callout context="note"  icon="outline/pencil">}}
Since we now have a command and a middleware, we can now create the App Provider that will register these classes and
hook them into the Pionia lifecycle.
{{</callout>}}

{{<callout context="tip"  icon="outline/pencil">}}
If our package was not defining any commands, middlewares, routes, etc and needed not to hook into the Pionia lifecycle, then we would not need to create an App Provider.
We would just ship to composer, and start using it right away in our projects.
{{</callout>}}

#### Step 7: Create the App Provider

Create a new class in the `src` directory of your package.

```php {title="src/SamplePackageProvider.php"}
namespace Pionia\SamplePackage;

use Pionia\SamplePackage\commands\SamplePackageCommand;
use Pionia\SamplePackage\middlewares\SamplePackageMiddleware;
use Pionia\Base\Provider\AppProvider;
use Pionia\Middlewares\MiddlewareChain;

class SamplePackageProvider extends AppProvider
{
   
    /**
     * Register the package commands
     * @return array
     */
    public function commands(): array
    {
        return [
            'sample'=> SamplePackageCommand::class
        ];
    }
    
    /**
     * Register the package middlewares
     * @param MiddlewareChain $middlewareChain
     * @return MiddlewareChain
     */
    public function middlewares(MiddlewareChain $middlewareChain): MiddlewareChain
    {
        return $middlewareChain->add(SamplePackageMiddleware::class);
    }
}
```

For the above class to qualify as a Pionia App Provider, it must extend the `Pionia\Base\Provider\AppProvider` class.

We explain all methods that can be implemented in the AppProvider class in the [AppProvider documentation](/documentation/extending/app-providers/).

Now, our package is ready to be shipped to composer and used in any Pionia application.

#### Step 8: Ship the package

To ship the package, you need to push it to a repository. You can use any repository of your choice like GitHub, GitLab, etc.

You can also submit the package to [packagist](https://packagist.org/) so that it can be installed using composer [using the steps defined here](https://packagist.org/about).

#### Step 9: Install the package in your Pionia application

To install the package in your Pionia application, you need to add it to the `composer.json` file of your Pionia application.

```json
{
    "require": {
        "pionia/sample-package": "^1.0"
    }
}
```

After adding the package to the `composer.json` file, run the following command to install the package.

```bash
composer install
```

#### Step 10: Register the package's provider in your Pionia application.

If you package has a provider, you need to register the provider in the Pionia application. Otherwise, you can start using the package right away.

Register the package's provider in the `bootstrap/application.php` file of your Pionia application.

```php

$app->addAppProvider(Pionia\SamplePackage\SamplePackageProvider::class);
```

You can also register the package's provider in any `.ini` file in the `environments` directory under the `app_providers` key.

```ini
; environments/settings.ini
[app_providers]
sample = Pionia\SamplePackage\SamplePackageProvider
```

#### Step 11: Use the package

Let's confirm that our package works as expected.

```php
php pionia 
```

You should see the `sample-pacakge` command listed among the available commands under the `app` section.

```bash
app
  app:sample-package  Sample command description, just to test out a sample package targeting Pionia
```

You can now run the command as follows:

```bash
php pionia app:sample-package "Hello World"
```

You should see the md5 hash of the string `Hello World` printed on the console.

Also, your middlewares should be incremented since we added a middleware that logs the environment on every request and response.

To make sure that this works too, you can make a request to `/api/v1/` and check the logs in the console.
