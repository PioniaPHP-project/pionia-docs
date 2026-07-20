---
title: "Tutorial spine"
draft: true
build:
  render: never
---

# Pionia Shop tutorial spine

Canonical example: **Pionia Shop** — catalog, customers, orders, and wallet.

**Public URL root:** `/documentation/shop-tutorial/`  
**Legacy aliases:** `/documentation/deskflow-tutorial/` (and per-step aliases)

| Step | Slug | Milestone |
|------|------|-----------|
| — | `_index` | Hub + learning path + models |
| 1 | `01-create-project` | `composer create-project` → `pionia-shop` |
| 2 | `02-dev-server-and-ping` | serve + ping + welcome |
| 3 | `03-your-first-service` | hardcoded `product.list` |
| 4 | `04-project-layout` | folder map |
| 5 | `05-database-setup` | `make:table products` + `migrate` |
| 6 | `06-list-from-database` | Porm read products |
| 7 | `07-create-products` | Porm write / `product.create` |
| 8 | `08-validation` | `#[Validated]` on create |
| 9 | `09-authentication` | `customer.login` + JWT + `#[Authenticated]` |
| 10 | `10-middleware` | RequestId |
| 11 | `11-background-work` | `defer()` after order.place |
| 12 | `12-frontend` | Vite React (optional) |
| 13 | `13-deploy` | RoadRunner + optimize |
| 14 | `14-app-provider` | Provider hooks |
| 15 | `15-contribute-to-core` | PioniaCore contributor path |
