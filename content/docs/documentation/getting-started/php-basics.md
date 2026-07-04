---
title: "PHP basics for Pionia"
slug: "php-basics"
description: "Namespaces, Composer, and reading PHP errors before you build your first API."
summary: "Prerequisites for developers new to PHP who want to follow the DeskFlow tutorial."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 102
toc: true
doc_type: topic
seo:
  title: "PHP basics for Pionia"
  description: "Learn the minimum PHP you need for services, actions, and Composer."
---

## Who this is for

You want to build a Pionia API but have not written much PHP yet. You do **not** need to master the language — just enough to read service classes and run commands in a terminal.

## What you will learn

- How Pionia projects are laid out with **Composer**
- What **namespaces** mean in `Application\Services\TaskService`
- How to read a stack trace when something breaks

## Before you start

{{< prerequisites >}}
- PHP **8.5+** installed (`php -v`)
- [Composer](https://getcomposer.org/) installed (`composer -V`)
- A text editor (VS Code, Cursor, PhpStorm)
{{< /prerequisites >}}

## Namespaces and autoloading

Pionia apps use the `Application\` namespace for your code:

```php
namespace Application\Services;

class TaskService extends \Pionia\Http\Services\Service
{
    // ...
}
```

Composer maps `Application\` → the `services/` folder via autoload rules in `composer.json`. You rarely edit autoload by hand — `make:service` scaffolds files in the right place.

## Reading an error

When DeskFlow fails, check `storage/logs/` or run with `DEBUG=true` in `.env`. A typical error shows:

```text
ValidationException: The title field is required.
  at TaskService.php:42
```

The **file and line** tell you where to look; the message tells you what to fix.

## Common mistakes

- Running commands from the wrong directory — always `cd deskflow-api` first
- Missing PHP extension (e.g. `pdo_sqlite`) — install via your OS package manager
- Typo in namespace after renaming a class — run `composer dump-autoload`

## What's next

Continue to [Introduction](/documentation/getting-started/introduction/) and scaffold DeskFlow with Composer.
