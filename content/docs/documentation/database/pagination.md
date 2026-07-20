---
title: "Pagination"
description: "PaginationCore and list pagination from API requests."
summary: "limit, offset, total count, and GenericService integration."
date: 2026-03-01
lastmod: 2026-07-01
draft: false
weight: 817
toc: true
doc_type: topic
parent: "database"
seo:
  title: "Porm pagination"
  description: "Paginate Porm queries with PaginationCore."
  canonical: ""
  noindex: false
---

This guide covers paginated **Pionia Shop** catalogs — `product.list` with `limit` and `offset` from Moonlight POST bodies on port **8000**. Use `PaginationCore` so Ada’s client gets `total_count`, `has_next`, and stable page metadata.

## What you will learn

- Construct `PaginationCore` for `products` and joined lists
- Read limit/offset from API request payloads
- Enable approximate totals and GenericService caps for large catalogs

{{< prerequisites >}}
- [Filtering](/documentation/database/queries-with-filtering/) — `orderBy`, `limit`, and `startAt`
- [Making queries](/documentation/database/making-queries/) — `all()` and Builder basics
{{< /prerequisites >}}

## How it works

{{< mermaid >}}
flowchart LR
  Req["POST limit/offset"] --> PC[PaginationCore]
  PC --> Count["count() on builder"]
  PC --> Page["limit + startAt → all()"]
  Count --> Meta["total_count, has_next"]
  Page --> Results[results array]
{{< /mermaid >}}

## PaginationCore

`Pionia\Porm\PaginationCore` coordinates **limit**, **offset**, total **count**, and next/prev metadata for list endpoints.

```php
use Pionia\Porm\PaginationCore;

$req = ['limit' => 10, 'offset' => 0];

$pagination = new PaginationCore(
    reqData: $req,
    table: 'products',
    limit: 10,
    offset: 0,
    db: null,       // connection name or null for default
    alias: null,    // table alias
);

$page = $pagination
    ->columns(['id', 'name', 'price', 'stock'])
    ->where(['stock[>]' => 0])
    ->init(fn ($q) => $q->filter()->orderBy(['created_at' => 'DESC']))
    ->paginate();
```

### Response shape

```php
[
    'results'         => [...],   // current page rows
    'current_limit'   => 10,
    'current_offset'  => 0,
    'next_offset'     => 10,      // null when no next page
    'prev_offset'     => 0,
    'results_count'   => 10,
    'has_next'        => true,
    'has_previous'    => false,
    'total_count'     => 142,
]
```

`init()` must return a `Builder` or `Join` from the callback. `paginate()` runs `count()` on that builder, then applies `limit()` + `startAt($offset)` for the page.

### Approximate totals — `paginateApproximate()`

For large tables, skip a fresh `COUNT(*)` on every page request. Totals are cached (default 60s) and the payload includes `approximate_count: true`:

```php
$page = $pagination
    ->columns(['id', 'title'])
    ->init(fn ($q) => $q->filter()->orderBy(['id' => 'DESC']))
    ->paginateApproximate(countCacheTtl: 120);
```

On a `GenericService`, set `$approximatePagination = true` to use this path automatically in `list_*`.

## Request payload keys

`PaginationCore` reads limits from the request array:

| Source | Keys |
|--------|------|
| Nested | `pagination`, `PAGINATION`, `search`, `SEARCH` → `limit`, `offset` |
| Top-level | `limit` / `LIMIT`, `offset` / `OFFSET` |

If only `limit` is present, offset defaults to `0`.

## Joined lists

Pass a table alias when the base table is aliased in joins — for example order lines with product names:

```php
new PaginationCore($req, 'order_items', 10, 0, null, 'oi');
```

The callback can return a join chain:

```php
->init(function ($q) {
    return $q->join()
        ->left('products', 'oi.product_id = products.id')
        ->orderBy(['oi.id' => 'ASC']);
})
```

## GenericService

`GenericService` uses `PaginationCore` for `list_*` actions when the client sends pagination fields. Configure caps and columns on the service:

```php
class ProductService extends GenericService
{
    public string $table = 'products';
    public int $maxListRows = 500;
    public bool $allowClientFilters = true;   // non-reserved request fields → WHERE
    public bool $allowClientColumns = false; // allow columns/COLUMNS override when true
    public ?array $sortableColumns = ['created_at', 'name', 'price'];
    public bool $approximatePagination = true;   // cached COUNT totals
    public ?int $cacheListTtl = 60;              // optional list response cache
    public ?int $cacheRetrieveTtl = 300;         // optional retrieve cache
}
```

See [Generic services](/documentation/building-api/generic-services/) and [Advanced generic services](/documentation/building-api/advanced-generic-services/).

When `$allowClientFilters = true`, any non-reserved field in the request body is applied as a WHERE clause (e.g. `"stock[>]": 0` filters in-stock items). Combine with `$sortableColumns` for safe `orderBy` from the client.

## Builder pagination (manual)

Without `PaginationCore`:

```php
$rows = table('products')
    ->filter(['stock[>]' => 0])
    ->orderBy(['id' => 'DESC'])
    ->limit(20)
    ->startAt(40)   // requires limit() first — offset 40
    ->all();
```

Related: [Filtering](/documentation/database/queries-with-filtering/) · [Relationships](/documentation/database/relationships/).

## Common mistakes

- **Omitting `limit()` before `startAt()`** — manual Pionia Shop pages fail without both on the Builder.
- **Running `COUNT(*)` on every scroll event** — enable `$approximatePagination` for large catalogs.
- **Forgetting the base alias on joined lists** — pass `'oi'` to `PaginationCore` when `order_items` is aliased.
- **Allowing client `orderBy` on any column** — restrict to `$sortableColumns` to avoid SQL injection via sort keys.

## What's next

{{< card-grid >}}
{{< link-card title="Generic services" description="list_* with PaginationCore built in." href="/documentation/building-api/generic-services/" >}}
{{< link-card title="Performance" description="Approximate counts and chunk()." href="/documentation/database/performance/" >}}
{{< link-card title="Relationships" description="Paginate order lines with product names." href="/documentation/database/relationships/" >}}
{{< /card-grid >}}
