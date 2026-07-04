---
title: "Tutorial spine"
draft: true
build:
  render: never
---

# DeskFlow tutorial spine

Canonical example: **DeskFlow** — task board API for Northwind Studio.

## Learning path

| Part | Page | Milestone |
|------|------|-----------|
| — | Introduction | Scaffold `deskflow-api`, ping |
| 1 | Tutorial Part 1 | `task.list` hardcoded |
| 2 | Tutorial Part 2 | TaskService + MainSwitch |
| 3 | Tutorial Part 3 | SQLite `tasks` table |
| 4 | Tutorial Part 4 | Validation on `task.create` |
| 5 | Tutorial Part 5 | `member.login` + JWT |
| 6 | Tutorial Part 6 | RequestIdMiddleware |
| 7 | Tutorial Part 7 | React task board |
| 8 | Tutorial Part 8 | RoadRunner deploy |

## Page → DeskFlow feature

| Page | Feature demonstrated |
|------|---------------------|
| Services | TaskService registration |
| Actions | `listAction`, `createAction` |
| Validation | Required `title` |
| Database intro | `tasks` schema |
| Security | `member.login` |
| Security utilities | Password hash, tokens |
| Middleware | Request ID header |
| Background work | Email on assign |
| Frontend | Vite + `/api/v1/` proxy |
