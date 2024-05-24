---
title: "MoonLight Architecture"
description: "This page describes the MoonLight Architecture."
summary: ""
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 800
toc: false
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

MoonLight is a rather new architecture that is based on the commonly used architectures of gRPC, MVC(Model View Controller), Micro-Services and Monolothic. It picks the best of all these architectures and combines them to create a new architecture that is more efficient and scalable.

## The MoonLight paradigm

Below are the new conventions that MoonLight architecture brings to the table:

<!-- add a video showing the same here -->

##### 1. Single API endpoint/route

In the moonlight, all requests target the same endpoint. This is to ensure that the application is scalable and easy to maintain. This also makes it easier to debug and monitor the application.

Assuming the application is running on `http://localhost:3000`, all requests will be made to `http://localhost:3000/api/v1/`. This is the only endpoint that is exposed to the outside world.

On top of other advantages, now frontend devs don't have to worry about the base URL of the API. They can just make requests to the `/api/v1/` endpoint and the application will handle the rest.

##### 2. POST Requests only.

  All requests under moonlight architecture are made using the http method of POST only. This is to ensure that the requests are secure and the data is not exposed in the URL. Also, the application gets to benefit highly from ssl encryption and other security features that are available for POST requests.

##### Single Request Format

  In Moonlight architecture, all requests are made in a similar format. This makes it easier to understand and debug the requests. Requests can either be be of type JSON or form-data.

  Every request must define the `SERVICE` and `ACTION` to exacute in the request body plus the rest rest of the payload as required by the service.

  ```json {title="POST http://localhost:3000/api/v1/", hl_lines=[2,3]}
  {
      "SERVICE": "users",
      "ACTION": "get_user_by_profile",
      "profile": "@1233232"
  }
  ```

{{<callout note>}}
  The `SERVICE` and `ACTION` are required in every request. The rest of the payload is dependent on the service and action being executed.
{{</callout>}}

{{<callout context="tip" title="Point To Ponder!" icon="outline/book">}}
  This architecture, if to be well implemented must follow the Object Oriented Programming paradigm.
  With this, `services` should/must be classes or interfaces(golang) that combine together related business logic like `AuthenticationService`, `ProductService`, `OrderService` etc.

  And Actions should be methods in these classes like `login`, `register` in the `AuthenticationService` class.
{{</callout>}}

## Single Response Format

  This architecture also calls for a single response format. This makes it way easier to understand and debug the responses. The response format is as follows:

  ```json {title="Response", hl_lines=[2,3]}
  {
      "statusCode": 0,
      "returnMessage": "Some cool message here or null",
      "returnData": "the data you're sending to the frontend",
      "extraData": "any extra data you want to send to the frontend"
  }
```

{{<callout context="note" title="Point To Ponder!" icon="outline/book" >}}
All requests in this architecture that reach the application server should/must return an http status of 200 OK. Failure to reach the server implies the server is off which calls for a 502 Bad Geteway.
{{</callout >}}

With `statusCode`, it implies that the developer/business can define their own custom status codes. However, by convention, a status code of `0` implies success and is recommended to be kept for the same.
