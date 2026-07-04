---
title: "Step 3 — Your first service"
slug: "03-your-first-service"
description: "Add TaskService with task.list and register it on MainSwitch."
summary: "make:service task, listAction, curl task.list"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 103
toc: true
doc_type: tutorial
tutorial_step: 3
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/02-dev-server-and-ping/
tutorial_next: /documentation/deskflow-tutorial/04-project-layout/
seo:
  title: "DeskFlow tutorial — Step 3"
---

You add the first **DeskFlow** feature: list tasks for Northwind Studio.

## What you will learn

- Scaffold `TaskService` with the CLI
- Map `listAction` → `"action": "list"`
- Register the `task` alias on `MainSwitch`

{{< prerequisites >}}
- [Step 2](/documentation/deskflow-tutorial/02-dev-server-and-ping/) — dev server running
{{< /prerequisites >}}

## Generate TaskService

{{< terminal >}}
```bash
php pionia make:service task
```
{{< /terminal >}}

Choose **Basic**. Edit **`services/TaskService.php`**:

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
            ],
        ]);
    }
}
```

## Register on MainSwitch

**`switches/MainSwitch.php`**:

```php
return arr([
    'welcome' => WelcomeService::class,
    'task' => TaskService::class,
]);
```

## Try it

{{< try-it >}}
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"list"}'
```
{{< /try-it >}}

Hardcoded data is intentional — Step 6 moves this to SQLite.

## Common mistakes

- **`service not found`** — typo in alias `'task'` or missing `use TaskService`.
- **Wrong action name** — method is `listAction`, JSON uses `"list"`.

{{< tutorial-nav >}}
