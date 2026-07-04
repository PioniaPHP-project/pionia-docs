---
title: "Step 4 — Know your project layout"
slug: "04-project-layout"
description: "Map every folder in deskflow-api before adding database and auth."
summary: "bootstrap, services, switches, environment, storage"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 104
toc: true
doc_type: tutorial
tutorial_step: 4
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/03-your-first-service/
tutorial_next: /documentation/deskflow-tutorial/05-database-setup/
seo:
  title: "DeskFlow tutorial — Step 4"
---

Before persistence and auth, orient yourself in the repo you have been editing.

## What you will learn

- Where HTTP enters and how `AppRealm` boots once per process
- Which folders you will touch in Steps 5–15

{{< prerequisites >}}
- [Step 3](/documentation/deskflow-tutorial/03-your-first-service/) — working `task.list`
{{< /prerequisites >}}

## Request path

{{< mermaid >}}
flowchart LR
  HTTP[public/index.php] --> Boot[bootstrap/application.php]
  Boot --> Realm[AppRealm]
  Realm --> Switch[MainSwitch v1]
  Switch --> Task[TaskService]
{{< /mermaid >}}

| Path | You will use it for |
|------|---------------------|
| `bootstrap/application.php` | Boot chain; add providers in Step 14 |
| `environment/settings.ini` | `[db]`, `[app_switches]`, middleware |
| `environment/.env` | `DEBUG`, `PORT`, secrets |
| `services/` | `TaskService`, `MemberService` (Step 9) |
| `switches/` | Register service aliases |
| `middlewares/` | Step 10 — `RequestIdMiddleware` |
| `authentications/` | Step 9 — JWT backend |
| `providers/` | Step 14 — `AppProvider` |
| `database/` | Step 5 — `schema.sql` |
| `storage/logs/` | Runtime logs |
| `public/` | SPA build in Step 12 |

Deep reference: [Application structure](/documentation/getting-started/application-structure/).

## Checkpoint

You should still be able to run:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"list"}'
```

## Common mistakes

- **Creating `routes.php` for API versions** — use `[app_switches]` instead.
- **Putting business logic in `public/index.php`** — keep it in services.

{{< tutorial-nav >}}
