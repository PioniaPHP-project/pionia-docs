---
title: "Step 8 — Validation"
slug: "08-validation"
description: "Add #[Validated] rules on task.create for HTTP 422 responses."
summary: "Declarative validation on TaskService"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 108
toc: true
doc_type: tutorial
tutorial_step: 8
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/07-create-tasks/
tutorial_next: /documentation/deskflow-tutorial/09-authentication/
seo:
  title: "DeskFlow tutorial — Step 8"
---

Replace inline `if (!$title)` checks with **declarative rules** that run before your action body.

## What you will learn

- Attach `#[Validated]` to `createAction`
- Return **HTTP 422** for bad client input

{{< prerequisites >}}
- [Step 7](/documentation/deskflow-tutorial/07-create-tasks/) — working `createAction`
{{< /prerequisites >}}

## Add attributes

```php
use Pionia\Validations\Attributes\Validated;

#[Validated(rules: [
    'title' => 'required|string|min:3',
    'status' => 'in:open,done,archived',
])]
protected function createAction(Arrayable $data): ApiResponse
{
    $task = table('tasks')->save([
        'title' => $data->getString('title'),
        'status' => $data->getString('status', 'open'),
        'assignee' => $data->getString('assignee', 'alex@northwind.studio'),
    ]);

    return response(0, 'Task created', ['task' => $task]);
}
```

Remove the manual `ValidationException` block from Step 7 — the attribute handles it.

## Test failure

{{< terminal >}}
```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"create","status":"open"}'
```
{{< /terminal >}}

Expect **HTTP 422** and a message about `title`.

Reference: [Validation guide](/documentation/building-api/validation/).

## Common mistakes

- **422 never fires** — typo in attribute namespace or rules string.
- **Validating in both attribute and manual code** — pick one style per action.

{{< tutorial-nav >}}
