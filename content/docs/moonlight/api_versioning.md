---
title: "API Versioning in Moonlight"
description: "Guides you how the architecture approaches api versioning"
summary: "Moonlight basically has only one controller, one controller action and one endpoint. To get another version of the api, you just need to roll out a new controller action and a new endpoint. This is how moonlight approaches api versioning."
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 3
toc: false
sidebar:
  collapsed: true
seo:
  title: "Security in Moonlight" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

## Introdution

In Moonlight, every switch is directly associated to a version of your api. 
This means that, to get another version of the api, you just need to roll out a new service including only those services
that are going to be available in the new version of the api. This is how moonlight approaches api versioning.

At its core, Moonlight still uses a controller paradigm but this is just one for your entire application.
This controller is used capture all exceptions in your services and return a response to the client.

Below is an example of a switch in Moonlight based on Pionia Framework.
```php 
<?php
namespace application\services;

use Pionia\Core\BaseApiServiceSwitch;
use application\services\UserService;

class VersionOneSwitch extends BaseApiServiceSwitch
{
    /**
     * Register your services here.
     *
     * @return array
     */
    public function registerServices(): array
    {
        return [
            'user' => new UserService(), // this service will be available in version one of the api.
        ];
    }
}
```

For the above switch to be available in the application, you need to register it your app routes.

According to Pionia, the routes.php file is used to register the switches that should be auto-dicovered.
```php
use Pionia\Core\Routing\PioniaRouter;

$router = new PioniaRouter();

/**
* This registers the switch for version one of the api.
* This will be served at /api/v1/
*/
$router->addSwitchFor("application\switches\MainApiSwitch", "v1"); 

```

