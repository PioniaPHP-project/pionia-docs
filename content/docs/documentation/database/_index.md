---
title: "Database"
description: "Database querying using PORM - Pionia ORM"
summary: ""
date: 024-06-13 14:32:03.100 +0300
lastmod: 024-06-13 14:32:03.100 +0300
draft: false
weight: 1100
toc: true
seo:
  title: "Ponia Porm Database" # custom title (optional)
  description: "Querying the database using the PORM - Pionia ORM." # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

[//]: # ()
[//]: # ({{<callout context="tip"  icon="outline/pencil">}})

[//]: # (This section assumes you have already set up your project and have already gone through the [Api Tutorial]&#40;/documentation/api-tutorial/&#41; guide atleast.)

[//]: # ({{</callout>}})

[//]: # ()
[//]: # (## Introduction.)

[//]: # ()
[//]: # (Pionia uses PORM &#40;Pionia ORM&#41; to interact with the database. PORM is a simple and lightweight ORM that is built on top of the [medoo framework]&#40;https://medoo.in/&#41;. PORM provides a set of tools and conventions that make it easy to interact with the database in PHP. PORM is designed to be simple, lightweight, and easy to use.)

[//]: # ()
[//]: # (## Installation)

[//]: # ()
[//]: # (If you want to check out PORM alone or want to use it outside the Pionia framework, you can install it via composer.)

[//]: # ()
[//]: # (```bash)

[//]: # (composer require pionia/porm)

[//]: # (```)

[//]: # ()
[//]: # ({{<callout context="note"  icon="outline/pencil">}})

[//]: # (If you are using Pionia, you do not need to install PORM separately. PORM is already included in the Pionia framework.)

[//]: # ({{</callout>}})

[//]: # ()
[//]: # (## Configuration)

[//]: # ()
[//]: # (Configuring PORM is simple. All you need is the settings.ini file in the root of your project. The settings.ini file should contain the following:)

[//]: # ()
[//]: # (```ini)

[//]: # ([db])

[//]: # (database =)

[//]: # (username =)

[//]: # (type =)

[//]: # (host =)

[//]: # (password =)

[//]: # (port =)

[//]: # (```)

[//]: # ()
[//]: # ({{<callout context="note"  icon="outline/pencil">}})

[//]: # (If you are using Pionia, you do not need to configure PORM separately. PORM is already configured in the Pionia framework.)

[//]: # ({{</callout>}})

[//]: # ()
[//]: # (### Multiple Database Connections)

[//]: # ()
[//]: # (If you want to connect to multiple databases, you can do so by adding the database connection settings to the `settings.ini` file. You can then specify the database connection to use when querying the database.)

[//]: # ()
[//]: # (```ini)

[//]: # (; other settings)

[//]: # ()
[//]: # ([db])

[//]: # (database =)

[//]: # (username =)

[//]: # (type =)

[//]: # (host =)

[//]: # (password =)

[//]: # (port =)

[//]: # ()
[//]: # ([db2])

[//]: # (database =)

[//]: # (username =)

[//]: # (type =)

[//]: # (host =)

[//]: # (password =)

[//]: # (port =)

[//]: # ()
[//]: # (; other settings)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (You can then specify the database connection to use when querying the database.)

[//]: # ()
[//]: # (```php)

[//]: # (use Porm\Porm;)

[//]: # ()
[//]: # (Porm::from&#40;'posts'&#41;->using&#40;'db2'&#41;; // will connect to the db2 database)

[//]: # (```)

[//]: # ()
[//]: # (By default, PORM will use the default database connection&#40;db&#41; to query the database.)
