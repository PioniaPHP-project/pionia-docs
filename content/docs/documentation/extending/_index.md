---
title: "Extending Pionia"
description: "Packages, providers, and hooks for framework and application authors."
summary: "How to extend Pionia with Composer packages and service providers."
date: 2024-10-28 07:22:12.958 +0300
lastmod: 2026-07-01 12:00:00.000 +0000
draft: false
weight: 800
toc: true
seo:
  title: "Extending Pionia"
  description: "Packages and providers for extending Pionia applications."
  canonical: ""
  noindex: false
---

## Overview

Most teams extend Pionia in two ways:

1. **Application code** — services, switches, middleware under `Application\` in your repo.
2. **Composer packages** — reusable libraries; some packages also ship a **provider** to register middleware, routes, or commands automatically.

| Guide | Audience |
|-------|----------|
| [Composer packages](/documentation/extending/composer-packages/) | Package authors (plugins + providers) |
| [App providers](/documentation/extending/app-providers/) | Provider hook reference and registration |

Start with [Composer packages](/documentation/extending/composer-packages/) if you are publishing to Packagist. Use [App providers](/documentation/extending/app-providers/) when you need the full hook list and boot order.
