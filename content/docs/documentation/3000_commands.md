---
title: "Commands( Pionia CLI)"
description: "Guides you on to use Pionia CLI and adding custom commands"
summary: "Avails the availble commands in our Pionia CLI and how you can your custom commands."
date: 2024-10-07 19:48:09.318 +0300
lastmod: 2024-10-07 19:48:09.318 +0300
draft: false
weight: 2000
toc: true
seo:
  title: "Commands(Pionia CLI)" # custom title (optional)
  description: "Guides on how to interact with Pionia CLI." # custom description (recommended)
  noindex: true # false (default) or true
---

Pionia CLI is a command-line interface that allows you to interact with Pionia. It is a tool that helps you to manage your Pionia instance. It is a powerful tool that allows you to perform various operations on your Pionia instance. This guide will help you understand the available commands in Pionia CLI and how you can add your custom commands.

Pionia CLI also extends `PioniaApplication` instance in your `bootstrap/application.php`. This means you can access all the methods and properties of the `PioniaApplication` instance in your custom commands.

## Adding Custom Commands

Pionia Commmands extend the `Pionia\Console\BaseCommand` class. This class provides a set of methods that you can use to interact with the command line. To create a new command, you need to create a new class that extends the `BaseCommand` class. The class should be placed in the `commands` directory. However much you can create these commands manually, Pionia CLI provides a command that you can use to generate a new command.

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

  use Pionia\Console\BaseCommand;
  use Symfony\Component\Console\Command\Command;
  use Symfony\Component\Console\Input\InputArgument;
  use Symfony\Component\Console\Input\InputOption;

  class PasswordGeneratorCommand extends BaseCommand
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

## Inbuilt Commands

To view the available commands in Pionia CLI, you can run the following command:

### List Commands

```bash
php pionia list
```

This command will display all the available commands in Pionia CLI. You can also get help for a specific command by running the following command:

### Help Command

```bash
php pionia help <command>
```

The above command will display the help message, description, arguments,  usage, and options for the specified command.

As of now, the following commands are available in Pionia CLI:

### Serve Command

- `serve`: This command is used to start the Pionia development server. It will start the server on the specified port or retry on the next available port if the specified port is already in use. It can be aliased as `php pionia server`, `php pionia run`, `php pionia start`. Also, you can specify the port number using the `--port` option.

  Usage: `php pionia serve --port=8000`

### Make Commands

- `make:command <name>`: This command is used to create a new command in your Pionia instance. It will create a new command class in the `app/Commands` directory. You can specify the name of the command as an argument.

  Usage: `php pionia make:command MyCommand`
Details on how to generate a new custom command can be found in the [adding custom commnds section](#adding-custom-commands).

### Make Auth Command

- `make:auth <name>`: This command is used to a new Authentication Backend in your Pionia instance. It will create a new Authentication class in the `authentications` directory. You can specify the name of the Authentication as an argument.

  Usage: `php pionia make:auth jwt`

### Make Service Command

- `make:service <name>`: This command is used to create a new service in your application. It will create a new service class in the `services` directory. You can specify the name of the service as an argument. It can also be used to create both `generic` and `basic` services.

  Usage: `php pionia make:service auth` will generate `AuthService`

### Make Middleware Command

- `make:middleware <name>`: This command is used to create a new middleware in your application. It will create a new middleware class in the `middlewares` directory. You can specify the name of the middleware as an argument.

  Usage: `php pionia make:middleware slackLogger`

### Make Switch Command

- `make:switch <name>`: This command is used to create a new switch in your application. It will create a new switch class in the `switches` directory. You can specify the name of the switch as an argument. The `name` argument should be pointing to the version of the switch. If you're creating a switch for `/api/v2`, the name should be `v2`.
Remember: Switches are used to group together services under the same version of your API.

  Usage: `php pionia make:switch v3`, will create `v3Switch` in the `switches` folder.

### List App Aliases Command

- `app:aliases`: This command is used to list all the available aliases in your application. It will display all the inbuilt and custom aliases.

  Usage: `php pionia app:aliases`

### Clear Cache Command

- `cache:clear`: This command is used to clear the cache in your application no matter the caching driver used.

  Usage: `php pionia cache:clear`

### Delete Cache Command

- `cache:delete <key>`: This command is used to delete a specific key from the cache in your application no matter the caching driver used.

  Usage: `php pionia cache:delete myCachedKey`

### Prune Cache Command

- `cache:prune`: This command is used to prune the cache in your application no matter the caching driver used. Pruning the cache will remove all expired/stale cache items.

  Usage: `php pionia cache:prune`
