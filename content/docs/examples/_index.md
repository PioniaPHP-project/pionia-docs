---
title: "Examples"
description: "Copy-paste DeskFlow API payloads and responses."
summary: "Annotated curl examples for Northwind Studio's task board API."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 50
toc: true
doc_type: reference
seo:
  title: "DeskFlow API examples"
  description: "Sample Moonlight envelopes for ping, tasks, login, and filters."
---

These snippets match the [DeskFlow tutorial](/documentation/getting-started/api-tutorial/). Each links back to the guide that explains the concept — no new ideas here, just copy-paste starting points.

## Ping

```bash
curl -s http://127.0.0.1:8000/api/v1/ping
```

{{< envelope title="Result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "pong",
  "returnData": { "version": "v1" }
}
```
{{< /envelope >}}

## List tasks

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"list"}'
```

{{< envelope title="Result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": {
    "tasks": [
      {
        "id": 1,
        "title": "Review homepage mockups",
        "status": "open",
        "assignee": "alex@northwind.studio"
      }
    ]
  }
}
```
{{< /envelope >}}

Learn how this is built: [API tutorial](/documentation/getting-started/api-tutorial/).

## Create a task

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"create","title":"Ship DeskFlow docs","project_id":1}'
```

Missing `title` returns **HTTP 422** — see [Validation](/documentation/building-api/validation/).

## Member login

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"member","action":"login","email":"alex@northwind.studio","password":"secret"}'
```

Use the returned JWT in `Authorization: Bearer …` for protected actions — [Security](/documentation/security/security-authentication-and-authorization/).

## Filter open tasks

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"task","action":"list","status":"open"}'
```

## Sample settings.ini

```ini
[app_switches]
v1=Application\Switches\MainSwitch

[app]
DEBUG=true
```

Full reference: [Application structure](/documentation/getting-started/application-structure/).
