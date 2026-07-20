---
title: "Step 4 — Project layout"
slug: "04-project-layout"
description: "Map folders to Pionia Shop features."
summary: "Where products, customers, and settings live"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 104
toc: true
doc_type: tutorial
tutorial_step: 4
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/03-your-first-service/
tutorial_next: /documentation/shop-tutorial/05-database-setup/
aliases:
  - /documentation/deskflow-tutorial/04-project-layout/
seo:
  title: "Pionia Shop tutorial — Step 4"
---

Pause and learn the map — every later step drops files into these folders.

## What you will learn

- Which folder owns catalog code vs config vs migrations

{{< prerequisites >}}
- [Step 3](/documentation/shop-tutorial/03-your-first-service/)
{{< /prerequisites >}}

| Path | You will use it for |
|------|---------------------|
| `services/` | `ProductService`, `CustomerService`, `OrderService`, `WalletService` |
| `switches/` | Register `'product'`, `'customer'`, … |
| `environment/.env` | `APP_NAME`, `JWT_SECRET`, `PORT` |
| `environment/settings.ini` | `[db]`, `[app_switches]`, `[app_authentications]` |
| `database/migrations/` | Step 5 — create `products` |
| `storage/logs/` | Runtime logs when something fails |
| `public/` | Optional storefront UI in Step 12 |

Deep reference: [Application structure](/documentation/getting-started/application-structure/).

## Checkpoint

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"list"}'
```

Still returns the two hard-coded products.

{{< tutorial-nav >}}
