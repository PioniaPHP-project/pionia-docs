---
title: "Step 7 — Create tasks"
slug: "07-create-tasks"
description: "Add createAction and insert rows with table()->save()."
summary: "task.create persists to SQLite"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 107
toc: true
doc_type: tutorial
tutorial_step: 7
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/06-list-from-database/
tutorial_next: /documentation/deskflow-tutorial/08-validation/
seo:
  title: "DeskFlow tutorial — Step 7"
---

Northwind staff need to **add** tasks, not only list them.

## What you will learn

- Add `createAction` with `table('tasks')->save()`
- Confirm inserts with a second `task.list` call

{{< prerequisites >}}
- [Step 6](/documentation/deskflow-tutorial/06-list-from-database/)
{{< /prerequisites >}}

## Add createAction

In **`services/TaskService.php`**:

```php
use Pionia\Exceptions\ValidationException;

protected function createAction(Arrayable $data): ApiResponse
{
    $title = $data->getString('title');
    if ($title === null || trim($title) === '') {
        throw new ValidationException('title is required');
    }

    $task = table('tasks')->save([
        'title' => trim($title),
        'status' => $data->get('status', 'open'),
        'assignee' => $data->get('assignee', 'alex@northwind.studio'),
    ]);

    return response(0, 'Task created', ['task' => $task]);
}
```

## Create a row

{{< terminal >}}
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"create","title":"Ship DeskFlow tutorial"}'
```
{{< /terminal >}}

Run `task.list` again — your new row appears.

**Milestone:** You now have read + write against SQLite. Step 8 replaces inline checks with declarative validation.

## Common mistakes

- **HTTP 500 instead of 422** when title missing — ensure you throw `ValidationException`, not plain `Exception`.

{{< tutorial-nav >}}
