---
title: "Relationships"
description: "Querying relationships using the PORM - Pionia ORM."
summary: "Pionia QueryBuilder supports querying relationships. This is a powerful feature that allows you to query data across multiple tables."
date: 024-06-13 14:32:03.100 +0300
lastmod: 024-06-13 14:32:03.100 +0300
draft: false
weight: 810
toc: true
seo:
  title: "Pionia Porm Relationships." # custom title (optional)
  description: "Querying the database using the PORM - Pionia ORM." # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

{{<callout context="tip"  icon="outline/pencil">}}
This section assumes you have alredy completed configuring the database from the [Configuration Section](/documentation/database/configuration-getting-started).
{{</callout>}}

## Introduction

From v1.0.6 of Porm, you can now query relationships directly. If you're using our generic services, most of this has already been taken care of for you.
However,if you're the kind that loves control or less magic, you can read ahead to see how you can query relationships directly.

## Supported Relationships

Porm supports the following joins:

- Inner Join
- Left Join
- Right Join
- Full Join

## Teleporting to the join verse.

If you haven't noticed it, in Porm, when you call the `filter` method, you teleport to the advanced `filtering` universe. The same way, when you call the `join` method, you teleport to the `join` universe.

Let's start with an example. Imagine we have two tables, `products` and `categories`. The `products` table has a `category_id` column that relates to the `id` column in the `categories` table.

```php {title="Example"}
Porm::from("products")
    ->join()
    ->inner("categories", "products.category_id = categories.id")
    ->all();
```
