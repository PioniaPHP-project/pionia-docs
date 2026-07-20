---
title: "In-process benchmarking"
slug: "benchmarking"
description: "Measure warm ping and Moonlight dispatch latency with php pionia bench."
summary: "Microbenchmarks inside the PHP process — mean, p50, p95 — without starting an HTTP server."
date: 2026-07-20
lastmod: 2026-07-20
draft: false
weight: 560
toc: true
doc_type: how-to
parent: "operations"
seo:
  title: "Bench command — Pionia"
  description: "Use php pionia bench to microbenchmark Moonlight dispatch and ping in-process."
  noindex: false
---

## Who this is for

You want a **quick feel** for how fast Pionia Shop handles a warm `GET` ping or a Moonlight `dispatch` on your machine — before you reach for load testers or RoadRunner profiling.

## What you will learn

- Run `php pionia bench` (alias `benchmark`)
- Read mean / p50 / p95 and ops/sec
- What this command measures (and what it does not)

## Before you start

{{< prerequisites >}}
- A Pionia Shop (or any Pionia) app with `php pionia` working
- Optional: a service/action you care about (default is `auth` / `list_auth`)
{{< /prerequisites >}}

## How it works

`bench` boots the application **once**, warms the process, then times repeated in-process calls:

1. HTTP-shaped **ping** via `handleRequest` (no TCP server)
2. Moonlight **`dispatch(service, action)`** for the pair you choose

{{< mermaid >}}
flowchart LR
  CLI["php pionia bench"] --> Boot[AppRealm once]
  Boot --> Warm[Warmup iterations]
  Warm --> Ping[Time ping]
  Warm --> ML[Time moonlight dispatch]
  Ping --> Stats[mean / p50 / p95]
  ML --> Stats
{{< /mermaid >}}

{{< callout context="note" title="Not a load test" icon="outline/information-circle" >}}
This is a **microbenchmark** of a warm PHP process. It does not open sockets, exercise nginx/FPM, or simulate concurrent users. For request metrics under real traffic, use [Developer stats](/documentation/operations/developer-stats/) or an external load tool.
{{< /callout >}}

## Run it

```bash
php pionia bench
php pionia bench --iterations=200 --warmup=20
php pionia bench --service=task --action=list --json
```

| Option | Default | Purpose |
|--------|---------|---------|
| `--iterations` | `100` | Timed runs per probe |
| `--warmup` | `10` | Discarded runs before timing |
| `--service` | `auth` | Moonlight service alias |
| `--action` | `list_auth` | Moonlight action name |
| `--json` | off | Machine-readable output |

Example terminal output (numbers vary by machine):

```text
Ping (handleRequest)
  mean  0.42 ms   p50  0.38 ms   p95  0.71 ms   2380 ops/s

Moonlight dispatch (product.list)
  mean  0.85 ms   p50  0.79 ms   p95  1.20 ms   1176 ops/s
```

## When to use it

| Use `bench` when… | Prefer something else when… |
|-------------------|-----------------------------|
| Comparing two code paths on the same laptop | You need concurrent users or HTTP latency |
| Checking that a change did not explode warm dispatch cost | You are tuning SQL — use [Porm performance](/documentation/database/performance/) |
| Capturing a JSON snapshot in CI smoke | You need production OPcache — see [Production performance](/documentation/operations/production-performance/) |

## Common mistakes

- **Treating ops/sec as production capacity** — one warm worker ≠ fleet throughput.
- **Benchmarking a cold first request only** — use enough `--warmup` so OPcache and autoload settle.
- **Pointing at a missing service/action** — register the pair on your switch first, or stick to `auth` / `list_auth` from the template.

## What's next

{{< card-grid >}}
{{< link-card title="Developer stats" description="Request metrics at /stats and stats:view." href="/documentation/operations/developer-stats/" >}}
{{< link-card title="Production performance" description="OPcache preload and optimize --production." href="/documentation/operations/production-performance/" >}}
{{< link-card title="Commands" description="Full CLI registry." href="/documentation/operations/commands/" >}}
{{< /card-grid >}}
