---
title: "Introduction"
description: "Guides lead a user through a specific task they want to accomplish, often with a sequence of steps."
summary: ""
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 810
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

{{<picture src="pionia.png" alt="Pionia Logo">}}

## About
Welcome to the official documentation of pionia - `/ˌpʌɪəˈnɪə/` framework. Pionia is a PHP Rest Framework that is truly RESTful. It is designed to be simple, lightweight, and easy to use. Pionia is built on top of the Moonlight architecture, which is a powerful architecture for powering highly scaling REST projects. Pionia provides a set of tools and conventions that make it easy to build RESTful APIs in PHP.

This framework was born at Service Cops - East Africa by [JET](https://www.linkedin.com/in/jetezra/) and is maintained by the same team. The framework is open-source and is released under the MIT license.

Documentation organisation.

- [MoonLight Architecture](/docs/moonlight/)
- [Tutorial](/documentation/api-tutorial/)
- [Directory Structure](/documentation/structure/)
- [Requests](/documentation/requests/)
- [Responses](/docs/documentation/responses/)
- [Middleware](/docs/documentation/middleware/)
- [Authentication and Authorization](/docs/documentation/authentication/)
- [Validation](/docs/documentation/validation/)
- [Error Handling](/docs/documentation/error-handling/)
- [Service Swapping](/docs/documentation/service-swapping/)
- [The Controller](/docs/documentation/controllers/)
- [Services and Actions](/docs/documentation/services/)
- [Database and Querying](/documentation/database/)
- [API Reference](/docs/documentation/api-reference/)

### Get Started

{{<callout context="tip" title="Start with a TO-DO api tutorial" icon="outline/pencil">}}

You can quickly get started with our [To-Do API tutorial](/documentation/api-tutorial/). This guide introduces you to the both the framework and the [Moonlight architecture](/docs/moonlight/). It is the recommended way to start your pionia jungle journey.
{{</callout>}}

## Why Pionia?

There are various reasons why pionia stands out from other PHP frameworks. From program performance, developer performance, to maintainability, pionia has got you covered.

You can read more about [why pionia](/docs/documentation/why-pionia/).

## Installation

###### Pre-requisites

- PHP 8.0 or higher
- Any web server (Apache, Nginx, etc.) for production
- Composer
- Any of Postgres, MySQL, or SQLite

**Note:** This guide assumes you have Composer installed and running globally. If you don't, you can download it from [getcomposer.org](https://getcomposer.org/) or use the [Composer Docker image](https://hub.docker.com/_/composer).

{{< tabs "create-new-project" >}}
{{< tab "composer" >}}

```bash
composer create-project pionia/pionia-app my-project
```

Remember to replace `my-project` with the name of your project.

{{< /tab >}}
{{< tab "Git templates" >}}
>>>

1. Select [use this template](https://github.com/PioniaPHP-project/Pionia-App) on the repository page.
2. Download directly the compressed file from the [releases page](https://github.com/PioniaPHP-project/Pionia-App/releases).

>>>
{{< /tab >}}
{{< /tabs >}}

*Nginx configuration*ss

This is just a sample configuration. You can modify it to suit your needs. But make sure your configuration points to the `index.php` file of your project.

```nginx

# ...rest of your configurations
#  projet_name [replace this with your project name]
   location /projet_name {

        alias /var/www/html/project_name;
        try_files $uri $uri/ @project_name;

      }


    location @camera_track {
         rewrite /project_name/(.*)$ /project_name/index.php?/$1 last;

   }

## ...rest of your configurations
```

## Contributing

Currently the framework is maintained at [Service Cops - East Africa](https://servicecops.com/) but we welcome contributors from all walks of life.

You can contribute to the framework, documentation or by helping us grow the community through writing articles, tutorials, and sharing your experience with the framework on any media platform.

> The framework itself strips off all the unnecessary features that are found in other frameworks and leaves you with only what you need to build a RESTful API. This means you can also contribute by building plugins and extensions that can be used with the framework.

If you want to contribute to this documentation, you can find the source code on [GitHub](https://github.com/PioniaPHP-project/Pionia-App).

Please read the [contributing guidelines](https://github.com/PioniaPHP-project/Pionia-App/contributing.md) before contributing.

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/PioniaPHP-project/Pionia-App/code_of_conduct.md)
