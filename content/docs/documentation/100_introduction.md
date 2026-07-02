---
title: "Introduction"
slug: "introduction"
description: "Install Pionia, create a project, boot the API, and ship your first service."
summary: "Installation paths, bootstrap, first API call, and where to go next."
date: 2024-05-24T13:45:48.890Z
lastmod: 2026-07-01
draft: false
weight: 100
toc: true
seo:
  title: "Introduction to Pionia"
  description: "Install Pionia with Composer, scaffold an app, and understand AppRealm bootstrap."
  canonical: ""
  noindex: false
---

{{<picture src="pionia.png" alt="Pionia Logo">}}

## What you are building

Pionia is a PHP API framework centered on **Moonlight**: clients POST JSON like `{ "service": "auth", "action": "login", "email": "…" }` to a versioned URL (`/api/v1/`). Your code lives in **service classes** (`AuthService`, `TodoService`) with one method per **action** (`loginAction`, `listAction`).

You do **not** need Pionia installed globally. You need **PHP 8.5+** and **Composer**.

## Choose how to create a project

{{< tabs "create-new-project" >}}
{{< tab "Composer (recommended)" >}}

Use this on a new laptop — only Composer is required:

```bash
composer create-project pionia/pionia-app my-api
cd my-api
```

`composer create-project` downloads the application template (`pionia/pionia-app`), runs `composer install`, and executes `post-create-project-cmd` (sets `APP_NAME` in `.env` from the folder name).

Start the dev server:

```bash
php pionia serve
# equivalent:
composer run serve
```

Default URL: **http://127.0.0.1:8003/** (port from `environment/.env` → `PORT` or `SERVER_PORT`).

{{</tab>}}
{{< tab "pionia new (second app)" >}}

When you **already** have a Pionia project (or are developing the framework), scaffold another directory from the CLI:

```bash
# from an existing app root (where ./pionia exists):
php pionia new billing-api --install --path=..

# from PioniaCore while hacking the framework:
php example/pionia new billing-api --install --path=..
```

| Flag | Purpose |
|------|---------|
| `--path=/parent/dir` | Where to create the folder (default: current directory) |
| `--vendor=acme` | Composer vendor segment (default: `app`) |
| `--install` | Run `composer install` in the new project |
| `--with-frontend=react-ts` | Scaffold Vite frontend (use with `--install`) |

`pionia new` copies the same stubs as `pionia-app`. It does **not** work on a machine that has never installed Pionia — use `composer create-project` first.

{{</tab>}}
{{</tabs>}}

## Verify the API

With the server running:

```bash
curl -s http://127.0.0.1:8003/api/v1/ping
```

Expected shape (Moonlight envelope):

```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": { "pong": true }
}
```

Dispatch an action:

```bash
curl -s -X POST http://127.0.0.1:8003/api/v1/ \
  -H 'Content-Type: application/json' \
  -d '{"service":"welcome","action":"ping"}'
```

## Project layout (what landed on disk)

| Path | Role |
|------|------|
| `bootstrap/application.php` | `return AppRealm::create(__DIR__)` — builds the DI container (singleton) |
| `environment/settings.ini` | `[app_switches]` maps API versions to switch classes |
| `public/index.php` | Web entry → `bootHttp()` |
| `pionia` | CLI entry → `bootConsole()` (same bootstrap as HTTP) |
| `services/` | Business logic (`*Service` classes, `*Action` methods) |
| `switches/` | API version wiring (`MainSwitch` → `/api/v1/`) |
| `providers/` | Optional service providers (`make:provider`) |
| `environment/` | `.env` + `settings.ini` |
| `storage/` | Logs, cache, uploads |
| `worker.php` + `.rr.yaml` | Optional RoadRunner workers |

Helpers (`app()`, `logger()`, `router()`) are available after `AppRealm::create()` completes — not before `require` of `application.php` returns.

## Bootstrap flow

**HTTP**

```text
public/index.php
  → require bootstrap/application.php
  → AppRealm::create()  (registers [app_switches] from settings.ini)
  → $app->bootHttp()   // or handleRequest() in workers
```

**CLI**

```text
./pionia list
  → require bootstrap/application.php
  → $app->bootConsole()
```

Both paths share the same `AppRealm` singleton (`app()` / `realm()` / `container()` are aliases).

## Your first custom service (5 minutes)

```bash
php pionia make:service Todo
```

Open `services/TodoService.php`, add an action:

```php
protected function listAction(\Pionia\Collections\Arrayable $data): \Pionia\Http\Response\ApiResponse
{
    return response(0, 'OK', ['items' => []]);
}
```

Register the service alias in `switches/MainSwitch.php` inside `registerServices()` if the generator did not already add it:

```php
return arr([
    'welcome' => \Application\Services\WelcomeService::class,
    'todo' => \Application\Services\TodoService::class,
]);
```

Call it:

```bash
curl -s -X POST http://127.0.0.1:8003/api/v1/ \
  -H 'Content-Type: application/json' \
  -d '{"service":"todo","action":"list"}'
```

## CLI without memorizing paths

From the project root:

```bash
php pionia list
php pionia make:service Invoice
php pionia api:docs --ui
composer run serve
composer run pionia -- cache:clear   # passes args after --
```

Commands extend `Pionia\Console\Command` (native console — not third-party CLI libraries). See [Commands](/documentation/commands-pionia-cli/).

## Documentation map

- [API tutorial](/documentation/api-tutorial/) — step-by-step CRUD
- [Application structure](/documentation/application-structure/)
- [Services & actions](/documentation/services/services/)
- [Requests & responses](/documentation/requests-and-responses/)
- [RoadRunner](/documentation/roadrunner/) — persistent workers
- [Extending via providers](/documentation/extending/app-providers/) — packages that hook into boot

## Production behind Nginx

Document root = `public/`:

```nginx
root /var/www/my-api/public;
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

Use PHP-FPM or RoadRunner behind Nginx; see [RoadRunner](/documentation/roadrunner/).

## Upgrading from v2

See [Upgrading from v2](/documentation/upgrading-from-v2/) for `AppRealm`, `ApiSwitch`, and `ApiResponse` renames.
