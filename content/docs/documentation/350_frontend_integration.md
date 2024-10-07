---
title: "Frontend Integration"
parent: "documentation"
description: "Guides the developer how to scaffold the frontend of a Pionia application."
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 300
toc: true
seo:
  title: "Frontend Integration" # custom title (optional)
  description: "Scaffolding frontend in Pionia framework" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

Pionia is a REST framework that is entirely meant for the backend. It has no frontend capabilities.

However, Pionia has added support to scaffold one of the seven vite-supported frameworks. This is to help you get started with your frontend quickly.

## Supported Frameworks

To get the full list of supported frameworks, you can run the following command:

```bash
php pionia front:sc
```

The following are the supported frameworks:

1. [0] Vue
2. [1] React
3. [2] Z-js
4. [3] Qwik
5. [4] Lit
6. [5] Preact
7. [6] Svelte
8. [7] Solid

{{<callout context="note"  icon="outline/pencil">}}
You should scaffold using our commands if you need Pionia to manage your frontend. If you are using a different frontend framework, you can scaffold it manually.
{{</callout>}}

## Scaffold Frontend

To scaffold the frontend, you can run the following command:

```bash
php pionia front:sc
```

If you pass `-y` flag, the command will assume the defaults and scaffold the frontend without asking for any input.
This will scaffold `Vuejs` in the `frontend` directory of your project using `npm` as the package manager.

## Scaffold Specific Framework

Just select the option of the framework you want to scaffold. For example, to scaffold `React`, you can run the following command:

```bash
php pionia front:sc
```

{{<picture src="/images/scaffold-react.png" alt="Pionia Logo">}}

Then select the option for `React` which is `1` as illustrated in the image above.

## Frontend Directory/folder.

The frontend directory is where all the frontend code is stored. It is created by the `front:sc` command. The directory is created in the root of your project.

In the interactive shell of the `front:sc` command, you can specify the name of the directory you want to create. If you do not specify a name, the default name is `frontend`.

In the shell below, enter `no` to provide your custom frontend directory.

{{<picture src="/images/frontend_dir_select.png" alt="Selecting any other Directory for frontend">}}

Example below will scaffold the frontend in the `pages` folder

{{<picture src="/images/pages_ui.png" alt="Selecting any other Directory for frontend">}}

## Frontend Package Manager

In the interactive shell of the `front:sc` command, you can specify the package manager you want to use. If you do not specify a package manager, the default package manager is `npm`.

The following are the available options:-

{{<picture src="/images/select_pkg.png" alt="Selecting any other Directory for frontend">}}

{{<callout context="note"  icon="outline/pencil">}}
If you selected `z-js`, we recommend you to select either `npm` or `yarn` as the package manager.
{{</callout>}}

{{<callout context="note"  icon="outline/pencil">}}
The package you select should already be setup in your system. If you select any package that you do not have installed, the command will fail.
{{</callout>}}

## Scaffolding TS or JS

Except `z-js`, for the other frameworks, you can choose between scaffolding the `js` or the `ts` version of the framework.

{{<picture src="/images/ts_js.png" alt="Selecting any other Directory for frontend">}}

This will always default to `js`.

## Other Frontend Operations.

Pionia does not just stop at scaffolding the frontend. It also, gives you other features that you can do with your frontend.

### Environment Setup

Pionia sets up both the backend and the frontend environments so that they start communicating. In the backend, the following will
be added in your `settings.ini` upon successful scaffolding of the frontend.

```ini
[frontend]
frontend_root_folder=pages
build_command=yarn build
frontend_build_folder=dist
frontend_framework=Vue
package_manager=yarn
```

The `frontend` tells Pionia how to deal with the frontend that was just created.

1. `frontend_root_folder` is the root folder of the frontend. This is where the frontend code is stored.
2. `build_command` is the command that will be run to build the frontend. This command is run as is against your frontend, so feel okay to tweak it the way you see fit.
3. `frontend_build_folder` is the folder where the frontend will be built. Usually if this is not in `dist`, it will absolutely be in the `build` folder. When
   Pionia is going to serve your frontend, this is the folder it will read and ship to your backend.
4. `frontend_framework` is the framework that was used to scaffold the frontend.
5. `package_manager` is the package manager that was used to scaffold the frontend. This will be the package manager used even to build your frontend.

In the frontend directory created, two files were created. These might likely be in your `src` folder.
Pionia adds the `VITE_API_URL` to your `.env` file. This is the url that your frontend will use to communicate with the backend.

In development mode, this will be `http://localhost:8000/api/`. In production mode, this will be relative to your application domain since the frontend and backend will be served together.

1. `.env.development` - This is the file that will be used to set the environment variables for your frontend in development mode.

```.env
# .env.development
VITE_API_URL=http://localhost:8000/api/
```

2. `.env.production` - This is the file that will be used to set the environment variables for your frontend in production mode.

```env
# .env.production
VITE_API_URL=/api/
```

{{<callout context="note"  icon="outline/pencil">}}
You need to call this `VITE_API_URL` as your base url in your frontend whenever you want to make any http calls to your API.
{{</callout>}}

### Build the frontend.

In development, the frontend and backend run in isolation. This implies that both the frontend and backend servers must be started
and run in two terminals. However, when you are done with your frontend, Pionia kicks in again.

Building the frontend and serving it with your backend.

Before proceeding, running `http://localhost:8000/` if your backend is still running on the default port, you will see the default Pionia page.

To build the frontend, you can run the following command:

```bash
php pionia front:build
```

This command will build your frontend in your frontend directory, into your build folder, then will ship them to your backend for serving.

On successful running of the above command, `http://localhost:8000/` should render your frontend instead.

#### Before build

> http://localhost:8000/

{{<picture src="/images/serving-pionia.png" alt="Selecting any other Directory for frontend">}}

#### After build

> http://localhost:8000/

{{<picture src="/images/serving-vue.png" alt="Selecting any other Directory for frontend">}}

### Cleaning up the build files.

When you serve your frontend with your backend, Pionia drops all the necessary files in your root directory for serving. This can be messy and hard to truck.

Future versions might handle this in the `public` folder. But for now, Pionia has a way of trucking these files and cleaning them our if you nolonger want them.

Run the following command to clean the frontend served with backend. This is ensured by the `manifest.json` file that was created with the
`build` command.

```bash
php pionia front:build:clean
```

On success, your root directory will be clean and only containing php files.

### Dropping the entire frontend!

In cases where maybe you wanted to scaffold `Vuejs` and instead scaffolded `React`, you can run this command to drop your entire frontend.

```bash
php pionia front:drop
```

It is advisable to run this command after running the `front:build:clean` so that any files that were created by the `build` command are also cleaned up.

{{<callout context="tip"  icon="outline/pencil">}}
This operation is irreversible and leads to losing your entire frontend progress. If you're not sure, please do not run this command.
{{</callout>}}

With this in, Pionia now can handle both the backend and help you with your backend while maintaining each of them in isolation.

## Need Help?

For any technicalities that you may interface in this section, please refer to the [vite docs](https://vitejs.dev/guide/) for the specific framework you are using or the official documentation
of the framework you're trying to scaffold.
