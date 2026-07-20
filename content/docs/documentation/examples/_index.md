---
title: "Examples"
description: "Copy-paste Pionia Shop API payloads and responses."
summary: "Annotated curl examples for catalog, login, orders, and wallet."
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 250
url: /documentation/examples/
toc: true
doc_type: reference
seo:
  title: "Pionia Shop API examples"
  description: "Sample Moonlight envelopes for ping, products, login, and orders."
---

These snippets match the [Pionia Shop tutorial](/documentation/shop-tutorial/). Copy them as starting points for the store API on port **8000**.

## Pick your learning path

{{< card-grid >}}
{{< link-card title="Try the tutorial" description="Build the services behind these curls." href="/documentation/shop-tutorial/" >}}
{{< link-card title="Moonlight overview" description="How service and action map to HTTP." href="/documentation/building-api/moonlight-overview/" >}}
{{< /card-grid >}}

## What these examples cover

| Example | Action | Learn more |
|---------|--------|------------|
| Ping | Health check | [Introduction](/documentation/getting-started/introduction/) |
| List products | `product.list` | [Tutorial](/documentation/shop-tutorial/) |
| Create product | `product.create` | [Validation](/documentation/building-api/validation/) |
| Customer login | `customer.login` | [JWT](/documentation/security/jwt-authentication/) |
| Place order | `order.place` | [Protecting actions](/documentation/security/protecting-actions/) |

## Ping

```bash
curl -s http://127.0.0.1:8000/api/v1/ping
```

## List products

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"product","action":"list"}'
```

{{< envelope title="Result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "OK",
  "returnData": {
    "products": [
      { "id": 1, "name": "Ada Mug", "price": 24.5, "stock": 12 }
    ]
  }
}
```
{{< /envelope >}}

## Create product (authenticated)

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service":"product","action":"create","name":"Tote Bag","price":18,"stock":40}'
```

## Customer login

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -d '{"service":"customer","action":"login","email":"ada@pionia.shop","password":"secret"}'
```

{{< envelope title="Result" >}}
```json
{
  "returnCode": 0,
  "returnMessage": "Logged in",
  "returnData": { "token": "eyJhbGciOiJIUzI1NiJ9..." }
}
```
{{< /envelope >}}

## Place order (authenticated)

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service":"order","action":"place","product_id":1,"quantity":2}'
```

## Wallet balance

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service":"wallet","action":"balance"}'
```
