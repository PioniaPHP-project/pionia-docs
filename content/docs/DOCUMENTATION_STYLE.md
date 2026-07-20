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

Write for **application developers**. Maintainer-only content (`pionia new`, `example/pionia`, `bin/release`, PioniaCore monorepo paths) belongs in [Maintainer notes](/documentation/extending/maintainer-notes/) only.

## Voice (teach like a guide, not a spec)

Borrow the spirit of Django, Laravel, and Vue docs: **a person learning by building**.

| Prefer | Avoid |
|--------|--------|
| Short shop stories (“Ada lists products, then places an order”) | Dumping every flag before motivation |
| Plain words: logged-in customer, checkout, catalog | Badge / guard / reception / door-sign / office-cop metaphors |
| “You will…” / “Pionia Shop needs…” | “The framework exposes…” as the opening line |
| One idea per section, then a try-it | Exhaustive reference mid-tutorial |

### Do not leak core-contributor context

App-facing pages must not mention PioniaCore monorepo paths, `php example/pionia`, or `bin/release`. Put those in Maintainer notes.

## Pionia Shop (canonical example)

All tutorials and samples use **Pionia Shop** — a small online store + wallet named after the framework.

| Concept | Value |
|---------|-------|
| Project | `pionia-shop` |
| Sample customer | `ada@pionia.shop` |
| Services | `product`, `customer`, `order`, `wallet` |
| Tables | `products`, `customers`, `orders`, `order_items`, `wallets`, `wallet_transactions` |

### Clear models

| Table | Purpose |
|-------|---------|
| `products` | Catalog items (`name`, `price`, `stock`) |
| `customers` | Shoppers (`email`, `password_hash`) |
| `orders` | Checkouts (`customer_id`, `status`, `total`) |
| `order_items` | Lines on an order (`product_id`, `quantity`, `unit_price`) |
| `wallets` | One balance per customer |
| `wallet_transactions` | Top-ups and payments |

| Service | Typical actions |
|---------|-----------------|
| `product` | `list`, `get`, `create` (admin) |
| `customer` | `register`, `login`, `me` |
| `order` | `place`, `list`, `get` |
| `wallet` | `balance`, `topup` |

See [TUTORIAL_SPINE.md](./TUTORIAL_SPINE.md) for the page map.

## Eight phases (every guide page)

1. **Who this is for** — 2–3 sentences; link prerequisites
2. **What you will learn** — concrete outcome
3. **Before you start** — `prerequisites` shortcode
4. **How it works** — Mermaid or simple model when useful
5. **Step-by-step** — `step` + `terminal` shortcodes
6. **Try it yourself** — `try-it` shortcode
7. **Common mistakes** — 3–5 bullets
8. **What's next** — `link-card` or `card-grid`

## Doc types (`doc_type` front matter)

| Value | Use |
|-------|-----|
| `tutorial` | Hands-on Pionia Shop steps |
| `topic` | Concepts (Moonlight, auth) |
| `reference` | Helpers, CLI flags, API reference |
| `how-to` | Single-task recipes |

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
| Pionia Shop / Pionia Shop | Pionia Shop |
| badge / door guard / reception (auth metaphors) | logged-in customer / `#[Authenticated]` |
| `render()` in examples | `renderToString()` |
| `route()` | `router($app)` |

## Shortcodes

| Shortcode | Purpose |
|-----------|---------|
| `prerequisites` | Before you start checklist |
| `step` | Numbered tutorial step |
| `terminal` | Command + expected output |
| `envelope` | Moonlight JSON preview |
| `try-it` | Hands-on checkpoint |
| `learning-path` | Hub stepper |
| `mermaid` | Diagrams |

## Illustrations

- Mermaid for flows and ER diagrams; screenshots under `assets/docs/v3/`
- Use `tabs` for macOS / Linux / Windows install instructions
