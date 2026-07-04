---
title: "Examples"
description: "Copy-paste DeskFlow API payloads and responses."
summary: "Annotated curl examples for Northwind Studio's task board API."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 250
url: /documentation/examples/
toc: true
doc_type: reference
seo:
  title: "DeskFlow API examples"
  description: "Sample Moonlight envelopes for ping, tasks, login, and filters."
---

These snippets match the [DeskFlow tutorial](/documentation/deskflow-tutorial/). Each section links back to the guide that explains the concept — no new ideas here, just copy-paste starting points for Northwind Studio's task board on port **8000**.

## Pick your learning path

{{< card-grid >}}
{{< link-card title="Try the tutorial" description="Build the services behind these curl calls." href="/documentation/deskflow-tutorial/" >}}
{{< link-card title="Moonlight overview" description="How service and action map to HTTP." href="/documentation/building-api/moonlight-overview/" >}}
{{< link-card title="Documentation hub" description="All topic sections and layer index." href="/documentation/" >}}
{{< /card-grid >}}

## What these examples cover

| Example | DeskFlow action | Learn more |
|---------|-----------------|------------|
| Ping | Health check | [Introduction](/documentation/getting-started/introduction/) |
| List tasks | `task.list` | [API tutorial](/documentation/deskflow-tutorial/) |
| Create task | `task.create` | [Validation](/documentation/building-api/validation/) |
| Member login | `member.login` | [Security](/documentation/security/security-authentication-and-authorization/) |
| Filter open tasks | `task.list` + filter | [Filtering](/documentation/database/queries-with-filtering/) |
| settings.ini | Switch registration | [Application structure](/documentation/getting-started/application-structure/) |

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

Learn how this is built: [API tutorial](/documentation/deskflow-tutorial/).

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

## Common mistakes

- **Running curl before `php pionia serve`** — start the dev server on port **8000** first.
- **Wrong Content-Type** — Moonlight POST dispatch requires `Content-Type: application/json`.
- **Forgetting to register the service** — `task.list` fails until `TaskService` is on `MainSwitch`.
- **Copying v2 uppercase keys** — use lowercase `"service"` and `"action"` in every payload.

## What's next

{{< card-grid >}}
{{< link-card title="Tutorial Step 3" description="Implement task.list in TaskService." href="/documentation/deskflow-tutorial/03-your-first-service/" >}}
{{< link-card title="Services" description="Register DeskFlow services on MainSwitch." href="/documentation/building-api/services/" >}}
{{< link-card title="Resources" description="Packages, CLI cheatsheet, and community links." href="/resources/" >}}
{{< /card-grid >}}
