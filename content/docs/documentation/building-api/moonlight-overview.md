---
title: "Moonlight overview"
slug: "moonlight-overview"
description: "How Pionia routes { service, action } requests through switches to service classes."
summary: "One versioned endpoint, real HTTP semantics, and a consistent JSON envelope."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 201
toc: true
doc_type: topic
seo:
  title: "Moonlight architecture"
  description: "Switches, services, actions, and the returnCode envelope in Pionia v3."
---

## Who this is for

You understand HTTP APIs but want to know **why** Pionia uses one URL and a `{ service, action }` body instead of dozens of REST routes.

## What you will learn

- How a DeskFlow request travels from curl to `TaskService::listAction`
- The JSON **envelope** every client receives
- When to add a new **switch** for API versioning

## Before you start

{{< prerequisites >}}
- Read [Introduction](/documentation/getting-started/introduction/) and run the ping curl
- Optional: [Glossary](/documentation/getting-started/glossary/) for term definitions
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  Client["curl / SPA"] --> Switch["/api/v1/ MainSwitch"]
  Switch --> Service[TaskService]
  Service --> Action[listAction]
  Action --> Envelope["returnCode + returnData"]
{{< /mermaid >}}

DeskFlow clients POST to **`http://127.0.0.1:8000/api/v1/`** with lowercase keys:

```json
{
  "service": "task",
  "action": "list",
  "status": "open"
}
```

Pionia resolves `task` → `TaskService`, `list` → `listAction()`, and returns:

{{< envelope title="Response" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": { "tasks": [] }
}
```
{{< /envelope >}}

**`returnCode`** is the business outcome (`0` = success). **HTTP status** still matters: validation errors use **422**, auth failures **401**, not-found **404**.

## One endpoint per API version

Each **switch** registers services for a version path:

| URL | Switch class |
|-----|--------------|
| `/api/v1/` | `Application\Switches\MainSwitch` |
| `/api/v2/` | (future) `V2Switch` |

Frontend teams always know the base path; they vary `service` and `action` in the JSON body. See [API versioning](/documentation/building-api/api-versioning/) when Northwind ships breaking changes.

## POST for actions, GET for health checks

Moonlight **actions** use `POST` with a JSON body so payloads never appear in server access logs or browser history.

Health and discovery endpoints still use normal HTTP verbs:

```bash
curl -s http://127.0.0.1:8000/api/v1/ping
```

## Security at the switch

Authentication runs **before** your action method — like checking the driver's ID at the window, not each passenger separately. See [Moonlight security model](/documentation/building-api/moonlight-security/) and [Authentication](/documentation/security/security-authentication-and-authorization/).

## Common mistakes

- Using uppercase `SERVICE` / `ACTION` — v3 expects lowercase `service` / `action`
- Expecting HTTP 200 for every error — check both status code and `returnCode`
- Using port **3000** — default dev port is **8000** (`PORT` in `environment/.env`)

## What's next

{{< card-grid >}}
{{< link-card title="Services" description="Create TaskService and register actions." href="/documentation/building-api/services/" >}}
{{< link-card title="API tutorial" description="Start the DeskFlow tutorial." href="/documentation/deskflow-tutorial/" >}}
{{< link-card title="Requests & responses" description="HTTP status codes and envelopes." href="/documentation/http/requests-and-responses/" >}}
{{< /card-grid >}}
