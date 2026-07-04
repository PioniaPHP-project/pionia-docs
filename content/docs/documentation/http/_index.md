---
title: "HTTP & middleware"
description: "Requests, responses, middleware, exceptions, routing, and collections."
summary: "How Pionia maps Moonlight envelopes to real HTTP status codes and headers."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 300
url: /documentation/http/
toc: true
doc_type: topic
sidebar:
  collapsed: true
seo:
  title: "HTTP layer in Pionia"
  description: "Requests, middleware, exceptions, routing, and Arrayable collections."
---

The Moonlight API uses one versioned URL, but Pionia still speaks **real HTTP** — status codes, headers, and middleware chains matter for production apps like DeskFlow.

## Guide map

| Topic | Page |
|-------|------|
| Envelopes & status codes | [Requests & responses](/documentation/http/requests-and-responses/) |
| Working with JSON payloads | [Collections](/documentation/http/collections/) |
| Global request pipeline | [Middleware](/documentation/http/middleware/) |
| Errors & validation | [Exceptions](/documentation/http/exceptions/) |
| Static routes & SPA fallback | [HTTP routing](/documentation/http/http-routing/) |

## DeskFlow example

When Alex creates a task without a title, DeskFlow returns **HTTP 422** with `returnCode` in the JSON body — see [Validation](/documentation/building-api/validation/) and [Exceptions](/documentation/http/exceptions/).

Add `RequestIdMiddleware` so support tickets reference a single request ID — covered in [Middleware](/documentation/http/middleware/).
