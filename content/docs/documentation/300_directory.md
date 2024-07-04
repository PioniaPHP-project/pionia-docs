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
app
├── switches
├── services
├── authenticationBackends
├── commands
├── middlewares
├── routes.php
vendor
.gitignore
composer.json
composer.lock
index.php
pionia
README.md
settings.ini
```

## Directory Structure Breakdown

***app***{{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}:-
    This is the main directory of the project. It is where all the application logic is stored. It contains the following subdirectories and scripts:

| Name    | Role                                                                                                                                                                                                                                                                                   | Type |
| --------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ----------- |
| switches | The switch is responsible for deciding which service to call based on the registered services. This is where all our service switches are stored. Every switch should be associated with a version of your api. If your api does not need more than one version, one switch is enough. |{{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}} Folder |
| services | This is where all our services are stored. This is where you should focus most. All business logic resides here.                                                                                                                                                                       |{{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder|
| authenticationBackends | This is where we store our authentication backends. Add your authentication backend here and register it in settings.ini                                                                                                                                                               | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder|
| middlewares | This folder is not included in the initial project setup. But this is where you add your middlewares. Middlewares are used to intercept requests before they reach the switches and after they leave the switches.                                                                     | {{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder|
| commands | This is where we store our console commands. Add your console commands here.                                                                                                                                                                                                           |{{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}Folder |
| routes.php | Our routes behave different, their job is not to not route but to register the switches that should be auto-dicovered.                                                                                                                                                                 |{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}File |

***vendor***{{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}:-
    This is where all the dependencies of the project are stored. It is created by composer when you run `composer install` or `composer update`.

***.gitignore***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}:-
    This file is used to tell git which files to ignore when pushing to the repository.

***composer.json***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}:-
    This file is used to manage the dependencies of the project. It is used by composer to install the dependencies.

***composer.lock***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}:-
    This file is used to lock the dependencies of the project. It is used by composer to install the dependencies.

***index.php***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}:-
    This is the entry point of the project. It is where the project starts running. This is where you register the middlewares, routes, and authentication backends.

***pionia***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline-custom">}}:-
    This is our console interface. It helps us to run pionia-specific commands.

***README.md***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}:-
    A simple getting started guide for the project.

***settings.ini***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}:-
    This is the file that contains the settings of the project. It is where you store the settings of the project.


As you can see, pionia maintains the least number of files and directories to make it easy for you to understand and maintain your project. You can always add more directories and files as you see fit. But remember to keep the project as simple as possible.
