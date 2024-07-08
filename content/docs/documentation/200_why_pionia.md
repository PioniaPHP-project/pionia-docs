---
title: "Why Pionia?"
description: "Explains why you should use Pionia over other frameworks"
summary: ""
date: 2024-05-24T13:45:48.890Z
lastmod: 2024-05-24T13:45:48.890Z
draft: false
weight: 200
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: true # false (default) or true
---

{{<picture src="pionia.png" alt="Pionia Logo">}}

Pionia was developed to make it easy for developers to build high-performance REST applications removing the unnecessary
complexities that come with most common traditional frameworks. Developers stay focused on the business logic only.

Pionia is all the beautiful parts of Moonlight paradigm. But as the framework, it also has its own unique features. Here 
are some of the reasons why you should consider using Pionia:

1. **Simplicity**: Pionia is designed to be simple and easy to use. It has a clean and intuitive API that makes it easy 
to get started with. Remember that boilerplate code you usually get after installing most frameworks? Pionia doesn't have even quarter of that. Staff like controllers, routes, models 
are not here. You just need to write your services, and you are good to go.

2. **Query Builder**: Pionia comes with a powerful query builder that makes it easy to interact with the database. We know you're
already used to models and ORM. This has both pros and cons. Models usually undergo a process called model hydration while populating the resultset
into your model class. This can really be more expensive especially when you're dealing with large datasets. Pionia uses a query builder
that returns everything as `arrays` and `objects`. This is more efficient and faster. You can read more about [Pionia Query Builder here](/documentation/database/configuration-getting-started/).

3. **Performance**: Pionia is built with performance in mind. It is lightweight and fast, making it ideal for building 
high-performance api applications. It is also designed to be scalable, so you can easily add more resources as your 
application grows. You will be surprised how fast your api will be.

4. **Api Versioning**: Pionia has a unique approach to api versioning. Every switch implies a new version of the api. 
This means that you can easily add new versions of your api without having to change your existing code. 
Just roll out a new switch and you are good to go.

5. **Security**: Pionia has built-in security features that help protect your application from common security threats.
It also has a flexible authentication system that allows you to easily integrate with third-party authentication providers.
Pionia's authentication especially the authentication backends are inspired by Django and Spring boot authentication 
system but with less conventions and more configurations. We keep an open mind on what you want your backend to authenticate with
and we provide you with the tools to do so. We also have a built-in role-based access control system that allows you to
easily manage user permissions and access control. You can look at in the [Authentication and Authorization Section](/documentation/security-authentication-and-authorization/)

6. **Developer Performance**: Using Pionia, rolling out an api should not take even hours. This is achieved by the fact 
that you don't need to write a lot of boilerplate code. You just need to write your services and you are good to go. This becomes 
even simpler if you're using our [Generic Services](/documentation/generic-services/).

7. **Moonlight Compatibility**: Pionia follows the standards defined by Moonlight. Advantages like, single endpoint, 
single request format, single response format,  single switch per api version, every request being post and many more... are all here.
Moonlight strips away the unnecessary complexities that come with most common traditional frameworks. Developers stay focused on the business logic only.
However much this seems to be a new pattern, most platforms have used this platform for years, and it has been proven to 
be an excellent option for building high-performance api applications. [Get started with moonlight pattern here](/moonlight/moonlight-architecture/)

8. **Single Request and Response Format**: In Pionia projects, all requests carry the same format and all responses too.
This makes it easy to understand and work with the api especially on the frontend side.

9. **Community**: Pionia has a growing community of developers who are passionate about building high-performance api 
applications. You can find help and support from the community through discord, twitter, and other social media channels.

10. We also take most of the other advantages listed by most other frameworks like inbuilt logging, error handling, and many more.

Not everything is as you expected in Pionia. We recommend you to first appreciate the moonlight paradigm(also nicknamed single endpoint paradigm or SS&R - Services, Switches and Routes) before you start using Pionia.
This will help you understand the philosophy behind Pionia. The paradigm of Single endpoint, single route, single switch, single request format and single response format is what makes Pionia unique.

Also, please note that Pionia is a REST framework and it intends to keep that way. If you're looking for something 
else, like a full stack framework, you might want to consider other frameworks like Laravel, Symfony, Yii2, CakePhp, CodeIgnitor and others.


