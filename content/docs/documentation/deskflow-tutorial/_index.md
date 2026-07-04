---
title: "DeskFlow tutorial"
description: "Step-by-step: build Northwind Studio's task board API from zero to contributing providers and core."
summary: "15 sequential steps — project scaffold, database, auth, deploy, AppProvider, PioniaCore."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 105
url: /documentation/deskflow-tutorial/
toc: true
doc_type: tutorial
layout: single
sidebar:
  collapsed: true
aliases:
  - /documentation/getting-started/api-tutorial/
seo:
  title: "DeskFlow tutorial — learn Pionia hands-on"
  description: "Build a fictional agency task board API step by step — from composer create-project to framework contribution."
---

## Meet the project we are building

The docs use **one example application** so every curl, service name, and database table tells the same story. You are not memorizing random snippets — you are building a small product.

### Northwind Studio (fictional client)

**Northwind Studio** is a made-up digital agency — think design, web builds, and client retainers. They are not a real company. We use them the same way Django's tutorial uses a fake polls site: a believable setting with names and emails that stay consistent across pages.

| | |
|---|---|
| **Who they are** | A 12-person agency with designers, developers, and account managers |
| **The problem** | Tasks live in spreadsheets; nobody knows who owns what |
| **What we build** | **DeskFlow** — an internal JSON API (and optional React UI) for tasks, projects, and team login |

### DeskFlow (your API)

**DeskFlow** is Northwind's **internal task board backend**. Clients do not call it — Northwind staff do. A project manager lists open tasks, a developer marks work done, and only logged-in members can create or assign items.

```text
Northwind Studio (fictional agency)
        │
        ▼
   DeskFlow API  ← you build this with Pionia
        │
        ├── task    … list, create, assign tasks
        ├── member  … login (alex@northwind.studio)
        └── project … group tasks by client work
```

**Sample person:** Alex Chen, developer — `alex@northwind.studio`  
**Your repo name:** `deskflow-api` (any name works; we keep this in commands)  
**Dev URL:** `http://127.0.0.1:8000`

You can rename characters and tables later. The tutorial teaches **Pionia patterns** (services, switches, Porm, auth) through this one story.

{{< mermaid >}}
flowchart TB
  subgraph northwind [Northwind Studio — fictional]
    Alex[alex@northwind.studio]
    Jamie[jamie@northwind.studio]
  end
  subgraph deskflow [DeskFlow API — you build]
    Task[task.list / task.create]
    Member[member.login]
    Project[project.list]
  end
  Alex -->|POST JSON| Task
  Jamie -->|Bearer JWT| Task
{{< /mermaid >}}

## Who this tutorial is for

You learn Pionia **by implementing DeskFlow** in **15 short steps** on your laptop. Each step adds one feature to the **same `deskflow-api` repository** and links to the next.

Read [Introduction](/documentation/getting-started/introduction/) first if you have not installed PHP 8.5+ or Composer yet.

{{< prerequisites >}}
- [Introduction](/documentation/getting-started/introduction/) — install and first ping
- PHP **8.5+** and [Composer](https://getcomposer.org/)
- ~6–8 hours for all 15 steps (Steps 1–7 ≈ 90 minutes for list + create against SQLite)
{{< /prerequisites >}}

## What you will have when you finish

| Phase | Steps | Outcome |
|-------|-------|---------|
| **Start** | 1–3 | Project on disk, dev server, `task.list` |
| **Understand** | 4 | Map every folder in your repo |
| **Data** | 5–7 | SQLite `tasks` table, list + create |
| **Production habits** | 8–11 | Validation, login, middleware, background jobs |
| **Ship** | 12–13 | Vite UI (optional), RoadRunner deploy |
| **Extend** | 14–15 | AppProvider, contribute to PioniaCore |

## Tutorial steps

Complete these **in order**. Each page assumes the previous step's code is in your repo.

{{< learning-path >}}
{{< learning-path-item label="1 · Create project" href="/documentation/deskflow-tutorial/01-create-project/" >}}
{{< learning-path-item label="2 · Dev server" href="/documentation/deskflow-tutorial/02-dev-server-and-ping/" >}}
{{< learning-path-item label="3 · First service" href="/documentation/deskflow-tutorial/03-your-first-service/" >}}
{{< learning-path-item label="4 · Project layout" href="/documentation/deskflow-tutorial/04-project-layout/" >}}
{{< learning-path-item label="5 · Database setup" href="/documentation/deskflow-tutorial/05-database-setup/" >}}
{{< learning-path-item label="6 · List from DB" href="/documentation/deskflow-tutorial/06-list-from-database/" >}}
{{< learning-path-item label="7 · Create tasks" href="/documentation/deskflow-tutorial/07-create-tasks/" >}}
{{< learning-path-item label="8 · Validation" href="/documentation/deskflow-tutorial/08-validation/" >}}
{{< learning-path-item label="9 · Authentication" href="/documentation/deskflow-tutorial/09-authentication/" >}}
{{< learning-path-item label="10 · Middleware" href="/documentation/deskflow-tutorial/10-middleware/" >}}
{{< learning-path-item label="11 · Background work" href="/documentation/deskflow-tutorial/11-background-work/" >}}
{{< learning-path-item label="12 · Frontend" href="/documentation/deskflow-tutorial/12-frontend/" >}}
{{< learning-path-item label="13 · Deploy" href="/documentation/deskflow-tutorial/13-deploy/" >}}
{{< learning-path-item label="14 · App provider" href="/documentation/deskflow-tutorial/14-app-provider/" >}}
{{< learning-path-item label="15 · Contribute" href="/documentation/deskflow-tutorial/15-contribute-to-core/" >}}
{{< /learning-path >}}

## Start Step 1

{{< card-grid >}}
{{< link-card title="Step 1 — Create project" description="composer create-project and open deskflow-api." href="/documentation/deskflow-tutorial/01-create-project/" >}}
{{< link-card title="Examples" description="Copy-paste curl after Step 3." href="/documentation/examples/" >}}
{{< /card-grid >}}

## Common mistakes

- **Starting here before Introduction** — install PHP and Composer first.
- **Opening Step 8 before Step 7** — validation needs a working `createAction`.
- **Thinking Northwind is a real vendor** — it is fiction; swap names anytime.

## What's next

After Step 15: [Composer packages](/documentation/extending/composer-packages/), [Porm reference](/documentation/database/), [Maintainer notes](/documentation/extending/maintainer-notes/).
