---
title: "Documentation style guide"
draft: true
build:
  render: never
---

# Pionia documentation style guide

Internal reference for contributors. Not published to the site.

## Audience

Primary reader: someone new to PHP frameworks building their first Pionia API via `composer create-project pionia/pionia-app`.

Maintainer-only content (`pionia new`, `example/pionia`, `bin/release`) belongs in [Maintainer notes](/documentation/extending/maintainer-notes/) only.

## DeskFlow example app

All tutorials and code samples use **DeskFlow** — a task board API for **Northwind Studio**.

| Concept | Value |
|---------|-------|
| Services | `task`, `member`, `project` |
| Sample user | `alex@northwind.studio` |
| Tables | `tasks`, `team_members`, `projects` |

See [TUTORIAL_SPINE.md](./TUTORIAL_SPINE.md) for the page map.

## Eight phases (every guide page)

1. **Who this is for** — 2–3 sentences; link prerequisites
2. **What you will learn** — concrete outcome
3. **Before you start** — `prerequisites` shortcode
4. **How it works** — Mermaid or diagram
5. **Step-by-step** — `step` + `terminal` shortcodes
6. **Try it yourself** — `try-it` shortcode
7. **Common mistakes** — 3–5 bullets
8. **What's next** — `link-card` or `card-grid`

## Doc types (`doc_type` front matter)

| Value | Use |
|-------|-----|
| `tutorial` | Hands-on DeskFlow parts |
| `topic` | Concepts (Moonlight, auth model) |
| `reference` | Helpers, CLI flags, API reference |
| `how-to` | Single-task recipes (deploy, maintenance) |

## Callout syntax (standard)

```markdown
{{< callout context="tip" title="Title" icon="outline/bulb" >}}
Body text.
{{< /callout >}}
```

Contexts: `note`, `tip`, `warning`, `info`.

## Banned terms (except upgrade/maintainer pages)

| Do not use | Use instead |
|------------|-------------|
| `SERVICE`, `ACTION` | `service`, `action` |
| `statusCode` | `returnCode` |
| `PioniaApplication` | `AppRealm` |
| `BaseRestService` | `Service` |
| `Porm::from()` | `table()` / `db()` |
| `127.0.0.1:8000` | `127.0.0.1:8000` |
| `render()` in examples | `renderToString()` |
| `route()` | `router($app)` |

## Shortcodes

| Shortcode | Purpose |
|-----------|---------|
| `prerequisites` | Before you start checklist |
| `step` | Numbered tutorial step |
| `terminal` | Command + expected output |
| `envelope` | Moonlight JSON preview |
| `deskflow` | Chapter continuity banner |
| `try-it` | Hands-on checkpoint |
| `learning-path` | Hub stepper |
| `mermaid` | Diagrams |

## Illustrations

- Mermaid for flows; `figure` / `picture` for screenshots under `assets/docs/v3/`
- Use `tabs` for macOS / Linux / Windows install instructions
