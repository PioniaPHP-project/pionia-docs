---
title: "Introduction"
slug: "introduction"
description: "Install Pionia, create a project, boot the API, and ship your first service."
summary: "Installation paths, bootstrap, first API call, and where to go next."
date: 2024-05-24T13:45:48.890Z
lastmod: 2026-07-04
draft: false
weight: 101
doc_type: topic
seo:
  title: "Introduction to Pionia"
  description: "Install Pionia with Composer, scaffold an app, and understand AppRealm bootstrap."
  canonical: ""
  noindex: false
---

{{<picture src="pionia.png" alt="Pionia Logo">}}

## Who this is for

You want to **ship a versioned JSON API** with PHP. This page installs Pionia and sends your first ping. The hands-on app we use everywhere is **Pionia Shop** — see [Meet Pionia Shop](#what-you-are-building-pionia-shop) below before you open the tutorial.

## What you will learn

- Two install paths (`composer create-project` vs existing Pionia tree)
- What lands on disk after scaffold (`services/`, `switches/`, `environment/`)
- How `AppRealm` boots for HTTP and CLI from the same bootstrap file

## Before you start

{{< prerequisites >}}
- PHP **8.5+** and [Composer](https://getcomposer.org/)
- Terminal basics (`cd`, `curl`)
- New to PHP? [PHP basics for Pionia](/documentation/getting-started/php-basics/)
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  Composer[composer create-project] --> App[pionia-shop]
  App --> Serve["php pionia serve :8000"]
  Serve --> Ping["GET /api/v1/ping"]
  Ping --> Moonlight["POST product.list"]
{{< /mermaid >}}

## Meet Pionia

Pionia is a PHP 8.5+ framework for **versioned JSON APIs**. Clients POST `{ "service", "action" }` to `/api/v1/`; your business logic lives in plain PHP **service classes**. Optional Vite frontends, RoadRunner workers, and Porm (fluent SQL) grow with you — from a afternoon prototype to production.

## Why Moonlight?

One URL per API version keeps frontends simple and lets you version breaking changes cleanly. Read [Moonlight overview](/documentation/building-api/moonlight-overview/) for the full picture.

## A minimal example {#get-started}

With the server running:

```bash
curl -s http://127.0.0.1:8000/api/v1/ping
```

{{< envelope title="Result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": { "pong": true }
}
```
{{< /envelope >}}

## What you are building: Pionia Shop

Every hands-on page uses the **same small store** so names stay consistent.

**Pionia Shop** is a fictional online store + wallet named after the framework. Ada browses products, logs in, places orders, and pays from her wallet balance.

| Piece | Meaning |
|-------|---------|
| **Pionia Shop** | The product you build in the tutorial |
| **pionia-shop** | Composer project folder name |
| **product** service | Catalog (`product.list`, `product.create`) |
| **customer** service | Register / login (`customer.login`) |
| **order** / **wallet** | Checkout and store credit |
| **ada@pionia.shop** | Sample customer in examples |

Tables: `products`, `customers`, `orders`, `order_items`, `wallets`, `wallet_transactions`. Full walkthrough: [Pionia Shop tutorial](/documentation/shop-tutorial/).

## Installation

{{< tabs "create-new-project" >}}
{{< tab "macOS / Linux" >}}

```bash
composer create-project pionia/pionia-app pionia-shop
cd pionia-shop
php pionia serve
```

{{</tab>}}
{{< tab "Windows" >}}

Install [PHP 8.5+](https://windows.php.net/download/) and [Composer](https://getcomposer.org/download/), then:

```powershell
composer create-project pionia/pionia-app pionia-shop
cd pionia-shop
php pionia serve
```

{{</tab>}}
{{</tabs>}}

Default URL: **http://127.0.0.1:8000/** (`PORT` in `environment/.env`).

## Project layout (what landed on disk)

| Path | Role |
|------|------|
| `bootstrap/application.php` | `return AppRealm::create(__DIR__)` — builds the DI container (singleton) |
| `environment/settings.ini` | `[app_switches]` maps API versions to switch classes |
| `environment/.env` | `APP_NAME`, `JWT_SECRET`, `PORT`, and other secrets |
| `public/index.php` | Web entry → `bootHttp()` |
| `pionia` | CLI entry → `bootConsole()` (same bootstrap as HTTP) |
| `services/` | Business logic (`*Service` classes, `*Action` methods) |
| `switches/` | API version wiring (`MainSwitch` → `/api/v1/`) |
| `database/migrations/` | Schema migrations (`php pionia migrate`) |
| `providers/` | Optional service providers (`make:provider`) |
| `environment/` | `.env` + `settings.ini` |
| `storage/` | Logs, cache, uploads |
| `worker.php` + `.rr.yaml` | Optional RoadRunner workers |

Set `APP_NAME=Pionia Shop` in `.env` so the welcome page and docs title match your store — see [Welcome page and branding](/documentation/http/welcome-page-and-branding/).

{{< callout context="note" title="Workspace Trust" icon="outline/information-circle" >}}
VS Code and JetBrains may ask you to trust the new folder once. Accept so Composer and the PHP language server work normally.
{{< /callout >}}

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
php pionia make:service Product
```

Open `services/ProductService.php`, add an action:

```php
protected function listAction(\Pionia\Collections\Arrayable $data): \Pionia\Http\Response\ApiResponse
{
    return response(0, 'OK', ['tasks' => []]);
}
```

Register the service alias in `switches/MainSwitch.php`:

```php
return arr([
    'welcome' => \Application\Services\WelcomeService::class,
    'task' => \Application\Services\ProductService::class,
]);
```

Call it:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H 'Content-Type: application/json' \
  -d '{"service":"product","action":"list"}'
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

Commands extend `Pionia\Console\Command`. See [Commands](/documentation/operations/commands/).

## Next steps

**API backend only** → [Pionia Shop tutorial Step 1](/documentation/shop-tutorial/01-create-project/) → [Services](/documentation/building-api/services/)

**API + Vite frontend** → [Tutorial](/documentation/shop-tutorial/) → [Vite integration](/documentation/frontend/vite-integration/)

## Documentation map

- [API tutorial](/documentation/shop-tutorial/) — Pionia Shop tutorial
- [Application structure](/documentation/getting-started/application-structure/)
- [Services & actions](/documentation/building-api/services/)
- [Requests & responses](/documentation/http/requests-and-responses/)
- [RoadRunner](/documentation/operations/roadrunner/)
- [Extending via providers](/documentation/extending/app-providers/)

## Production behind Nginx

HTTP/2 and TLS are **infrastructure concerns** — configure them in Nginx (or Caddy), not in Pionia PHP code. Nginx terminates TLS and HTTP/2; Pionia receives plain HTTP on the backend.

### PHP-FPM (traditional)

Document root = `public/`:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/api.example.com-fullchain.pem;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;

    root /var/www/my-api/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_param HTTPS on;
    }
}
```

### RoadRunner (recommended for persistent workers)

Run `php pionia runserver --detach` on an internal port, proxy from Nginx:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/api.example.com-fullchain.pem;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

HTTP/2 multiplexing ends at Nginx; the proxy to RoadRunner uses HTTP/1.1 — no application code changes.

Alternatively, RoadRunner can terminate TLS directly in `.rr.yaml` — see [HTTP/2 and TLS on RoadRunner](/documentation/operations/roadrunner/#http2-and-tls-on-roadrunner).

Related: [RoadRunner](/documentation/operations/roadrunner/) · [Production performance](/documentation/operations/production-performance/).

## What's new in v3

See [Pionia v3 release notes](/documentation/getting-started/changelog-v3/) for the complete changelog.

## Upgrading from v2

See [Upgrading from v2](/documentation/getting-started/upgrading-from-v2/) for `AppRealm`, `ApiSwitch`, and `ApiResponse` renames.

## Common mistakes

- **Running commands outside the project root** — `php pionia serve` must run from `pionia-shop/` where the `pionia` script lives.
- **Using port 3000 or 8003** — Pionia Shop docs default to **8000** via `PORT` in `environment/.env`.
- **Editing vendor/** — business logic belongs in `services/` and `switches/`, never in `vendor/pionia/`.
- **Skipping `[app_switches]` after adding a service** — register aliases in `MainSwitch` or Moonlight returns unknown service errors.

## What's next

{{< card-grid >}}
{{< link-card title="Pionia Shop tutorial" description="Build Pionia Shop product.list hands-on." href="/documentation/shop-tutorial/" >}}
{{< link-card title="Application structure" description="Map every folder in your repo." href="/documentation/getting-started/application-structure/" >}}
{{< link-card title="Services" description="ProductService and MainSwitch registration." href="/documentation/building-api/services/" >}}
{{< /card-grid >}}
