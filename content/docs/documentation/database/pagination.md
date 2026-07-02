---
title: "Pagination"
description: "PaginationCore and list pagination from API requests."
summary: "limit, offset, total count, and GenericService integration."
date: 2026-03-01
lastmod: 2026-03-01
draft: false
weight: 817
toc: true
parent: "database"
seo:
  title: "Porm pagination"
  description: "Paginate Porm queries with PaginationCore."
  canonical: ""
  noindex: false
---

## PaginationCore

`Pionia\Porm\PaginationCore` coordinates **limit**, **offset**, total **count**, and next/prev metadata for list endpoints.

```php
use Pionia\Porm\PaginationCore;

$req = ['limit' => 10, 'offset' => 0];

$pagination = new PaginationCore(
    reqData: $req,
    table: 'posts',
    limit: 10,
    offset: 0,
    db: null,       // connection name or null for default
    alias: null,    // table alias
);

$page = $pagination
    ->columns(['id', 'title', 'created_at'])
    ->where(['published' => 1])
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

Pass a table alias when the base table is aliased in joins:

```php
new PaginationCore($req, 'stock', 10, 0, null, 'st');
```

The callback can return a join chain:

```php
->init(function ($q) {
    return $q->join()
        ->left('categories', 'st.category_id = categories.id')
        ->orderBy(['st.name' => 'ASC']);
})
```

## GenericService

`GenericService` uses `PaginationCore` for `list_*` actions when the client sends pagination fields. Configure caps and columns on the service:

```php
class PostService extends GenericService
{
    public string $table = 'posts';
    public int $maxListRows = 500;
    public bool $allowClientFilters = true;   // non-reserved request fields → WHERE
    public bool $allowClientColumns = false; // allow columns/COLUMNS override when true
    public ?array $sortableColumns = ['created_at', 'title'];
    public bool $approximatePagination = true;   // cached COUNT totals
    public ?int $cacheListTtl = 60;              // optional list response cache
    public ?int $cacheRetrieveTtl = 300;         // optional retrieve cache
}
```

See [Generic services](/documentation/services/generic-services/) and [Advanced generic services](/documentation/services/advanced-generic-services/).

When `$allowClientFilters = true`, any non-reserved field in the request body is applied as a WHERE clause (e.g. `"status": 1` filters `status = 1`). Combine with `$sortableColumns` for safe `orderBy` from the client.

## Builder pagination (manual)

Without `PaginationCore`:

```php
$rows = table('posts')
    ->filter(['published' => 1])
    ->orderBy(['id' => 'DESC'])
    ->limit(20)
    ->startAt(40)   // requires limit() first — offset 40
    ->all();
```

Related: [Filtering](/documentation/database/queries-with-filtering/) · [Relationships](/documentation/database/relationships/).
