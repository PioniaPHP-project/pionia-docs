---
title: "Security in moonlight"
description: "This is the security documentation for MoonLight architecture. It explains how MoonLight powered reap some security benefits."
summary: "All requests sent to the server get encrypted and decrypted on the web server level. This ensures that the data is secure and not exposed in the URL. However, all query params are logged in the web server level, the architecture encourages to perform all requests over POST."
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 2
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

All requests sent to the server over https get encrypted and decrypted on the web server level. This ensures that attacks like man-in-the-middle are mitigated. This applies for all requests sent to the server whether via GET, POST, PUT, DELETE or any other method. On the server level, every request is logged. These logs omit the request body and only log domain, path, query params and headers. This ensures that the data is secure and not exposed in the URL.

We need this logging for debugging purposes, therefore, we might not choose to turn it off.

Example below shows how the logs are stored in the server:

```json {linenos=table}
{
  "domain": "example.com",
  "path": "/api/v1/user",
  "query": {
    "id": "1"
  },
  "headers": {
    "content-type": "application/json"
  }
}
```

This is where we have our first problem that we need to address. The query params are logged in the web server level. This is a security risk.

However much this is is a rare case, imagine logging in via a GET request as below:

```json
  https://example.com/api/v1/login?username=example&password=example
```

The parameters `username` and `password` are logged in the web server level in the raw format. This implies that, however much the passwords are encrypted in the database, they are exposed in the logs. Any malicious user with access to the logs can easily get the password and username.

As a result, the architecture encourages to perform all requests over POST. This is because POST requests' body is not logged in the web server level. This ensures that the data is secure.

This is a supplement to the single endpoit approach of MoonLight architecture.

## HTTP level security - POST Requests only

With the above in mind, the architecture encourages to perform all requests over POST. This is because POST requests' body is not logged in the web server level. This ensures that the data is secure.

Sample moonlight request:

```json
{
  "domain": "example.com",
  "path": "/api/v1/",
  "method": "POST",
  "body": {
    "username": "example",
    "password": "example",
    "action": "login",
    "service": "auth"
  }
}
```

The above request is secure as the body is not logged in the web server level. This removes the only security risk that ssl encryption does not cover.

## Action Level Security

Unlike most architectures, in moonlight, securing actions happens at the action level. This means that requests are let through whether authenticated or not. The action itself determines whether the request is authenticated or not.

If an action say, `addCart` requires a certain permission, the action itself mentions it. Therefore, actions are not protected globally but rather internally(on the method level).

Example below shows how an action can be protected in pionia:

```php

class TodoService extends BaseRestService
{
    // your other actions here

    public function getTodo()
    {
      $this->can('view-todo'); // user must have the permission to view todo
        // your action here
    }
}
```

In the above example, the action `getTodo` requires the user to have the permission `view-todo`. If the user does not have the permission, the action will not be executed.
As observed, the action itself determines whether the request is authenticated or not.
