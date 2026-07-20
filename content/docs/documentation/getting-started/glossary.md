---
title: "Glossary"
slug: "glossary"
description: "Shared terms used across Pionia documentation."
summary: "Service, action, switch, envelope, and Pionia Shop vocabulary."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 104
toc: true
doc_type: reference
seo:
  title: "Pionia glossary"
  description: "Definitions for Moonlight API terms in Pionia v3."
---

## Who this is for

You are reading Pionia Shop docs and hit an unfamiliar term — **switch**, **envelope**, **Porm**. Use this page while following the [tutorial](/documentation/shop-tutorial/).

## Framework terms

| Term | Meaning |
|------|---------|
| **Action** | Method on a service (`"action": "list"` → `listAction`) |
| **AppRealm** | Booted application container (`app()` / `realm()`) |
| **Envelope** | JSON shape: `returnCode`, `returnMessage`, `returnData` |
| **GenericService** | Base class with CRUD actions for one table |
| **Moonlight** | `{ service, action }` dispatch on `/api/v1/` |
| **Porm** | Fluent SQL (`table()`, filters, joins) |
| **returnCode** | Business result (`0` = success); not the same as HTTP status |
| **Service** | PHP class with business logic |
| **Switch** | Versioned API entry (`MainSwitch` → `/api/v1/`) |

## Pionia Shop names

| Name | Meaning |
|------|---------|
| **Pionia Shop** | Canonical example — online store + wallet |
| **ada@pionia.shop** | Sample customer |
| **product** | Catalog service |
| **customer** | Auth / profile service |
| **order** | Checkout service |
| **wallet** | Store credit service |

Example request:

```json
POST http://127.0.0.1:8000/api/v1/
{ "service": "product", "action": "list" }
```

## Common mistakes

- Confusing `returnCode` with HTTP status
- Thinking each action is a separate URL — one POST path per version
- Uppercase JSON keys — use lowercase `service` and `action`

## What's next

{{< card-grid >}}
{{< link-card title="Moonlight overview" description="Full request flow." href="/documentation/building-api/moonlight-overview/" >}}
{{< link-card title="Pionia Shop tutorial" description="Use the vocabulary hands-on." href="/documentation/shop-tutorial/" >}}
{{< /card-grid >}}
