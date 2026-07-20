---
title: "Getting Started"
description: "Install Pionia, learn PHP basics, and meet the Pionia Shop example app."
summary: "Introduction, glossary, then the 15-step Pionia Shop tutorial."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 100
url: /documentation/getting-started/
toc: true
doc_type: topic
sidebar:
  collapsed: false
seo:
  title: "Getting started with Pionia"
  description: "Introduction, PHP basics, and the Pionia Shop example project."
---

Welcome to Pionia v3. Start with **Introduction** (install + meet Pionia Shop), then open the **Pionia Shop tutorial** in the sidebar when you are ready to code.

## The example app (read this first)

Docs do not use random sample names. We build one small store end to end:

- **Pionia Shop** — a fictional online store with products, orders, and a customer wallet
- **ada@pionia.shop** — the sample customer in curl examples
- **pionia-shop** — the project folder name in commands

| Table | Role |
|-------|------|
| `products` | What you sell |
| `customers` | Who shops |
| `orders` / `order_items` | What they bought |
| `wallets` / `wallet_transactions` | Balance and payments |

[Introduction](/documentation/getting-started/introduction/) explains the idea; the [Pionia Shop tutorial](/documentation/shop-tutorial/) walks you through building it in 15 steps.

## First steps

| Order | Guide | Time |
|-------|-------|------|
| 1 | [Introduction](/documentation/getting-started/introduction/) — Pionia, Pionia Shop, install, ping | ~15 min |
| 2 | [PHP basics](/documentation/getting-started/php-basics/) — only if you are new to PHP | ~45 min |
| 3 | [Shop tutorial Step 1](/documentation/shop-tutorial/01-create-project/) — scaffold `pionia-shop` | ~5 min |
| 4 | [Glossary](/documentation/getting-started/glossary/) — service, action, envelope | ~10 min |

## Pick your path

{{< card-grid >}}
{{< link-card title="Introduction" description="Meet Pionia and Pionia Shop; install with Composer." href="/documentation/getting-started/introduction/" >}}
{{< link-card title="Pionia Shop tutorial" description="15 steps — same repo from empty folder to deploy." href="/documentation/shop-tutorial/" >}}
{{< link-card title="Moonlight overview" description="Concepts if you prefer reading before coding." href="/documentation/building-api/moonlight-overview/" >}}
{{< /card-grid >}}

## Also in this section

- [Why Pionia?](/documentation/getting-started/why-pionia/)
- [Application structure](/documentation/getting-started/application-structure/) — reference (also tutorial Step 4)
- [Changelog v3](/documentation/getting-started/changelog-v3/)
- [Upgrading from v2](/documentation/getting-started/upgrading-from-v2/)

## Common mistakes

- **Jumping into Step 1 before Introduction** — install and the shop story live there first.
- **Mixing sample names** — stick to `product` / `customer` / `order` / `wallet` so examples match across pages.

## What's next

{{< card-grid >}}
{{< link-card title="Introduction" description="Start here." href="/documentation/getting-started/introduction/" >}}
{{< link-card title="Pionia Shop tutorial" description="After install." href="/documentation/shop-tutorial/" >}}
{{< /card-grid >}}
