---
title: "Pionia Shop tutorial"
description: "Build a small online store API — products, customers, orders, and wallet — from zero to deploy."
summary: "15 steps: catalog, checkout, login, wallet payments, and production."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 105
url: /documentation/shop-tutorial/
toc: true
doc_type: tutorial
layout: single
sidebar:
  collapsed: true
aliases:
  - /documentation/deskflow-tutorial/
  - /documentation/getting-started/api-tutorial/
seo:
  title: "Pionia Shop tutorial — learn Pionia hands-on"
  description: "Build Pionia Shop step by step: products, customers, orders, and wallet."
---

## What you are building

**Pionia Shop** is a fictional online store named after the framework. Ada browses mugs and stickers, creates an account, places an order, and pays from her **wallet**. You build the JSON API behind that story — the same patterns you will use for any real commerce backend.

```text
Ada (ada@pionia.shop)
   │
   ▼
Pionia Shop API  ← you build this
   ├── product   … catalog list / create
   ├── customer  … register / login
   ├── order     … place / list
   └── wallet    … balance / topup / pay
```

| Idea | Value |
|------|-------|
| Project folder | `pionia-shop` |
| Sample customer | `ada@pionia.shop` |
| Dev URL | `http://127.0.0.1:8000` |

## Clear models

Every table has one job. Learn these once — the rest of the docs reuse them.

{{< mermaid >}}
erDiagram
  customers ||--o{ orders : places
  customers ||--o| wallets : has
  products ||--o{ order_items : includes
  orders ||--o{ order_items : contains
  wallets ||--o{ wallet_transactions : records

  customers {
    int id
    string email
    string password_hash
  }
  products {
    int id
    string name
    decimal price
    int stock
  }
  orders {
    int id
    int customer_id
    string status
    decimal total
  }
  order_items {
    int id
    int order_id
    int product_id
    int quantity
    decimal unit_price
  }
  wallets {
    int id
    int customer_id
    decimal balance
  }
  wallet_transactions {
    int id
    int wallet_id
    string type
    decimal amount
  }
{{< /mermaid >}}

| Table | Real-world meaning |
|-------|--------------------|
| `products` | What you sell (name, price, stock) |
| `customers` | Who shops (email + password) |
| `orders` | A checkout (“paid”, “pending”) |
| `order_items` | Lines on that checkout |
| `wallets` | Ada’s store credit balance |
| `wallet_transactions` | Top-ups and payments |

| Service | What Ada / the admin call |
|---------|---------------------------|
| `product` | `list`, `get`, `create` |
| `customer` | `register`, `login`, `me` |
| `order` | `place`, `list`, `get` |
| `wallet` | `balance`, `topup` |

## Who this tutorial is for

You learn Pionia **by implementing Pionia Shop** in **15 short steps**. Each step adds one feature to the **same `pionia-shop` repo**.

{{< prerequisites >}}
- [Introduction](/documentation/getting-started/introduction/) — PHP 8.5+, Composer, first ping
- Optional: [PHP basics for Pionia](/documentation/getting-started/php-basics/) if classes and namespaces are new
{{< /prerequisites >}}

## Learning path

| Steps | Theme | What you can do afterward |
|-------|--------|---------------------------|
| 1–4 | Scaffold | Ping the API and list hard-coded products |
| 5–8 | Catalog in the database | Persist products and validate creates |
| 9–11 | Customers & orders | Login with JWT, place orders, defer email-like work |
| 12–13 | Ship it | Optional Vite UI, RoadRunner deploy |
| 14–15 | Extend | Providers; contribute to core (optional) |

## Start here

{{< card-grid >}}
{{< link-card title="Step 1 — Create the project" description="composer create-project → pionia-shop" href="/documentation/shop-tutorial/01-create-project/" >}}
{{< link-card title="Introduction" description="Install notes if you have not pinged yet" href="/documentation/getting-started/introduction/" >}}
{{< /card-grid >}}
