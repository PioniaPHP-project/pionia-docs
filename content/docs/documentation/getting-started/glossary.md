---
title: "Glossary"
slug: "glossary"
description: "Shared terms used across Pionia documentation."
summary: "Service, action, switch, envelope, and other Moonlight vocabulary."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 104
toc: true
doc_type: reference
seo:
  title: "Pionia glossary"
  description: "Definitions for Moonlight API terms in Pionia v3."
---

## Who this is for

You are reading DeskFlow docs and hit an unfamiliar term — **switch**, **envelope**, **Porm**. Use this page as a quick reference while following the [API tutorial](/documentation/deskflow-tutorial/).

## What you will learn

- Moonlight vocabulary: service, action, switch, envelope
- DeskFlow-specific names: Northwind Studio, `task` / `member` / `project`
- How `returnCode` relates to HTTP status codes

## Before you start

Optional — no setup required. For context, skim [Moonlight overview](/documentation/building-api/moonlight-overview/) first.

## How it works

Pionia docs reuse the same terms everywhere. **DeskFlow** is the canonical example app; when you see `alex@northwind.studio` or port **8000**, that refers to the fictional Northwind Studio team running their local API.

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

Example request Alex sends from the React board:

```json
POST http://127.0.0.1:8000/api/v1/
{ "service": "task", "action": "list", "status": "open" }
```

## Common mistakes

- **Confusing `returnCode` with HTTP status** — `returnCode: 0` can arrive with HTTP 200; errors may use **422** or **401** with a non-zero `returnCode`.
- **Calling it a "route"** — Moonlight uses one POST URL per version; `service` and `action` select the handler.
- **Uppercase JSON keys** — v3 expects lowercase `service` and `action`.

## What's next

{{< card-grid >}}
{{< link-card title="Building your API" description="How terms connect in practice." href="/documentation/building-api/" >}}
{{< link-card title="Moonlight overview" description="Full request flow diagram." href="/documentation/building-api/moonlight-overview/" >}}
{{< link-card title="API tutorial" description="Use the vocabulary hands-on." href="/documentation/deskflow-tutorial/" >}}
{{< /card-grid >}}
