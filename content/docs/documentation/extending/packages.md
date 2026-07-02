---
title: "Composer packages"
slug: "composer-packages"
description: "Ship reusable Pionia plugins and full providers on Packagist."
weight: 6001
toc: true
---

## Plugins vs providers

| Kind | Hooks into Pionia boot? | Example |
|------|-------------------------|---------|
| **Plugin** | No — plain PHP library | Validator, HTTP client, DTO mapper |
| **Provider** | Yes — middleware, auth, routes, commands | `acme/pionia-billing` |

Plugins are normal Composer packages. Require them and use them from services.

Providers extend `Pionia\Base\Provider\Provider` and register capabilities during application boot. See [App providers](/documentation/extending/app-providers/).

## Minimal plugin

**composer.json** in your package:

```json
{
  "name": "acme/phone-normalizer",
  "require": { "php": ">=8.5" },
  "autoload": { "psr-4": { "Acme\\Phone\\": "src/" } }
}
```

**src/Normalizer.php** — no Pionia imports required:

```php
namespace Acme\Phone;

final class Normalizer
{
    public static function e164(string $raw): string
    {
        return preg_replace('/\D/', '', $raw) ?? '';
    }
}
```

Use from a service:

```php
use Acme\Phone\Normalizer;

protected function registerAction(\Pionia\Collections\Arrayable $data): \Pionia\Http\Response\ApiResponse
{
    $phone = Normalizer::e164((string) $data->get('phone'));

    return response(0, 'OK', ['phone' => $phone]);
}
```

## Package with a provider

Structure:

```text
acme-pionia-billing/
  composer.json
  src/
    BillingProvider.php
    BillingSwitch.php
    Middleware/BillingContextMiddleware.php
    Commands/SyncInvoicesCommand.php
```

**BillingProvider.php**

```php
namespace Acme\Billing;

use Pionia\Base\Provider\Provider;
use Pionia\Http\Routing\PioniaRouter;
use Pionia\Middlewares\MiddlewareChain;

class BillingProvider extends Provider
{
    public function middlewares(MiddlewareChain $chain): MiddlewareChain
    {
        return $chain->add(Middleware\BillingContextMiddleware::class);
    }

    public function commands(): array
    {
        return ['billing:sync' => Commands\SyncInvoicesCommand::class];
    }

    public function routes(PioniaRouter $router): PioniaRouter
    {
        // Use a unique version slug — not "v2" unless you own that API surface
        return $router->switch(BillingSwitch::class, 'billing');
    }
}
```

**CLI command in the package** — extend `Pionia\Console\Command`:

```php
namespace Acme\Billing\Commands;

use Pionia\Console\Command;

class SyncInvoicesCommand extends Command
{
    protected string $name = 'billing:sync';
    protected string $description = 'Pull invoices from the billing API';

    protected function handle(): int
    {
        $this->info('Syncing…');

        return Command::SUCCESS;
    }
}
```

Input helpers live under `Pionia\Console\Input\` (`InputArgument`, `InputOption`) — same concepts as other PHP CLIs, but native to Pionia.

## Consumer app wiring

After `composer require acme/pionia-billing`:

```ini
; environment/settings.ini
[app_providers]
billing=Acme\Billing\BillingProvider
```

Or in `bootstrap/application.php`:

```php
$app = AppRealm::create(__DIR__);
$app->web()->addAppProvider(\Acme\Billing\BillingProvider::class);
return $app;
```

Clear cache when removing a provider:

```bash
php pionia cache:clear
```

## Package development loop

1. Create a local app with `composer create-project pionia/pionia-app sandbox`.
2. Add a path repository to `composer.json`:

```json
"repositories": [
  { "type": "path", "url": "../acme-pionia-billing", "options": { "symlink": true } }
],
"require": {
  "acme/pionia-billing": "@dev"
}
```

3. Run `composer update acme/pionia-billing` and register the provider.
4. Hit `/api/billing/` (or your chosen version) and `php pionia billing:sync`.

## Checklist before Packagist

- [ ] `Provider` FQCN documented in README
- [ ] Unique API version string in `routes()`
- [ ] No hard dependency on the consumer app's `Application\` namespace
- [ ] Optional RoadRunner / Redis features declared in `suggest`, not `require`
- [ ] `@moonlight-*` tags on public actions if you ship HTTP API docs

## Related

- [App providers](/documentation/extending/app-providers/) — hook reference
- [Commands](/documentation/commands-pionia-cli/) — CLI conventions
- [Middleware](/documentation/middleware/) — HTTP pipeline
