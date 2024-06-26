---
title: "Versioning in moonlight"
description: "Guides you how the architecture approaches api versioning"
summary: "Moonlight basically has only one controller, one controller action and one endpoint. To get another version of the api, you just need to roll out a new controller action and a new endpoint. This is how moonlight approaches api versioning."
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 800
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

Moonlight basically has only one controller, one controller action and one endpoint. To get another version of the api, you just need to roll out a new controller action and a new endpoint. This is how moonlight approaches api versioning.

Basing on pionia implementation, the architecture has only one controller.

```php

<?php

class Controller extends BaseApiController
{

    /**
     * This is where the only action we need for our controller.
     *
     * It will map all post request targeting /api/v1/ to responsible services.
     *
     * @param Request $request
     * @return BaseResponse
     */
    public function apiV1(Request $request): BaseResponse
    {
        try {
            return MainApiSwitch::processServices($request);
        } catch (Exception $e) {
            return BaseResponse::JsonResponse(400, $e->getMessage());
        }
    }
}

```
