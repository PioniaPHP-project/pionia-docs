---
title: "Building your API"
description: "Moonlight architecture, services, actions, validation, and generic CRUD."
summary: "How the { service, action } envelope maps to PHP classes and HTTP responses."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 200
url: /documentation/building-api/
toc: true
doc_type: topic
sidebar:
  collapsed: false
seo:
  title: "Building your Pionia API"
  description: "Moonlight overview, services, actions, validation, and API documentation."
---

All business logic in a Pionia app lives in **services** — PHP classes with one method per **action**. DeskFlow clients POST JSON to **`http://127.0.0.1:8000/api/v1/`**:

```json
{ "service": "task", "action": "list" }
```

## Who this is for

You finished [DeskFlow tutorial Step 1](/documentation/deskflow-tutorial/01-create-project/) and want to **design DeskFlow's Moonlight API** — services, actions, validation, and optional generic CRUD for `task`, `member`, and `project`.

## What you will learn

- How `{ "service", "action" }` maps to PHP classes and `*Action` methods
- When to use hand-written services vs [Generic services](/documentation/building-api/generic-services/)
- How to document actions for frontend teams at `/docs`

{{< prerequisites >}}
- [Introduction](/documentation/getting-started/introduction/) — DeskFlow scaffold and ping curl
- [Moonlight overview](/documentation/building-api/moonlight-overview/) — envelope and switch model
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  POST["POST /api/v1/"] --> Switch[MainSwitch]
  Switch --> Task["task → TaskService"]
  Switch --> Member["member → MemberService"]
  Switch --> Project["project → ProjectService"]
  Task --> Action["listAction / createAction"]
{{< /mermaid >}}

## Start here

| Topic | Page |
|-------|------|
| Architecture overview | [Moonlight overview](/documentation/building-api/moonlight-overview/) |
| Your first service | [Services](/documentation/building-api/services/) |
| Action methods | [Actions](/documentation/building-api/actions/) |
| Input rules | [Validation](/documentation/building-api/validation/) |
| CRUD without boilerplate | [Generic services](/documentation/building-api/generic-services/) |

## DeskFlow services

In the [DeskFlow tutorial](/documentation/deskflow-tutorial/) you build:

| Service | Purpose |
|---------|---------|
| `task` | List, create, and assign tasks |
| `member` | Login and team profiles |
| `project` | Group tasks by client project |

## Reference

- [API versioning](/documentation/building-api/api-versioning/) — when Northwind adds `/api/v2/`
- [Moonlight security model](/documentation/building-api/moonlight-security/) — auth at the switch layer
- [Documenting your API](/documentation/building-api/api-reference/) — `@moonlight-*` and OpenAPI

Every response uses the same envelope: `returnCode`, `returnMessage`, `returnData`. See [Requests & responses](/documentation/http/requests-and-responses/).

## Common mistakes

- **Legacy uppercase JSON keys** — Moonlight expects lowercase `service` and `action`.
- **Skipping switch registration** — scaffolding `TaskService` is not enough; add `'task' => TaskService::class` in `MainSwitch::registerServices()`.
- **Using generic services for complex rules** — keep `TaskService` manual when assignee logic grows; use `ProjectService` as generic CRUD first.
- **Wrong dev port** — DeskFlow examples use **8000** (`PORT` in `environment/.env`), not 3000 or 8003.

## What's next

{{< card-grid >}}
{{< link-card title="Services" description="Register task, member, and project." href="/documentation/building-api/services/" >}}
{{< link-card title="API tutorial" description="Continue DeskFlow tutorial hands-on." href="/documentation/deskflow-tutorial/" >}}
{{< link-card title="Validation" description="422 errors when title is missing." href="/documentation/building-api/validation/" >}}
{{< /card-grid >}}
