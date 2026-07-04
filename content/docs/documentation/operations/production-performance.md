---
title: "Production performance"
slug: "production-performance"
description: "OPcache preload, deploy optimization, bootstrap caches, and stats-driven warming."
date: 2026-07-02
lastmod: 2026-07-02
draft: false
weight: 555
toc: true
parent: "documentation"
seo:
  title: "Production performance in Pionia"
  description: "Deploy-time OPcache preload, Composer classmaps, bootstrap caches, and hybrid preload strategies."
  noindex: false
---

Pionia ships readable PHP source. Performance is **opt-in** at deploy time — nothing is preloaded or cached until you run `php pionia optimize`.

## Recommended deploy

```bash
composer install --no-dev -o
php pionia optimize --production
```

`--production` enables:

- **Authoritative Composer classmap** (`composer dump-autoload -o -a`)
- **Bootstrap caches** — `storage/bootstrap/routes.php` and `providers.php`
- **Hybrid preload** — stats snapshot hits + minimum app paths + shipped framework manifest

Restart PHP-FPM or RoadRunner workers after deploy when `opcache.validate_timestamps=0`.

**TLS and HTTP/2:** terminate HTTPS at Nginx or Caddy (`listen 443 ssl http2`) and proxy to RoadRunner or PHP-FPM — no Pionia code changes. See [RoadRunner — HTTP/2 and TLS](/documentation/operations/roadrunner/#http2-and-tls-on-roadrunner) and [Production behind Nginx](/documentation/getting-started/introduction/#production-behind-nginx).

## Two timelines

| When | What happens |
|------|----------------|
| **`bin/release`** (framework maintainers) | Generates portable `framework-preload.php` into the Packagist zip, then removes it from the git tree |
| **`php pionia optimize`** (your app) | Installs opt-in scaffold files and generates app-specific `storage/bootstrap/preload.php` |

Consumer apps never commit framework preload manifests — they ship inside `vendor/pionia/pionia-core` after `composer install`.

## Commands

| Command | Purpose |
|---------|---------|
| `php pionia optimize` | Full deploy optimization (scaffold + autoload + preload + bootstrap caches) |
| `php pionia optimize --production` | Recommended production preset |
| `php pionia optimize:preload` | Regenerate preload only |
| `php pionia optimize:preload --snapshot` | Record OPcache snapshot, then regenerate |
| `php pionia optimize:preload --from-stats` | Use existing `storage/metrics/opcache-snapshot.json` |
| `php pionia optimize:preload --strategy=curated\|stats\|hybrid` | Override `PRELOAD_STRATEGY` |
| `php pionia optimize:clear` | Remove generated artifacts |
| `php pionia optimize:clear --scaffold` | Also remove opt-in scaffold files |

Options on `optimize`: `--no-scaffold`, `--no-preload`, `--no-autoload`, `--authoritative`, `--bootstrap-cache`.

## First-time scaffold (opt-in)

The default **`pionia-app`** template does **not** include preload wiring. The first `php pionia optimize` installs:

| File | Role |
|------|------|
| `bootstrap/preload.php` | Stable entry — point `php.ini` `opcache.preload` here |
| `environment/php.ini.production.example` | Production OPcache / JIT directives |
| `[performance]` in `settings.ini` | Preload and bootstrap cache toggles |

Generated artifacts (gitignored):

| File | Role |
|------|------|
| `storage/bootstrap/preload.php` | App `opcache_compile_file()` list |
| `storage/bootstrap/routes.php` | Cached route table |
| `storage/bootstrap/providers.php` | Cached provider map |
| `storage/metrics/opcache-snapshot.json` | Hot-script snapshot from workers |
| `vendor/.../framework-preload.php` | Framework manifest (from Packagist) |

## OPcache preload

`bootstrap/preload.php` requires the generated `storage/bootstrap/preload.php`, which in turn:

1. `require`s the shipped **framework manifest** (`framework-preload.php` in `pionia-core`)
2. Calls `opcache_compile_file()` for app services, switches, and selected vendor packages

Copy `environment/php.ini.production.example` into your PHP pool config:

```ini
opcache.enable=1
opcache.enable_cli=1
opcache.preload=/app/bootstrap/preload.php
opcache.preload_user=www-data
opcache.validate_timestamps=0
opcache.jit=1255
```

`opcache.enable_cli=1` is required for **RoadRunner workers**.

### RoadRunner without global php.ini

```yaml
server:
  command: "php -d opcache.enable_cli=1 -d opcache.preload=./bootstrap/preload.php worker.php"
```

## settings.ini

```ini
[performance]
PRELOAD_ENABLED=true
PRELOAD_STRATEGY=hybrid
PRELOAD_AUTHORITATIVE=true
BOOTSTRAP_CACHE=true
RECORD_OPCACHE_SNAPSHOT=true
PRELOAD_PATHS=
PRELOAD_EXCLUDE=
```

| Key | Values | Purpose |
|-----|--------|---------|
| `PRELOAD_STRATEGY` | `curated`, `stats`, `hybrid` | How to build the preload file list |
| `PRELOAD_AUTHORITATIVE` | `true` / `false` | Pass `-a` to `composer dump-autoload` |
| `BOOTSTRAP_CACHE` | `true` / `false` | Load cached routes/providers at boot |
| `RECORD_OPCACHE_SNAPSHOT` | `true` / `false` | Workers write hot-script snapshot |

### Preload strategies

| Strategy | Behaviour |
|----------|-----------|
| `curated` | Scan framework core (or use shipped manifest), app dirs, and key vendor packages |
| `stats` | Use OPcache live status or recorded snapshot only |
| `hybrid` | Merge snapshot hits with minimum app paths (default) |

## Stats-driven preload workflow

1. **Staging** — run with `RECORD_OPCACHE_SNAPSHOT=true`. Workers throttle-writes `storage/metrics/opcache-snapshot.json` after requests.
2. **Pre-cutover** — `php pionia optimize:preload --snapshot` or `php pionia optimize --production`.
3. **Deploy** — restart workers; verify `/stats` OPcache section.

## Monitoring

`/stats` reports OPcache hit rate, preload memory, JIT status, and cached script counts. See [Developer stats](/documentation/operations/developer-stats/).

## What not to preload

Avoid preloading the entire `vendor/` tree — shared memory grows quickly with little benefit on small APIs. The generator uses a curated manifest plus optional real-traffic stats.

## Related

- [HTTP routing](/documentation/http/http-routing/) — bootstrap route cache
- [RoadRunner](/documentation/operations/roadrunner/) — worker OPcache wiring, HTTP/2, and TLS
- [Production behind Nginx](/documentation/getting-started/introduction/#production-behind-nginx) — `listen 443 ssl http2` with FPM or RR proxy
- [CLI commands](/documentation/operations/commands/) — full command reference
