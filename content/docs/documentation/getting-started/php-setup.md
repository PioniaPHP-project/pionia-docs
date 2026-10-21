---
title: "Set up PHP & Composer"
slug: "php-setup"
description: "Install PHP 8.5, enable the required extensions, and check Composer before creating your first Pionia app."
summary: "Start here: prepare PHP and Composer on macOS, Linux, or Windows."
date: 2026-10-21
lastmod: 2026-10-21
draft: false
weight: 100
toc: true
doc_type: how-to
---

Before creating Pionia Shop, prepare the PHP interpreter that will run it. **Pionia v3 requires PHP 8.5 or newer**; use the latest stable **8.5.x** patch release for this walkthrough. PHP 8.4 and earlier cannot run this version of the framework.

## Check your current PHP

Open a terminal (PowerShell on Windows):

```bash
php -v
php --ini
```

If the first command shows PHP 8.5.x, skip to [Check extensions](#check-extensions). If PHP is missing or older, follow your operating system below. `php --ini` shows which configuration file the command-line interpreter actually loads.

## Install PHP 8.5

{{< tabs "php-installation" >}}
{{< tab "macOS" >}}

Install [Homebrew](https://brew.sh/) if you do not have it, then run:

```bash
brew update
brew install php@8.5
export PATH="$(brew --prefix php@8.5)/bin:$(brew --prefix php@8.5)/sbin:$PATH"
php -v
```

The `export` selects this PHP in the current terminal. Add the same line to `~/.zshrc` (or your shell's startup file) to keep it selected in new terminals. This works with Homebrew's Apple Silicon and Intel installation paths.

See the [Homebrew PHP formula](https://formulae.brew.sh/formula/php) for current package information.

{{< /tab >}}
{{< tab "Linux" >}}

On Debian or Ubuntu, first check whether your configured repositories offer PHP 8.5:

```bash
sudo apt update
apt-cache policy php8.5-cli
```

If a candidate version is available, install the CLI and extensions used by the tutorial:

```bash
sudo apt install php8.5-cli php8.5-common php8.5-sqlite3 php8.5-mbstring php8.5-xml php8.5-curl php8.5-zip unzip
php8.5 -v
```

If multiple PHP versions are installed, choose PHP 8.5 for the `php` command:

```bash
sudo update-alternatives --config php
php -v
```

If no candidate is available, your distribution's repositories do not currently supply that package. Use the [PHP installation selector](https://www.php.net/downloads.php) to choose your distribution and PHP 8.5, then follow its package-source instructions. Other Linux distributions use different package names and package managers; do not run the `apt` commands there.

For background on distribution packages, see the [PHP Linux installation manual](https://www.php.net/manual/en/install.unix.php).

{{< /tab >}}
{{< tab "Windows" >}}

1. Open the [official PHP downloads](https://www.php.net/downloads.php) and select Windows, PHP 8.5, and the build matching your machine. For the tutorial's CLI server, use a **Non Thread Safe (NTS)** build; most Windows PCs use x64.
2. Install the matching Visual C++ runtime linked from the download page.
3. Extract the PHP ZIP into a folder such as `C:\php85`. Copy `php.ini-development` to `php.ini` in that folder.
4. Add `C:\php85` to your user **Path** environment variable, ahead of older PHP entries. Open a new PowerShell window.
5. In `C:\php85\php.ini`, set `extension_dir = "ext"` and enable these entries by removing their leading semicolons:

```ini
extension_dir = "ext"
extension=fileinfo
extension=pdo_sqlite
extension=mbstring
extension=openssl
extension=curl
extension=zip
```

Verify which executable and configuration are selected:

```powershell
where.exe php
php -v
php --ini
```

See the [PHP Windows installation manual](https://www.php.net/manual/en/install.windows.php) for installation details. If you use WSL, follow the Linux tab inside WSL and install Composer there too.

{{< /tab >}}
{{< /tabs >}}

## Check extensions

PioniaCore declares **JSON**, **PDO**, and **fileinfo** as required extensions. The shop tutorial also needs **pdo_sqlite** for its SQLite database. MySQL or PostgreSQL applications need their corresponding PDO driver instead.

```bash
php -m
php -r "echo PHP_VERSION, PHP_EOL; echo implode(', ', PDO::getAvailableDrivers()), PHP_EOL;"
```

In the module list, look for `json`, `PDO`, `fileinfo`, and `pdo_sqlite`. The second command should print a supported PHP version and include `sqlite` among the drivers. JSON is built into PHP 8.5; it does not need a separate installation.

`mbstring`, `curl`, OpenSSL, and ZIP support are useful for Composer and application dependencies; they are not all direct PioniaCore requirements. Composer will report any additional requirements of the packages you install.

## Install Composer

Once `php -v` reports the correct version, install **Composer 2** using the [official Composer download instructions](https://getcomposer.org/download/).

- **macOS / Linux:** follow the installer verification steps, then the global installation instructions so `composer` is on your `PATH`.
- **Windows:** run `Composer-Setup.exe` and select the PHP 8.5 executable you just installed, such as `C:\php85\php.exe`. Reopen PowerShell afterward.

Check both tools in the same terminal you will use for Pionia:

```bash
php -v
composer --version
composer diagnose
```

Resolve missing-extension or connectivity errors before creating the project. Do not use `--ignore-platform-reqs` to bypass a PHP version mismatch.

## Create your Pionia project

You are ready when PHP is 8.5+, the required extensions and SQLite driver are loaded, and Composer runs:

```bash
composer create-project pionia/pionia-app pionia-shop
cd pionia-shop
composer check-platform-reqs
```

`check-platform-reqs` checks the installed application's requirements against your actual PHP interpreter and extensions. Continue with [Step 2 — Dev server and ping](/documentation/shop-tutorial/02-dev-server-and-ping/), or read [Step 1](/documentation/shop-tutorial/01-create-project/) for the new project's folder layout.

## Common mistakes

- **The terminal still reports an older PHP:** inspect `command -v php` on macOS/Linux or `where.exe php` on Windows, correct your `PATH`, and reopen the terminal and editor.
- **Editing the wrong `php.ini`:** use the file reported by `php --ini`. CLI and web-server PHP can load different configurations.
- **“Could not find driver”:** enable `pdo_sqlite` for the PHP version running the tutorial, then repeat the driver check.
- **A hosting panel shows PHP 8.5 but the terminal does not:** configure CLI PHP separately. Later, ensure FPM or RoadRunner also uses a supported interpreter.
