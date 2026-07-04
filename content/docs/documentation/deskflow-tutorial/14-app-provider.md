---
title: "Step 14 — App provider"
slug: "14-app-provider"
description: "Centralize DeskFlow wiring in AppProvider instead of scattered INI edits."
summary: "Provider hooks for middleware, auth, commands"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 114
toc: true
doc_type: tutorial
tutorial_step: 14
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/13-deploy/
tutorial_next: /documentation/deskflow-tutorial/15-contribute-to-core/
seo:
  title: "DeskFlow tutorial — Step 14"
---

Package authors and advanced app teams register boot logic in a **Provider** — one class instead of many INI fragments.

## What you will learn

- Scaffold `AppProvider` with `make:provider`
- Move middleware/auth registration from INI into PHP hooks
- Register a custom CLI command

{{< prerequisites >}}
- [Step 13](/documentation/deskflow-tutorial/13-deploy/)
{{< /prerequisites >}}

## Generate provider

{{< terminal >}}
```bash
php pionia make:provider AppProvider
```
{{< /terminal >}}

This creates **`providers/AppProvider.php`** and adds an entry under `[app_providers]` in `settings.ini`.

## Wire DeskFlow hooks

```php
namespace Application\Providers;

use Application\Middlewares\RequestIdMiddleware;
use Pionia\Base\Provider\Provider;
use Pionia\Middlewares\MiddlewareChain;

class AppProvider extends Provider
{
    public function middlewares(MiddlewareChain $chain): MiddlewareChain
    {
        return $chain->add(RequestIdMiddleware::class);
    }

    public function commands(): array
    {
        return [
            'deskflow:stats' => \Application\Commands\DeskflowStatsCommand::class,
        ];
    }
}
```

You can remove duplicate `[app_middlewares]` entries once the provider registers them.

Alternative registration in **`bootstrap/application.php`**:

```php
pionia()->addAppProvider(\Application\Providers\AppProvider::class);
```

Full hook list: [App providers](/documentation/extending/app-providers/). Publishing reusable packages: [Composer packages](/documentation/extending/composer-packages/).

## Common mistakes

- **Registering the same middleware twice** — INI + provider duplicates work.
- **Provider routes before switches** — app switches still belong in `[app_switches]` unless you intentionally mount package APIs.

{{< tutorial-nav >}}
