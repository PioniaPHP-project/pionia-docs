---
title: "Step 15 — Contribute to core (optional)"
slug: "15-contribute-to-core"
description: "For people improving Pionia itself — not required to run a shop."
summary: "Clone PioniaCore, run tests, open PRs"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 115
toc: true
doc_type: tutorial
tutorial_step: 15
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/14-app-provider/
aliases:
  - /documentation/deskflow-tutorial/15-contribute-to-core/
seo:
  title: "Pionia Shop tutorial — Step 15"
---

You already have a working **Pionia Shop** app path via `composer create-project`. This step is only if you want to contribute to the framework.

```bash
git clone https://github.com/PioniaPHP-project/PioniaCore.git
cd PioniaCore
composer install
bin/test
```

App developers stay on Packagist `pionia/pionia-app`. Maintainer workflows: [Maintainer notes](/documentation/extending/maintainer-notes/).

## You finished the tutorial

Ada can list products, staff can create catalog rows, customers can log in, and you know where deploy and providers fit. Next ideas: `order.place` + wallet debit, pagination on `product.list`, or a Vite storefront (Step 12).

{{< card-grid >}}
{{< link-card title="Protecting actions" description="Fine-tune #[Can] for checkout." href="/documentation/security/protecting-actions/" >}}
{{< link-card title="Migrations" description="Add orders and wallets tables." href="/documentation/database/migrations/" >}}
{{< link-card title="Examples" description="Copy curl payloads." href="/documentation/examples/" >}}
{{< /card-grid >}}

{{< tutorial-nav >}}
