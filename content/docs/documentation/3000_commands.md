---
title: "Commands (Pionia CLI)"
slug: "commands-pionia-cli"
description: "Guides you on to use Pionia CLI and adding custom commands"
summary: "Available commands in Pionia CLI and how to add custom commands."
date: 2024-10-07 19:48:09.318 +0300
lastmod: 2026-07-02
draft: false
weight: 3000
toc: true
seo:
  title: "Commands(Pionia CLI)" # custom title (optional)
  description: "Guides on how to interact with Pionia CLI." # custom description (recommended)
  noindex: false # false (default) or true
---

Pionia CLI is the command-line interface for your application. It boots the same **`AppRealm`** as HTTP via `bootstrap/application.php` → `bootConsole()`.

v3 uses a **native console** (`Pionia\Console\Application`). Commands extend `Pionia\Console\Command`; arguments and options use `Pionia\Console\Input\InputArgument` and `InputOption`. Run the CLI from your project root as `php pionia …` or `composer run pionia -- …`.

Custom commands live in `commands/` (generate with `make:command`).

## Built-in commands (v3)

Run `php pionia list` for the live registry in your app. Built-in commands ship with the framework; your app may add more under `commands/`.

### Global

| Command | Aliases | Description |
|---------|---------|-------------|
| `new {name}` | `pionia:new`, `create` | Scaffold a new application directory |
| `serve` | `server`, `start`, `run` | PHP built-in dev server |
| `runserver` | `roadrunner`, `rr:serve` | RoadRunner persistent workers |
| `runserver:logs` | `rr:logs`, `roadrunner:logs`, `logs:rr` | Tail RoadRunner logs (formatted) |
| `stopserver` | `roadrunner:stop`, `rr:stop` | Stop detached RoadRunner |
| `rr:setup` | `runserver:setup` | Download `./rr` binary |
| `optimize` | — | Production autoload + OPcache preload + bootstrap caches |
| `optimize:preload` | — | Regenerate OPcache preload only |
| `optimize:clear` | `clear-optimize` | Remove generated optimization artifacts |
| `app:aliases` | `alias`, `aliases`, `list:aliases` | List path aliases registered in AppRealm |
| `shell` | `tinker`, `repl`, `pionia:shell` | Interactive REPL |

**`new`** — `php pionia new my-app --install --with-frontend=react-ts`  
Options: `--path=`, `--vendor=`, `--with-frontend=`, `--install`

**`serve`** — `php pionia serve --port=8003 --host=127.0.0.1`  
Options: `--port`, `--host`, `--tries=10`, `--no-reload`  
Default port: **8003** (from `PORT` / `SERVER_PORT` in `.env`, or `[server]` / `[roadrunner]` in `settings.ini`)

**`runserver`** — `php pionia runserver --detach --port=8003`  
Options: `--config=`, `--worker=`, `--host=`, `--port=`, `--detach`, `--log=`, `--raw`

**`runserver:logs`** — `php pionia runserver:logs --wait`  
Options: `--log=`, `--lines=50`, `--no-follow`, `--wait`, `--raw`

**`stopserver`** — `php pionia stopserver --force`  
Options: `--config=`, `--port=`, `--force`

**`rr:setup`** — `php pionia rr:setup` (alias: `composer rr:setup`)  
Downloads the RoadRunner binary into the app root. Option: `--force`

**`optimize`** — `php pionia optimize --production`  
Opt-in production mode: installs `bootstrap/preload.php`, `php.ini.production.example`, and `[performance]` settings, then runs autoload + preload generation.  
Options: `--production`, `--no-scaffold`, `--no-preload`, `--no-autoload`, `--authoritative`, `--bootstrap-cache`

**`optimize:preload`** — `php pionia optimize:preload --snapshot`  
Regenerate `storage/bootstrap/preload.php` only. Options: `--snapshot`, `--from-stats`, `--strategy=curated|stats|hybrid`

**`optimize:clear`** — removes generated artifacts. Option: `--scaffold` to remove opt-in files too.

**`app:aliases`** — lists built-in and custom path aliases (`LOGS_DIR`, `SERVICES_DIR`, etc.) with resolved paths and whether each maps to a directory.

### API documentation

| Command | Aliases | Description |
|---------|---------|-------------|
| `api:docs` | `make:api-docs`, `docs:api` | Generate OpenAPI + Markdown from `@moonlight-*` tags |
| `api:catalog` | `docs:catalog` | Print service/action catalog JSON |

**`api:docs`** — `php pionia api:docs --ui --check`  
Options: `--format=openapi,markdown`, `--output=docs/api`, `--ui`, `--check`

**`api:catalog`** — `php pionia api:catalog -o docs/api/catalog.json`  
Options: `--output=` (file; default stdout)

Full tag reference, examples, and `/docs` setup: **[Documenting your API (Moonlight)](/documentation/api-reference/)**.

### App

| Command | Aliases | Description |
|---------|---------|-------------|
| `app:aliases` | `alias`, `aliases`, `list:aliases` | List container aliases |

### Cache

| Command | Aliases | Description |
|---------|---------|-------------|
| `cache:clear` | `cache:c`, `c:c` | Wipe the active cache store |
| `cache:prune` | `cache:p`, `c:p` | Remove expired entries |
| `cache:delete {key}` | `cache:d`, `c:d`, `uncache` | Delete one key |

See [Caching](/documentation/caching-in-pionia/).

### Frontend (Vite)

| Command | Aliases | Description |
|---------|---------|-------------|
| `frontend:scaffold` | `f:scaffold`, `frontend:s` | Create Vite app in `frontend/` |
| `frontend:dev` | `f:dev` | Vite dev server (proxies `/api`) |
| `frontend:build` | `f:build`, `frontend:b` | Build and deploy to `public/` |
| `frontend:clean` | `f:clean` | Remove built assets from `public/` |
| `frontend:drop` | `f:drop` | Delete `frontend/` and settings |

**`frontend:scaffold`** — `php pionia frontend:scaffold --framework=react-ts --yes`  
Options: `--framework=`, `--directory=frontend`, `--package-manager=`, `--yes`

**`frontend:dev`** — `php pionia frontend:dev --port=5173`

**`frontend:drop`** — `php pionia frontend:drop --force`

### Maintenance

| Command | Aliases | Description |
|---------|---------|-------------|
| `maintenance:on` | `down` | Enable HTTP 503 gate |
| `maintenance:off` | `up` | Disable maintenance mode |

**`maintenance:on`** — `php pionia maintenance:on --message="Deploying" --retry-after=300 --bypass="$(openssl rand -hex 16)"`  
Options: `--message=`, `--retry-after=`, `--bypass=` / `--secret=`

See [Maintenance mode](/documentation/maintenance/).

### Stats

| Command | Aliases | Description |
|---------|---------|-------------|
| `stats:view` | `stats`, `viewstats` | Request metrics in the terminal |

**`stats:view`** — `php pionia stats:view --json --reset`  
Options: `--json`, `--top=10`, `--reset`

See [Developer stats](/documentation/developer-stats/).

### Code generation (`make:`)

| Command | Aliases | Description |
|---------|---------|-------------|
| `make:service {name}` | `gen:service`, `g:s`, `service` | Scaffold a service class |
| `make:switch {name}` | `g:sw`, `switch` | Scaffold an API switch (e.g. `v2`) |
| `make:middleware {name}` | `gen:middleware`, `g:m` | Scaffold middleware |
| `make:auth {name}` | `gen:auth`, `g:a` | Scaffold an authentication backend |
| `make:command {name}` | `gen:command`, `g:c`, `command` | Scaffold a custom CLI command |
| `make:provider {name}` | `gen:provider`, `g:p`, `provider` | Scaffold a service provider |

Examples:

```bash
php pionia make:service todo
php pionia make:switch v2
php pionia make:middleware cors
php pionia make:auth jwt
php pionia make:command reports:Generate
```

### Help

```bash
php pionia list
php pionia help runserver
php pionia help frontend:scaffold
```

See also: [Introduction](/documentation/introduction/) · [RoadRunner](/documentation/roadrunner/) · [Background work](/documentation/background-work/).

## Adding Custom Commands

Pionia commands extend `Pionia\Console\Command`. Place classes in `commands/` (or generate one with `make:command`).

To create a new command, you can run the following command:

```bash
php pionia make:command PasswordGenerator
```

This is an interactive command that will ask you to provide the name, title, help message, description, options, the command namespace and many more of the command.

### Command Namespace

Commands are grouped into namesapces such as `auth`, `make` `app` and you can also create your own namespace and add your commands there. The namespace is used to group related commands together. The namespace is the first part of the command name. For example, in the command `make:command`, `make` is the namespace.

If you do not provide a namespace for your command, it will be placed in the `custom` namespace.

For our command above, let's add in the `security` namespace. The command name will be `security:PasswordGenerator`.

### Command Title

The title is the name of the command that will be displayed in the list of available commands. It should be a human-readable name that describes the command.

Let's name our command `Password Generator`.

### Command Description

The description is a brief description of what the command does. It should be a short description that explains the purpose of the command.

In our description prompt, we can write `Generate a random password in Pionia`.

### Command Help Message

The help message is a detailed description of how to use the command. It should explain the arguments, options, and usage of the command.

In our help message prompt, we can write `This command generates a random password with the specified length. You can specify the length of the password using the --length option. If no length is specified, a password of length 10 will be generated.`

### Command Aliases

From the command we have, writing `php pionia security:PasswordGenerator` is quite long. We can add aliases to the command to make it easier to run the command. You can add multiple aliases here to make it easier to run the command.

In our aliases prompt, let's add `gen-pwd` as aliases. The CLI will prompt you to add more aliases if you want.

Now on, you can run the command using `php pionia gen-pwd`.

### Command Arguments

Arguments are the values that are passed to the command when it is run. You can specify the arguments that the command accepts. You can also specify whether the argument is required or optional.

In our case, we might not need any arguments, so we can skip this step. However, any arguments identified will be prompted to you when you run the command.

Arguments can also be shortened by passing the `short argument` which implies that you can pass the argument by a single character instead of writing the entire string.

Arguments must be described too. A description of the argument helps the user to understand what the argument is used for.

### Command Options

Options are the flags that can be passed to the command when it is run. You can specify the options that the command accepts. You can also specify whether the option is required or optional.

For our case, we can add an option for the length of the password. The argument should be named `length` and should be optional. The CLI will prompt you to add more arguments if you want.

Options can also be shortened by passing the `short option` which implies that you can pass the option using `-l` instead of `--length`.

Options must be described too. For our case, we can write `The length of the password to generate, defaults to 10`

{{<callout tip>}}
Optional arguments and options can have default values. If the user does not provide a value for the argument or option, the default value will be used.
{{</callout>}}

For our case, we can set the default value for the length option to 10.

On complete setup, the command will generate a new command class in the `commands` directory. The class will look like below:

```php {title="commands/PasswordGeneratorCommand.php"}

<?php

  /**
   * This command is auto-generated from pionia cli.
   */

  namespace Application\Commands;

  use Pionia\Console\Command;
  use Pionia\Console\Input\InputOption;

  class PasswordGeneratorCommand extends Command
  {
    /** The aliases for the command. */
    protected array $aliases = ['gen-pwd'];

    /** The help message for the command. */
    protected string $help = 'This command generates a random password with the specified length. You can specify the length of the password using the --length option. If no length is specified, a password of length 10 will be generated.';

    /** The description of the command. */
   protected string $description = 'Generate a random password in Pionia';

    /** The title of the command. */
    protected string $title = 'Password Generator';

    /** The name of the command. */
    protected string $name = 'security:PasswordGenerator';


    /**
     * Get the console command arguments.
     */
    public function getArguments(): array
    {
      return [
      ];
    }


    /**
     * Get the console command options.
     */
    public function getOptions(): array
    {
      return [
          ['length', 'l', InputOption::VALUE_OPTIONAL, 'The length of the password to generate, defaults to 10', '10']
      ];
    }


    /**
     * Execute the console command.
     */
    public function handle(): int
    {
      $length = $this->option('length');
      // Add your logic here
      return Command::SUCCESS;
    }
  }

```

### handle() Method

This where your command logic sits, if you defined any arguments or options, you can access them using `$this->argument('argument_name')` or `$this->option('option_name')`.

In our case, we can access the length option using `$this->option('length')`.

You can create other helper methods in the command class to help you with the command logic.

For our case, let's add the folllowing code to generate a random password

  ```php
    /**
     * @throws RandomException
     */
    function generateRandomString($length = 10): string
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';

        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }

        return $randomString;
    }
  ```

  We can now complete our handle method as follows:

  ```php

    /**
       * Execute the console command.
       * @throws RandomException
       */
    public function handle(): int
    {
      $length = $this->argument('length');
      // Add your logic here
      $string = $this->generateRandomString($length);
      $this->info($string);
      return Command::SUCCESS;
    }
  ```

### Registering the Command

Commands must be registered under the `[commands]` section in any of the `.ini` files. However, if your command was generated via the cli automatically, it will be registered automatically in the `generated.ini`.

```ini
[commands]
security:PasswordGenerator = "Application\Commands\PasswordGeneratorCommand"
```

To see our command, we can now run the following command:

```bash
php pionia list
```

This command will display all the available commands in Pionia CLI. You should see your command listed there.

```markdown
Available Commands:
  ...
  security
    security:PasswordGenerator  Generate a random password in Pionia
  ...
```

You can now run your command using the following command:

```bash
php pionia gen-pwd
```

This will generate a random string in your terminal.

To pass the length of the password, you can use the `--length` option:

```bash
php pionia gen-pwd --length=20
```

{{<callout context="note" icon="outline/information-circle">}}
The sections below walk through building this command step by step. For the full built-in command reference, see [Built-in commands (v3)](#built-in-commands-v3) above.
{{</callout>}}
