---
title: "Step 11 — Background work"
slug: "11-background-work"
description: "Send assignment email after response with defer()."
summary: "Post-response notification on task.create"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 111
toc: true
doc_type: tutorial
tutorial_step: 11
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/10-middleware/
tutorial_next: /documentation/deskflow-tutorial/12-frontend/
seo:
  title: "DeskFlow tutorial — Step 11"
---

When a task is assigned, DeskFlow should **email Alex after the HTTP response** — not block the API.

## What you will learn

- Use global `defer()` for post-response work
- Log assignment without slowing `task.create`

{{< prerequisites >}}
- [Step 10](/documentation/deskflow-tutorial/10-middleware/)
- `composer require react/promise` if not already in your app (needed for defer/async helpers)
{{< /prerequisites >}}

## defer after create

In `createAction`, after `save()`:

```php
$assignee = $data->get('assignee', 'alex@northwind.studio');

defer(function () use ($assignee, $task) {
    logger()->info('DeskFlow assignment email queued', [
        'assignee' => $assignee,
        'task_id' => $task->id ?? null,
    ]);
});
```

The client gets JSON immediately; logging runs after `send()`.

For durable jobs with RoadRunner, use `async('mail', 'send', …)` — see [Background work](/documentation/operations/background-work/).

## Common mistakes

- **Heavy SMTP inside the action** — always defer or queue email.
- **Expecting defer to run in a new OS thread** — same worker, after response flush.

{{< tutorial-nav >}}
