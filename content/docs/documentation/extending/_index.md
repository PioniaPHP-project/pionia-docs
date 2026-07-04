---
title: "Extending Pionia"
description: "Packages, providers, and hooks for framework and application authors."
summary: "How to extend Pionia with Composer packages and service providers."
date: 2024-10-28 07:22:12.958 +0300
lastmod: 2026-07-04 12:00:00.000 +0000
draft: false
weight: 800
url: /documentation/extending/
toc: true
doc_type: topic
seo:
  title: "Extending Pionia"
  description: "Packages and providers for extending Pionia applications."
  canonical: ""
  noindex: false
---

## Who this is for

You are extending DeskFlow beyond inline `Application\` code — publishing a reusable Composer package, registering an **`AppProvider`** for middleware and routes, or looking up global helpers like `response()` and `table()`.

## What you will learn

- The difference between plain **plugins** (libraries) and **providers** (boot hooks)
- Where to register an `AppProvider` in `settings.ini` or `bootstrap/application.php`
- Which guide covers Packagist publishing vs hook reference vs helper index

## Before you start

{{< prerequisites >}}
- Working Pionia app (`composer create-project pionia/pionia-app` or DeskFlow from the [API tutorial](/documentation/deskflow-tutorial/))
- Familiarity with [Services](/documentation/building-api/services/) and `[app_switches]` in `settings.ini`
{{< /prerequisites >}}

## How it works

Most teams extend Pionia in two ways:

1. **Application code** — services, switches, middleware under `Application\` in your repo.
2. **Composer packages** — reusable libraries; some packages also ship a **provider** to register middleware, routes, or commands automatically.

{{< mermaid >}}
flowchart LR
  App[DeskFlow app] --> Code[Application services]
  App --> Pkg[Composer package]
  Pkg --> Plugin[Plain plugin class]
  Pkg --> Prov[Provider subclass]
  Prov --> Boot[middlewares routes commands]
  App --> AP[AppProvider in settings.ini]
  AP --> Boot
{{< /mermaid >}}

| Guide | Audience |
|-------|----------|
| [Composer packages](/documentation/extending/composer-packages/) | Package authors (plugins + providers) |
| [App providers](/documentation/extending/app-providers/) | Provider hook reference and registration |
| [Helpers](/documentation/extending/helpers/) | Global shortcuts (`response()`, `table()`, `logger()`) |
| [Maintainer notes](/documentation/extending/maintainer-notes/) | PioniaCore contributors only |

Start with [Composer packages](/documentation/extending/composer-packages/) if you are publishing to Packagist. Use [App providers](/documentation/extending/app-providers/) when you need the full hook list and boot order.

## Common mistakes

- Putting boot-time wiring in a service action instead of an **`AppProvider`** — helpers like `logger()` are not available before `AppRealm::create()` returns
- Using a generic API version slug (`v2`) in a package `routes()` — collides with the host app's switches
- Forgetting `php pionia cache:clear` after removing a provider from `[app_providers]`
- Requiring RoadRunner or Redis in package `require` instead of `suggest` — breaks minimal installs

## What's next

{{< card-grid >}}
{{< link-card title="Composer packages" description="Ship plugins and providers on Packagist." href="/documentation/extending/composer-packages/" >}}
{{< link-card title="App providers" description="Full hook list and boot order." href="/documentation/extending/app-providers/" >}}
{{< link-card title="Helpers" description="response(), table(), logger(), and more." href="/documentation/extending/helpers/" >}}
{{< /card-grid >}}
