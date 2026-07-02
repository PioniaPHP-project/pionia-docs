---
title: "Moonlight Architecture"
description: "Guides you through the Moonlight architecture, the powerful architecture for powering highly scaling REST projects."
summary: "This section guides how moonlight removes the unnecessary complexity from APIs and makes it easy to build REST Applications in any language based on the Pionia."
date: 2023-09-07T16:12:37+02:00
lastmod: 2026-07-02T00:00:00.000Z
draft: false
weight: 900
toc: true
sidebar:
  collapsed: false
seo:
  title: "Moonlight Architecture"
  description: "Moonlight single-endpoint API architecture on Pionia."
  canonical: ""
  noindex: false
---

Moonlight is Pionia’s **service / action** API model: one versioned POST endpoint dispatches `{ "service", "action", ...params }` to your service classes.

## Guides in this section

| Topic | Page |
|-------|------|
| Paradigm overview | [Introduction to Moonlight](/moonlight/introduction-to-moonlight-architecture/) |
| Versioning & switches | [API versioning](/moonlight/api-versioning-in-moonlight/) |
| Action-level security | [Security in Moonlight](/moonlight/security-in-moonlight/) |

## Document your API

After you define [services](/documentation/services/) and [actions](/documentation/services/actions/), annotate them with `@moonlight-*` PHPDoc tags (or `#[MoonlightAction]` attributes) and run:

```bash
php pionia api:docs --ui
```

Full guide: **[Documenting your API (Moonlight)](/documentation/api-reference/)** — tag reference, examples, `/docs`, OpenAPI, and CI checks.
