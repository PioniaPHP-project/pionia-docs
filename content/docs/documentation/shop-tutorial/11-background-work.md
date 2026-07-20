---
title: "Step 11 — Background work"
slug: "11-background-work"
description: "What background work is, why checkout should stay fast, and defer() in Pionia."
summary: "Answer Ada first; finish the email after"
date: 2026-07-01
lastmod: 2026-07-21
draft: false
weight: 111
toc: true
doc_type: tutorial
tutorial_step: 11
tutorial_total: 15
tutorial_prev: /documentation/shop-tutorial/10-middleware/
tutorial_next: /documentation/shop-tutorial/12-frontend/
aliases:
  - /documentation/deskflow-tutorial/11-background-work/
seo:
  title: "Pionia Shop tutorial — Step 11 (Background work)"
---

Ada clicks **Place order**. She should see success in a blink. Sending a “thanks for your order” email, pinging analytics, or resizing an image can wait a second — they should not hold the HTTP response hostage.

## What is background work? (in general)

Most API code is **synchronous**: the client waits until your method finishes.

**Background work** means: finish the important part, send the response, then do the slow leftover tasks.

| Do now (in the request) | Do after (background) |
|-------------------------|------------------------|
| Create the order row | Send confirmation email |
| Debit the wallet | Notify a warehouse Slack channel |
| Return `order_id` | Rebuild a search index |

If email is down for thirty seconds, Ada should still have a placed order — not a spinning browser.

There are levels of “after”:

1. **Same process, after response** — good for quick logs and best-effort mail (`defer()` in Pionia).
2. **Dedicated job queue** — better when work must survive crashes and retries (RoadRunner Jobs, Redis queues, etc.).

This step uses level 1. Level 2 is documented under [Background work](/documentation/operations/background-work/).

## What you will learn

- Call `defer()` after a successful `order.place`
- Know when a real job queue is worth it

{{< prerequisites >}}
- [Step 9](/documentation/shop-tutorial/09-authentication/) — logged-in customer
{{< /prerequisites >}}

## Defer after checkout

Sketch (after you have `OrderService` + order/wallet tables):

```php
#[Authenticated]
protected function placeAction(Arrayable $data): ApiResponse
{
    $orderId = /* create order + items, debit wallet … */;

    defer(function () use ($orderId) {
        logger()->info('Send order confirmation', ['order_id' => $orderId]);
        // call your mail provider later
    });

    return response(0, 'Order placed', ['order_id' => $orderId]);
}
```

`defer()` schedules the closure to run **after** the response is sent (FPM can finish the request to the client first). Ada’s phone already shows success while your log/email runs.

## When to graduate to a queue

Use RoadRunner Jobs (or similar) when:

- The work must **retry** if the mail API fails
- It must not be lost if the PHP worker restarts
- It is heavy (PDF invoices, large imports)

Until then, `defer()` is enough to keep checkout snappy while you learn.

## Common mistakes

- Doing slow I/O before `return response(...)` — Ada waits for no good reason
- Assuming `defer()` is a new thread with infinite time — keep closures short
- Enabling `[jobs]` without a running RoadRunner jobs worker — you get sync fallback + warnings

{{< tutorial-nav >}}
