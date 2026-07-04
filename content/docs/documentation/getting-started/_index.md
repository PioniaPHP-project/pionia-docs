---
title: "Getting Started"
description: "Install DeskFlow, learn PHP basics, and follow the multi-part API tutorial."
summary: "Your first hour with Pionia v3 — from Composer install to a working task API."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 100
url: /documentation/getting-started/
toc: true
doc_type: topic
sidebar:
  collapsed: false
seo:
  title: "Getting started with Pionia"
  description: "Introduction, PHP basics, DeskFlow tutorial, and application structure."
---

Welcome to Pionia v3. This section walks you from **zero** to a working **DeskFlow** task board API for Northwind Studio — the same example used throughout the docs.

## First steps

| Step | Guide | Time |
|------|-------|------|
| 1 | [Introduction](/documentation/getting-started/introduction/) — what Pionia is, quick ping | ~10 min |
| 2 | [API tutorial Part 1](/documentation/getting-started/api-tutorial/) — scaffold **your** DeskFlow app + `task.list` | ~30 min |
| 3 | [PHP basics](/documentation/getting-started/php-basics/) — if you are new to PHP | ~20 min |
| 4 | [Application structure](/documentation/getting-started/application-structure/) — map every folder in your repo | ~10 min |

## Pick your path

{{< card-grid >}}
{{< link-card title="Try the tutorial" description="Build DeskFlow hands-on from Part 1." href="/documentation/getting-started/api-tutorial/" >}}
{{< link-card title="Read the guides" description="Understand Moonlight and services first." href="/documentation/building-api/moonlight-overview/" >}}
{{< link-card title="Browse examples" description="Copy-paste curl payloads and JSON envelopes." href="/documentation/examples/" >}}
{{< /card-grid >}}

## Also in this section

- [Why Pionia?](/documentation/getting-started/why-pionia/) — when Moonlight fits your project
- [Glossary](/documentation/getting-started/glossary/) — service, action, switch, envelope
- [Release notes (v3)](/documentation/getting-started/changelog-v3/)
- [Upgrading from v2](/documentation/getting-started/upgrading-from-v2/)

{{< mermaid >}}
flowchart LR
  Intro[Introduction] --> Tutorial[API tutorial]
  Tutorial --> Structure[App structure]
  Structure --> Services[Building your API]
{{< /mermaid >}}
