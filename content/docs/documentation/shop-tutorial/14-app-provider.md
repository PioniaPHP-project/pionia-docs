---
title: "Step 14 — App provider"
slug: "14-app-provider"
description: "What a provider is, why growing apps need one, and ShopProvider hooks."
summary: "One place to wire middleware, auth, and boot-time setup"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 114
toc: true
doc_type: tutorial
tutorial_step: 14
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/13-deploy/
tutorial_next: /documentation/shop-tutorial/15-contribute-to-core/
aliases:
  - /documentation/deskflow-tutorial/14-app-provider/
seo:
  title: "Pionia Shop tutorial — Step 14 (App provider)"
---

Early on, registering middleware in `settings.ini` is fine. As Pionia Shop grows — request IDs, JWT, custom validation rules, package routes — those edits scatter. A **provider** is one PHP class that wires the shop at boot.

## What is a provider? (in general)

Frameworks often split two jobs:

| Job | Lives in | Example |
|-----|----------|---------|
| **Business logic** | Services / actions | `order.place`, `wallet.topup` |
| **Wiring / boot** | Providers (or “service providers”) | “Register this middleware,” “add this auth backend” |

A provider runs when the app starts. It does **not** handle Ada’s checkout click. It prepares the tools your services will use.

Laravel, Symfony, and others use the same idea under slightly different names. In Pionia you extend `Provider` and implement the hooks you need.

## What you will learn

- Why providers exist (boot wiring vs business code)
- Scaffold `ShopProvider`
- Know which hooks matter for the shop

{{< prerequisites >}}
- [Step 10](/documentation/shop-tutorial/10-middleware/) and [Step 9](/documentation/shop-tutorial/09-authentication/) — you have things worth registering
{{< /prerequisites >}}

## Scaffold ShopProvider

{{< terminal >}}
```bash
php pionia make:provider ShopProvider
```
{{< /terminal >}}

Register it under `[app_providers]` in `settings.ini` (the maker usually helps) or via `pionia()->addAppProvider(...)` in bootstrap.

## Useful hooks for Pionia Shop

| Hook | Use it for |
|------|------------|
| `middlewares()` | Request ID, CORS helpers |
| `authentications()` | `JwtAuthentication` |
| `configureValidations()` | Custom rules (“in_stock”, etc.) |
| `configureExceptions()` | Map shop errors to JSON |
| `onBooted()` | Container bindings you need once |

Keep **order math and wallet debit** in services. The provider only **plugs pieces together**.

Full hook list: [App providers](/documentation/extending/app-providers/).

## Common mistakes

- Putting `table('orders')->save(...)` inside a provider — that is request work, not boot work
- Registering the same middleware in both INI and the provider — pick one source of truth
- Forgetting to register the provider class — scaffold alone does not boot it

{{< tutorial-nav >}}
