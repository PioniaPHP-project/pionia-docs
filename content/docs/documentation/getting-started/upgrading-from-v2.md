---
title: "Upgrading from v2"
slug: "upgrading-from-v2"
description: "Migrate PioniaApplication apps to AppRealm and v3 bootstrap."
summary: "Bootstrap, switches, routing, and a fresh DeskFlow scaffold option."
date: 2026-06-25T00:00:00.000Z
lastmod: 2026-07-04
draft: false
weight: 115
toc: true
seo:
  noindex: false
---

## Who this is for

You maintain a **v2 Pionia app** (pre-AppRealm) and need a clear path to v3 — or you want to regenerate DeskFlow with `pionia/pionia-app` and port your services.

## What you will learn

- Replacing `PioniaApplication` with `AppRealm::create()`
- Moving switch registration into `[app_switches]` in `settings.ini`
- When a fresh scaffold beats incremental file edits

## Before you start

{{< prerequisites >}}
- PHP **8.5+** installed locally
- [Pionia v3 release notes](/documentation/getting-started/changelog-v3/) for the full feature overview
- Back up `services/`, `switches/`, and `environment/` before changing bootstrap files
{{< /prerequisites >}}

## How it works

v3 separates **framework boot** (`AppRealm`) from **API versioning** (`[app_switches]`). Your DeskFlow services (`task`, `member`, `project`) port mostly unchanged — the wiring around them moves to `settings.ini` and `bootHttp()`.

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
    return arr([
        'task' => TaskService::class,
        'member' => MemberService::class,
        'project' => ProjectService::class,
    ]);
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
composer create-project pionia/pionia-app deskflow-api-v3
# copy services/, switches/, environment/ from the old app
php pionia serve
curl -s http://127.0.0.1:8000/api/v1/ping
```

See [Application structure](/documentation/getting-started/application-structure/) for the full v3 tree.

## Common mistakes

- **Leaving imperative router wiring in bootstrap** — delete `PioniaRouter::wireTo()` calls; use `[app_switches]` only.
- **Returning plain arrays from `registerServices()`** — wrap with `arr([...])` for the `Arrayable` contract.
- **Porting without updating JSON keys** — v3 expects lowercase `service` and `action` in request bodies.
- **Running v3 on PHP 8.4** — upgrade PHP before bumping `pionia/pionia-core` to `^3.0`.

## What's next

{{< card-grid >}}
{{< link-card title="Application structure" description="Full v3 folder map." href="/documentation/getting-started/application-structure/" >}}
{{< link-card title="Release notes (v3)" description="Complete feature changelog." href="/documentation/getting-started/changelog-v3/" >}}
{{< link-card title="API tutorial" description="Rebuild DeskFlow on v3." href="/documentation/deskflow-tutorial/" >}}
{{< /card-grid >}}
