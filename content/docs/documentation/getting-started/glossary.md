---
title: "Glossary"
slug: "glossary"
description: "Shared terms used across Pionia documentation."
summary: "Service, action, switch, envelope, and other Moonlight vocabulary."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 104
toc: true
doc_type: reference
seo:
  title: "Pionia glossary"
  description: "Definitions for Moonlight API terms in Pionia v3."
---

| Term | Meaning |
|------|---------|
| **Action** | A method on a service invoked by name in JSON (`"action": "list"` → `listAction`) |
| **AppRealm** | The booted application container returned by `app()` / `realm()` |
| **DeskFlow** | The canonical docs example — a task board API for Northwind Studio |
| **Envelope** | JSON response shape: `returnCode`, `returnMessage`, `returnData` |
| **GenericService** | Base class that provides CRUD actions for one database table |
| **Moonlight** | Pionia's `{ service, action }` dispatch model over versioned `/api/v1/` |
| **Porm** | Pionia's fluent SQL layer (`table()`, `where()`, joins) — lives in your app |
| **returnCode** | Business outcome in the JSON body (`0` = success); distinct from HTTP status |
| **Service** | PHP class holding business logic; registered on a switch |
| **Switch** | Versioned API entry (e.g. `MainSwitch` for `/api/v1/`) |

## DeskFlow services

| Service | Example action | Purpose |
|---------|----------------|---------|
| `task` | `list`, `create` | Tasks on the team board |
| `member` | `login`, `profile` | Team authentication |
| `project` | `list` | Client projects grouping tasks |

See [Building your API](/documentation/building-api/) for how these connect.
