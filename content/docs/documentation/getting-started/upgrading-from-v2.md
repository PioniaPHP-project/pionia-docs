---
title: "Upgrading from v2"
slug: "upgrading-from-v2"
description: "Migrate PioniaApplication apps to AppRealm and v3 bootstrap."
date: 2026-06-25T00:00:00.000Z
lastmod: 2026-06-25T00:00:00.000Z
draft: false
weight: 115
toc: true
seo:
  noindex: false
---

For a feature overview before migrating, read [Pionia v3 release notes](/documentation/getting-started/changelog-v3/).

## Requirements

- PHP **8.5+**
- `pionia/pionia-core` **^3.0**

## Bootstrap

| v2 | v3 |
|----|-----|
| `new PioniaApplication(BASEPATH)` | `return AppRealm::create(__DIR__)` in `bootstrap/application.php` |
| `(new PioniaRouter())->wireTo(MainSwitch::class)` | `[app_switches]` in `environment/settings.ini` |
| `public/index.php` → `handleRequest()` | `public/index.php` → `bootHttp()` |
| `pionia` → `bootConsole()` | unchanged pattern, new kernel |

**v3 `environment/settings.ini` (switches):**

```ini
[app_switches]
v1=Application\Switches\MainSwitch
```

**v3 `bootstrap/application.php`:**

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Pionia\Realm\AppRealm;

return AppRealm::create(__DIR__);
```

## Switches

`registerServices()` must return `Arrayable` (use `arr([...])`):

```php
public static function registerServices(): Arrayable
{
    return arr(['auth' => AuthService::class]);
}
```

## Static assets

Move `static/` at repo root → `public/static/` (or rely on the framework welcome page).

## Autoload

Prefer a single PSR-4 root:

```json
"Application\\": "./"
```

## CLI (native console)

v3 ships a native console at `Pionia\Console\Application`. Custom and generated commands extend `Pionia\Console\Command`. Input types live under `Pionia\Console\Input\` (`InputArgument`, `InputOption`).

The CLI banner shows the installed **`pionia/pionia-core`** version from Composer (e.g. `v3.0.2-beta`), not a hardcoded framework string.

## HTTP routing (Symfony removed)

v3 replaces Symfony Routing with native classes:

| Removed | Replaced by |
|---------|-------------|
| `symfony/routing` | `RouteTable`, `RouteMatcher`, `RouteDefinition` |
| `symfony/http-kernel` dispatch | `RouteDispatcher` |
| `symfony/http-foundation` | `Pionia\Http\Request`, `Response` |

See [HTTP routing](/documentation/http/http-routing/) for `CompiledRouteMatcher`, bootstrap route cache, and production `php pionia optimize --production`.

## Production optimization (new in v3)

Deploy-time performance is opt-in:

```bash
composer install --no-dev -o
php pionia optimize --production
```

See [Production performance](/documentation/operations/production-performance/).

## Fresh start option

Regenerate and port services:

```bash
composer create-project pionia/pionia-app my-api-v3
# copy services/, switches/, environment/ from the old app
```

See [Application structure](/documentation/getting-started/application-structure/) for the full v3 tree.
