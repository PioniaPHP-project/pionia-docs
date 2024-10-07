---
title: "Application Structure"
parent: "documentation"
description: "Guides lead a user through a specific task they want to accomplish, often with a sequence of steps."
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 300
toc: true
seo:
  title: "Application Structure in Pionia" # custom title (optional)
  description: "This sections describes how a Pionia application is organised" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

Taking our directory structure from the [API Tutorial we created here](/documentation/api-tutorial/).

```md
bootstrap
├── application.php
├── routes.php
environment
├── .env
├── settings.ini
public
├── index.php
├── .htaccess
services
├── AuthService.php
static
├── bootstrap.min.css
├── favicon.ico
├── favicon.png
├── pionia_logo.webp
storage
├── scripts
├── rename.php
switches
├── MainSwitch.php
├── .gitignore
├── README.md
├── composer.json
├── pionia
```

## Directory Structure Breakdown

| Name          | Role                                                                                                                                                                  | Type                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| bootstrap     | This is where we store our application and routes. `application.php` helps to bootstrap the Pionia application that shall be used by both our CLI and web kernels.    | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}} Folder |
| environment   | This holds our environment configuration files, can contain profile-specific environment too!                                                                         | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}} Folder |
| public        | This handles all HTTP requests and boots up our web kernel using the Pionia application created in `bootstrap/application.php`                                        | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder  |
| services      | This is where all our services are stored. This is where you should focus most. All business logic resides here.                                                      | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder  |
| static        | These holds static files that the might you may need or that might be needed by the framework itself. In the future, this folder might be used to serve frontend SPAs | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder  |
| storage       | This where application generated files are stored. These might include caches, logs, and scripts. Please do not remove `rename.php` in scripts                        | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder  |
| switches      | This is where our app switches reside.                                                                                                                                | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder  |
| .gitignore    | This file is used to tell git which files to ignore when pushing to the repository.                                                                                   | {{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline-custom">}}File      |
| composer.json | This file is used to manage the dependencies of the project. It is used by composer to install the dependencies.                                                      | {{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline-custom">}}File      |
| pionia        | This handles all our CLI commands, whether inbuilt or your custom commands. Just run `php pionia` to boot this CLI up                                                 | {{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline-custom">}}File      |
| README.m      | A simple getting started guide for the project.                                                                                                                       | {{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline-custom">}}File      |

Pionia is a progressive framework, there more folders might be included as you need/require them. Other folders might include
`middlewares`, `authentications`, `commands`. All these will only be added when you invoke/initiate them.
