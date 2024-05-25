---
title: "Structure"
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

Taking our directory structure from the [API Tutorial we created here](/documentation/api-tutorial/).

![alt text](image-1.png)


## Directory Structure Breakdown

***app***{{<inline-svg src="outline/folder" height="1rem" width="1rem" class="svg-inline-custom">}}:-
    This is the main directory of the project. It is where all the application logic is stored. It contains the following subdirectories and scripts:

  1. ***Controller.php*** :- This file contains the only controller our project needs and runs. Controllers are responsible for mapping traffic to the responsible service switcher.
  2. ***routes.php*** :- This file contains the route(s) that our apps will use to access the controller. In normal curcumstances, it should be always one route.
  3. ***MainApiSwitch.php*** :- This is where all our services are registered and called. It is where we switch between services basing on the request made.
  4. ***services*** :- This is where all our services are stored. This is where you should focus most. All business logic resides here.
  5. ***authenticationBackends*** :- This is where we store our authentication backends reside. Add your authentication logic here.
  6. ***middlewares*** :- Usually this folder is not included in the initial project setup. But this is where you add your middlewares. Middlewares are used to intercept requests before they reach the controller and after they leave the controller.

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
    This is the file that contains the documentation of the project. It is the first file that is opened when you open the project.

***settings.ini***{{<inline-svg src="outline/file" height="1rem" width="1rem" class="svg-inline">}}:-
    This is the file that contains the settings of the project. It is where you store the settings of the project.


As you can see, pionia maintains the least number of files and directories to make it easy for you to understand and maintain your project. You can always add more directories and files as you see fit. But remember to keep the project as simple as possible.
