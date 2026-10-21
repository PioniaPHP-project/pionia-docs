---
title: "Moonlight architecture"
slug: "introduction-to-moonlight-architecture"
description: "The Moonlight request model in Pionia v3."
draft: false
seo:
  noindex: true
---

This guide has moved to [Moonlight overview](/documentation/building-api/moonlight-overview/).

Pionia clients send a JSON request to a versioned switch:

```json
{ "service": "product", "action": "list" }
```

The switch resolves the service and action. The response envelope uses `returnCode`, `returnMessage`, `returnData`, and `extraData`.

Continue with the [Pionia Shop tutorial](/documentation/shop-tutorial/) for a working example, or read [Moonlight security](/documentation/building-api/moonlight-security/) for authentication and authorization.
