---
title: "API tutorial — Part 1"
slug: "api-tutorial"
description: "From empty folder to your first working Moonlight action — build DeskFlow step by step."
summary: "Create deskflow-api, explore the scaffold, add TaskService, and call task.list."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 105
toc: true
doc_type: tutorial
seo:
  title: "Build DeskFlow — Part 1"
  description: "Step-by-step: scaffold your app, add TaskService, register it, and POST task.list."
---

## Who this is for

You want to **build a real API**, not copy isolated snippets. This tutorial walks you through **your own project** from the first `composer` command to a working endpoint you can call from curl, Postman, or a frontend.

By the end of the full series you will have **DeskFlow** — a task board API for a fictional agency, Northwind Studio. You can keep that theme or swap the names; the steps are the same.

## What Part 1 delivers

When you finish this page you will have:

- A project folder **you** created (`deskflow-api` or any name you chose)
- A dev server **you** run locally
- **`TaskService`** with a `list` action — the first feature of *your* app
- A curl command that returns **your** JSON payload

Later parts add a database, validation, login, middleware, a React UI, and deploy — all in the **same repo**.

## Tutorial roadmap

| Part | You build | Guide |
|------|-----------|-------|
| **1 (this page)** | Scaffold app + `task.list` | Here |
| 2 | Understand folders & bootstrap | [Application structure](/documentation/getting-started/application-structure/) |
| 3 | SQLite `tasks` table + Porm | [Database getting started](/documentation/database/configuration-getting-started/) |
| 4 | `task.create` with validation | [Validation](/documentation/building-api/validation/) |
| 5 | `member.login` + JWT | [Authentication](/documentation/security/security-authentication-and-authorization/) |
| 6 | Request ID middleware | [Middleware](/documentation/http/middleware/) |
| 7 | React task board | [Vite integration](/documentation/frontend/vite-integration/) |
| 8 | Production deploy | [RoadRunner](/documentation/operations/roadrunner/) |

{{< deskflow >}}
**DeskFlow** — Northwind Studio's internal task board. Services: `task`, `member`, `project`. Sample user: **alex@northwind.studio**.
{{< /deskflow >}}

---

## Step 1 — Create your project

{{< step number="1" time="5 min" >}}
Scaffold a new Pionia app with Composer. Pick any folder name; we use `deskflow-api`.
{{< /step >}}

{{< terminal >}}
```bash
composer create-project pionia/pionia-app deskflow-api
cd deskflow-api
```
{{< /terminal >}}

This downloads the app template, runs `composer install`, and writes `APP_NAME` into `environment/.env` from the folder name.

Open the project in your editor. You should see `services/`, `switches/`, `public/`, and `environment/` — this is **your** app tree. We map every folder in [Part 2](/documentation/getting-started/application-structure/).

---

## Step 2 — Run your API locally

{{< step number="2" time="2 min" >}}
Start the built-in dev server from the project root.
{{< /step >}}

{{< terminal >}}
```bash
php pionia serve
```
{{< /terminal >}}

Default URL: **http://127.0.0.1:8000/** (`PORT` in `environment/.env`).

In a **second terminal**, check that **your** API responds:

{{< terminal >}}
```bash
curl -s http://127.0.0.1:8000/api/v1/ping
```
{{< /terminal >}}

{{< envelope title="Expected result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "pong",
  "returnData": null
}
```
{{< /envelope >}}

With `DEBUG=true`, `returnData` may include your app name and PHP version — that is normal.

---

## Step 3 — See how Moonlight dispatch works

{{< step number="3" time="5 min" >}}
Before adding code, call the **Welcome** service that shipped with your scaffold.
{{< /step >}}

Every Moonlight action uses the same POST shape: `{ "service", "action", ...params }`.

{{< terminal >}}
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"welcome","action":"ping"}'
```
{{< /terminal >}}

{{< envelope title="Expected result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "Welcome to deskflow-api",
  "returnData": { "app": "deskflow-api" }
}
```
{{< /envelope >}}

Now open the files that made this work — **in your repo**:

1. **`services/WelcomeService.php`** — `pingAction()` returns the envelope
2. **`switches/MainSwitch.php`** — maps the alias `welcome` → `WelcomeService`
3. **`environment/settings.ini`** — `[app_switches]` wires `v1` → `MainSwitch`

That is the pattern every feature in DeskFlow will follow: **service class → switch alias → POST body**.

---

## Step 4 — Generate TaskService

{{< step number="4" time="3 min" >}}
Scaffold the first service **you** add to DeskFlow.
{{< /step >}}

{{< terminal >}}
```bash
php pionia make:service Task
```
{{< /terminal >}}

This creates **`services/TaskService.php`**. Open it — you will add your first real business logic there.

---

## Step 5 — Implement `task.list`

{{< step number="5" time="10 min" >}}
Add a `listAction` that returns sample tasks for Northwind Studio. Start with hardcoded data; Part 3 saves to SQLite.
{{< /step >}}

Replace the generated class body with:

```php
<?php

namespace Application\Services;

use Pionia\Collections\Arrayable;
use Pionia\Http\Response\ApiResponse;
use Pionia\Http\Services\Service;

class TaskService extends Service
{
    protected function listAction(Arrayable $data): ApiResponse
    {
        return response(0, 'OK', [
            'tasks' => [
                [
                    'id' => 1,
                    'title' => 'Review homepage mockups',
                    'status' => 'open',
                    'assignee' => 'alex@northwind.studio',
                ],
                [
                    'id' => 2,
                    'title' => 'Prepare sprint retro notes',
                    'status' => 'done',
                    'assignee' => 'alex@northwind.studio',
                ],
                [
                    'id' => 3,
                    'title' => 'Update client project brief',
                    'status' => 'open',
                    'assignee' => 'jamie@northwind.studio',
                ],
            ],
        ]);
    }
}
```

**What you did:** one PHP method → one API action. The method name `listAction` becomes action `"list"` in JSON.

---

## Step 6 — Register `task` on your switch

{{< step number="6" time="3 min" >}}
Tell MainSwitch about your new service.
{{< /step >}}

Edit **`switches/MainSwitch.php`**:

```php
use Application\Services\TaskService;
use Application\Services\WelcomeService;

public static function registerServices(): Arrayable
{
    return arr([
        'welcome' => WelcomeService::class,
        'task' => TaskService::class,
    ]);
}
```

The string `'task'` is the **service alias** clients send in JSON. It does not have to match the class name, but keeping them aligned avoids confusion.

---

## Step 7 — Call your first DeskFlow action

{{< step number="7" time="2 min" >}}
POST to **your** running server and confirm the payload you wrote in Step 5.
{{< /step >}}

{{< try-it >}}
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"list"}'
```
{{< /try-it >}}

{{< envelope title="Expected result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": {
    "tasks": [
      {
        "id": 1,
        "title": "Review homepage mockups",
        "status": "open",
        "assignee": "alex@northwind.studio"
      }
    ]
  }
}
```
{{< /envelope >}}

You now have a working Moonlight API in a project **you** own. The hardcoded list is temporary — Part 3 replaces it with a real `tasks` table.

---

## Checkpoint — what you built

```text
deskflow-api/                 ← your project
├── services/
│   ├── WelcomeService.php    ← shipped with template
│   └── TaskService.php       ← you added (Part 1)
├── switches/
│   └── MainSwitch.php        ← you registered task
└── environment/
    └── settings.ini          ← v1 → MainSwitch
```

| You can now… | Command |
|--------------|---------|
| Health check | `GET /api/v1/ping` |
| Welcome action | `POST` `{ "service":"welcome", "action":"ping" }` |
| **Your task list** | `POST` `{ "service":"task", "action":"list" }` |

Optional: run `php pionia api:docs --ui` and open `/docs` to see Moonlight catalog entries for your actions.

---

## Common mistakes

- **`service not found`** — typo in `MainSwitch` alias, or server not restarted after editing PHP (save file; built-in server picks up changes on next request)
- **Empty / connection refused** — `php pionia serve` not running, or wrong port (use **8000** from `.env`, not 3000)
- **Uppercase keys** — use `"service"` and `"action"`, not `SERVICE` / `ACTION`
- **Editing vendor/** — all **your** code lives under `services/`, `switches/`, etc.; never patch `vendor/pionia/`

---

## What's next

Continue building **the same DeskFlow app**:

1. **[Application structure](/documentation/getting-started/application-structure/)** — what every folder does before you add more files
2. **[Database (Porm)](/documentation/database/configuration-getting-started/)** — create a `tasks` table and load rows from SQLite instead of hardcoded arrays
3. **[Services guide](/documentation/building-api/services/)** — deeper patterns for actions and envelopes

Copy-paste payloads anytime: [Examples](/documentation/examples/).
