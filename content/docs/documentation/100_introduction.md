---
title: "Introduction"
description: "Guides a developer on how to navigate the docs, get started with Pionia and more."
summary: ""
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 100
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

{{<picture src="pionia.png" alt="Pionia Logo">}}

## About

Welcome to the official documentation of pionia - `/ˌpʌɪəˈnɪə/` framework. Pionia is a PHP Rest Framework that is truly RESTful. It is designed to be simple, lightweight, and easy to use. Pionia is built on top of the Moonlight architecture, which is a powerful architecture for powering highly scaling REST projects. Pionia provides a set of tools and conventions that make it easy to build RESTful APIs in PHP.

This framework was born at Service Cops - East Africa by [JET](https://www.linkedin.com/in/jetezra/) and is maintained by the same team. The framework is open-source and is released under the MIT license.

Documentation organisation.

- [MoonLight Architecture](/moonlight/introduction-to-moonlight-architecture/)
- [Tutorial](/documentation/api-tutorial/)
- [App Structure](/documentation/application-structure/)
- [Requests And Responss](/documentation/requests-and-responses/)
- [Middleware](/docs/documentation/middleware/)
- [Security - Authentication and Authorization](/documentation/security/security-authentication-and-authorization/)
- [Services and Actions](/documentation/services/services/)
- [Database and Querying](/documentation/database/configuration-getting-started/)

### Get Started

{{<callout context="tip" title="Start with a TO-DO api tutorial" icon="outline/pencil">}}

You can quickly get started with our [To-Do API tutorial](/documentation/api-tutorial/). This guide introduces you to the both the framework and the [Moonlight architecture](/moonlight/introduction-to-moonlight-architecture/). It is the recommended way to start your pionia jungle journey.
{{</callout>}}

## Why Pionia?

There are various reasons why pionia stands out from other PHP frameworks. From program performance, developer performance, to maintainability, pionia has got you covered.

You can read more about [Why Pionia here](/documentation/why-pionia/).

## Installation

###### Pre-requisites

- PHP 8.0 or higher preferably 8.1. You can download PHP from [php.net](https://www.php.net/manual/en/install.php)
- Any web server (Apache, Nginx, etc.) for production
- Composer
- Any RDBMS of Postgres, MySQL/MariaDB, Oracle, Sybase, MSSQL or SQLite

**Note:** This guide assumes you have Composer installed and running globally. If you don't, you can download it from [getcomposer.org](https://getcomposer.org/) or use the [Composer Docker image](https://hub.docker.com/_/composer).

{{< tabs "create-new-project" >}}
{{< tab "composer" >}}

```bash
composer create-project pionia/pionia-app my-project
```

Remember to replace `my-project` with the name of your project.

{{< /tab >}}
{{< tab "Git templates" >}}

> > >

1. Select [use this template](https://github.com/new?template_name=Application&template_owner=PioniaPHP-project) on the repository page.
2. Download directly the compressed file from the [releases page](https://github.com/PioniaPHP-project/Application/releases).

> > > {{< /tab >}}
> > > {{< /tabs >}}

*Nginx configuration*ss

This is just a sample configuration. You can modify it to suit your needs. But make sure your configuration points to the `index.php` file of your project.

```nginx

# ...rest of your configurations
#  projet_name [replace this with your project name]
    location /projet_name {
        alias /var/www/html/project_name;
        try_files $uri $uri/ @project_name;
    }

    location @project_name {
        rewrite /project_name/(.*)$ /project_name/index.php?/$1 last;
   }

# ... rest of your configurations
```

## Contributing

However, the framework is maintained by a dedicated team and welcomes you as our next contributor on any of our related projects.

You can contribute to the framework, documentation or by helping us grow the community through writing articles, tutorials, and sharing your experience with the framework on any media platform.

> The framework itself strips off all the unnecessary features that are found in other frameworks and leaves you with only what you need to build a RESTful API.
> This means you can also contribute by building plugins and extensions that can be used with the framework.

If you want to contribute to this documentation, you can find the source code on [GitHub](https://github.com/PioniaPHP-project/Application).

Please read the [contributing guidelines](https://github.com/PioniaPHP-project/Pionia-App/contributing.md) before contributing.

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/PioniaPHP-project/Pionia-App/code_of_conduct.md)
