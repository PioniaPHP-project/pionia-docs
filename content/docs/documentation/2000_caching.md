---
title: "Caching in Pionia"
description: "Guides us through the process of caching data in Pionia."
summary: "Pionia requests are all POST however, POST requests are not cached yet some may be getting data, this guides shows us how to cache requests."
date: 2024-10-07 18:34:56.793 +0300
lastmod: 2024-10-07 18:34:56.793 +0300
draft: false
weight: 2000
toc: true
seo:
  title: "Caching in Pionia" # custom title (optional)
  description: "Guides on how to cache data using Pionia Framework." # custom description (recommended)
  noindex: true # false (default) or true
---

# Background.

Caching in Pionia is highly necessary and this guide will help us to understand the "why" and "how".

Pionia uses a single endpoint architecture, this therefore means that all requests come via a single http verb "POST", however,
POST requests are never cached anywhere, that is, on the server or in the browsers. This is attributed to the fact that
traditional browsers and servers have been made in a way that POST requests are only used to `CREATE` resources on the server.

However, Pionia uses `POST` verb for get too! Since all requests are coming through one window(endpoint), we cannot be switching verbs at
that point, <b>at least, this is not supported yet.</b>

## Pionia Caching at a glance!

Pionia caching is not a hard concept. Since the entire caching is just a wrapper on top of the Symfony caching mechanism.
All Caching adaptors supported by symfony are also supported here. By default, `FilesystemAdapter` is active by default.
However, when going to production, however much this might even satisfy your basic needs, we recommend stronger, reliable and faster adaptors
like `Memcached` or `Redis`.
