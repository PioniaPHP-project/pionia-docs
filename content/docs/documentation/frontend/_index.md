---
title: "Frontend"
description: "Vite SPA integration with the Moonlight API."
summary: "Scaffold React or Vue, proxy /api in dev, and deploy from public/."
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 600
toc: true
doc_type: topic
sidebar:
  collapsed: true
seo:
  title: "Frontend integration"
  description: "Vite SPA alongside your Pionia API."
---

Pionia ships optional **Vite** scaffolding so DeskFlow can have a React or Vue task board calling `task.list` over the same origin in production.

## Guide

| Page | What you build |
|------|----------------|
| [Vite integration](/documentation/frontend/vite-integration/) | Dev proxy, build to `public/`, SPA fallback |

## Prerequisites

Complete [API tutorial Part 1](/documentation/getting-started/api-tutorial/) so `task.list` returns data before wiring the frontend.

```bash
php pionia frontend:scaffold --framework=react-ts --yes
php pionia serve          # terminal 1 — API on :8000
php pionia frontend:dev   # terminal 2 — Vite on :5173
```
