---
title: "Step 6 — List tasks from the database"
slug: "06-list-from-database"
description: "Replace hardcoded tasks with table('tasks')->all()."
summary: "Porm read in listAction"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 106
toc: true
doc_type: tutorial
tutorial_step: 6
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/05-database-setup/
tutorial_next: /documentation/deskflow-tutorial/07-create-tasks/
seo:
  title: "DeskFlow tutorial — Step 6"
---

Wire `listAction` to the **`tasks`** table you seeded in Step 5.

## What you will learn

- Read rows with global helper `table()`
- Return ORM results inside a Moonlight envelope

{{< prerequisites >}}
- [Step 5](/documentation/deskflow-tutorial/05-database-setup/) — `database.sqlite3` exists
{{< /prerequisites >}}

## Update TaskService

**`services/TaskService.php`**:

```php
protected function listAction(Arrayable $data): ApiResponse
{
    $tasks = table('tasks')->all();
    return response(0, 'OK', ['tasks' => $tasks]);
}
```

## Verify

{{< try-it >}}
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"list"}'
```
{{< /try-it >}}

You should see **three** tasks from `schema.sql` (including Jamie's brief).

More query patterns: [Making queries](/documentation/database/making-queries/).

## Common mistakes

- **Still seeing only one hardcoded task** — save the file; confirm you removed the PHP array.
- **Empty list after re-init** — re-run `php bin/init-db.php` if you deleted the SQLite file.

{{< tutorial-nav >}}
