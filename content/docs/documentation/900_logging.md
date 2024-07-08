---
title: "Logging in Pionia"
description: "Guides us through the process of logging in pionia."
summary: "As a developer, you need to log information about the application's state, errors, and other important information. This guide will show you how to log in pionia."
date: 2024-06-29 21:06:45.763 +0300
lastmod: 2024-07-08 19:34:38.885 +0300
draft: false
weight: 900
toc: true
seo:
  title: "Logging in Pionia" # custom title (optional)
  description: "Guides us through the process of logging in pionia." # custom description (recommended)
  noindex: true # false (default) or true
---
    

At its core, Pionia uses the [Monolog](https://github.com/Seldaek/monolog) library to handle logging.

## Initialization

Logging is inbuilt in Pionia. To view the logs in real-time, you can run the following command in a different terminal window pointing to your log file, which is by default `server.log`:

```bash
tail -f server.log # replace server.log with your log file
```

## Usage

Anywhere in your app, just call the `logger` constant to log messages. The following log levels are available:
```php
public function getItem(): ?object
{
    logger->info("Getting item");
    logger->debug("Getting item");
    logger->critical("Getting item");
    logger->error("Getting item");
    logger->warning("Getting item");
    logger->notice("Getting item");
    logger->alert("Getting item");
    logger->emergency("Getting item");
    $data = $this->request->getData();
    $this->requires([$this->pk_field]);
    $id = $data[$this->pk_field];
    $item = Porm::from($this->table)->columns($this->listColumns)->get($id);
    logger->info("Gotten item");
    return $item;
}
```

The above code will log messages at different levels. You can then view the logs in the `server.log` file.

```text
[2024-07-08T15:29:28.809573+00:00] pionia.INFO >> Getting item ::  
[2024-07-08T15:29:28.809623+00:00] pionia.DEBUG >> Getting item ::  
[2024-07-08T15:29:28.809654+00:00] pionia.CRITICAL >> Getting item ::  
[2024-07-08T15:29:28.809680+00:00] pionia.ERROR >> Getting item ::  
[2024-07-08T15:29:28.809706+00:00] pionia.WARNING >> Getting item ::  
[2024-07-08T15:29:28.809728+00:00] pionia.NOTICE >> Getting item ::  
[2024-07-08T15:29:28.809751+00:00] pionia.ALERT >> Getting item ::  
[2024-07-08T15:29:28.809773+00:00] pionia.EMERGENCY >> Getting item ::  
[2024-07-08T15:29:28.811627+00:00] pionia.INFO >> Gotten item :: 
```

## Customization

### Log File
You can change the file to log to by defining the log destination in the `settings.ini` file:

```ini
[SERVER]
LOG_DESTINATION=server.log
```
If you want to log to php://stdout, you can define the log destination as `stdout`.

```ini
[SERVER]
LOG_DESTINATION=stdout
```

### Log Format

You can also change the log format by defining the log format in the `settings.ini` file:

```ini
[SERVER]
LOG_FORMAT=TEXT
```
Log formats can be `TEXT` or `JSON`.

### Logging Settings

You can define the sections of `settings.ini` you want to log along:

```ini
[LOGGER]
LOGGED_SETTINGS=db,SERVER
```

### Securing Log Entries

You can hide sensitive information from the logs by defining the sensitive fields in the `settings.ini` file:

```ini
HIDE_IN_LOGS=password,pin,acc
```
The above means that whenever a log entry contains any of the fields `password`, `pin`, or `acc`, the value will be replaced with `*******`.

You can also define the string to replace the sensitive fields with:

```ini
HIDE_SUB=**********
```

### Turning off logs
You can simple turn off `DEBUG` mode in the `settings.ini` file:

```ini
[SERVER]
DEBUG=false
```

However, this is okay, but sometimes, if not most times, we would with to leave the logs on even when we are not in `DEBUG` mode.

The following settings can be defined in the `settings.ini` file:

### Logging Requests
You can log requests by defining the `LOG_REQUESTS` setting in the `settings.ini` file:

```ini
[SERVER]
LOG_REQUESTS=true
```
Whether in `DEBUG` or not, if the above is turned on, all requests will be logged.
By default, this attempts to log both the requests and responses. However, Responses are sometimes heavy and you may choose to omit them. You can do so by defining the `LOG_RESPONSES` setting in the `settings.ini` file:

```ini
[SERVER]
LOG_RESPONSES=false
```

Also, defining the `LOG_RESPONSES` setting as `true` will log only the responses without the requests.


With version 1.1.4, you can also define which Monolog processors you would like to include.

You can achieve this by defining the `LOG_PROCESSORS` setting in the `settings.ini` file:

```ini
[SERVER]
LOG_PROCESSORS=Monolog\Processor\ProcessIdProcessor, Monolog\Processor\MemoryUsageProcessor
```
By default, no processor is added to the logger.

With the above, you app now logs the process id and memory usage in the logs.

### Renaming the logs.

Currently, all logs indicate the `pionia` prefix. You can change this by defining the `APP_NAME` setting in the `settings.ini` file:

```ini
[SERVER]
APP_NAME=blog
```
The above will change the prefix to `blog`.

## Log Rotation

Pionia avoids dictating how you should handle log rotation. You can use the `logrotate` utility to rotate logs. Here is an example configuration for log rotation:

```bash
/path/to/your/log/file {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create
}
```

There is a cool [article about handling log rotation here](https://www.digitalocean.com/community/tutorials/how-to-manage-logfiles-with-logrotate-on-ubuntu-16-04).

That's it! You now know how to log in Pionia.
