---
title: "Building your API"
description: "Moonlight architecture, services, actions, validation, and generic CRUD."
summary: "How the { service, action } envelope maps to PHP classes and HTTP responses."
date: 2026-07-01
lastmod: 2026-07-01
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

All business logic in a Pionia app lives in **services** — PHP classes with one method per **action**. Clients POST JSON to `/api/v1/`:

```json
{ "service": "task", "action": "list" }
```

## Start here

| Topic | Page |
|-------|------|
| Architecture overview | [Moonlight overview](/documentation/building-api/moonlight-overview/) |
| Your first service | [Services](/documentation/building-api/services/) |
| Action methods | [Actions](/documentation/building-api/actions/) |
| Input rules | [Validation](/documentation/building-api/validation/) |
| CRUD without boilerplate | [Generic services](/documentation/building-api/generic-services/) |

## DeskFlow services

In the [DeskFlow tutorial](/documentation/getting-started/api-tutorial/) you build:

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
