---
title: 'Advanced Generic Services'
parent: '600_generic_services'
description: 'Guides the developer in the advanced usages on Pionia Generic Services.'
summary: 'Pionia Generic Services can be used for more than CRUD operations. This guide shows you how to use them.'
date: 2024-06-29 19:57:09.923 +0300
lastmod: 2024-06-29 19:57:09.923 +0300
draft: false
weight: 602
toc: true
seo:
    title: 'Pionia Generic Services- Advanced' # custom title (optional)
    description: 'Handling Advanced Generic Services in Pionia' # custom description (recommended)
    canonical: '' # custom canonical URL (optional)
    noindex: true # false (default) or true
---
{{<callout tip>}}
This section assumes that you have a basic understanding how Generic Services work in Pionia. If you haven't, you can check the [Generic Services section](/documentation/generic-services/) first.
{{</callout >}}

# Introduction

Pionia Generic Services can be used to do more than just CRUD operations. 
This section is also still growing immensely as we discover more ways to use Generic Services.
In this section, we will look at how to use Generic Services for more advanced operations.

## Relationships

The first advanced operation we will look at is relationships. Pionia Generic Services can not query relationships directly.

Remember that Pionia as the framework does not have a built-in Model Layer. Therefore, generic services are the best way to interact with related data.

## Properties and Methods

### $joins

The `$joins` property is an array defining each table we are connecting to and the relationship between them.

Remember, that we still need our base table to be defined in the `$table` property.

```php
public string $table = 'products';

public array $joins = [
    'category' => ['id' => 'category_id']
];

```
The above implies that we have a `products` table and a `category` table.
The `products` table has a `category_id` column that relates to the `id` column in the `category` table.

### $joinTypes

For each table in the `$joins` property, we can define the type of join to use.

```php
public array $joinTypes = [
    'category' => JoinType::INNER
];
```

If you had defined an alias on your table, you can define the `$joinAlias` property to use the alias in the query.

```php
public ?array $joinAliases = [
        'category' => 'cat',
    ];
```
This implies that the `category` table will be aliased as `cat` in the query. This has to be reflected in all queries that use the `category` table including 
in the `$listColumns` property.

```php
public ?array $listColumns = [
        'product.id(id)',
        "product.name(product_name)",
        "cat.name(category_name)",
        "cat.created_at(category_created_at)",
        "product.created_at(product_created_at)",
        "active"
    ];
```

### AS Clause

In the entire Porm including even in the above `listColumns` property, you can achieve the `AS` clause to alias columns 
by using the `()` syntax.

```php
public ?array $listColumns = [
        'product.id(id)', // product.id AS id
        "product.name(product_name)", // product.name AS product_name
        "cat.name(category_name)", // cat.name AS category_name
        "cat.created_at(category_created_at)", // cat.created_at AS category_created_at
        "product.created_at(product_created_at)", // product.created_at AS product_created_at
        "active"
    ];
```
This is applicable to all use cases of Porm.

## Creation

Even in cross relationships, you are only allowed to insert in the base table. This means saving across relationships is not allowed.

## Uploading Files

Pionia Generic Services have a built-in file upload feature. This is done by defining the `$fileColumns` property.

Imagining the following `$createColumns`:- 
```php
public ?array $createColumns = [
        'name',
        'active',
        'icon_image',
    ];
```

If you want the `icon_image` to be treated as a file upload, you can define the `$fileColumns` property as follows:-

```php
public ?array $fileColumns = [
        'icon_image'
    ];
```

This will automatically upload the file and save the file path in the database. 

By default, this behaviour uploads the file to the `media` directory in the root of your project.
But you can change this in your `settings.ini` file by defining the `uploads` section.

```ini
[uploads]
media_dir=/media
media_url=/media
max_size=20000000
```

From the above, the `media_dir` is the directory where the files will be uploaded to. 
The `media_url` is the URL to access the files. 
The `max_size` is the maximum size of the file to be uploaded.

### Custom upload handler

If you don't want to upload files to the media directory, you can define a custom upload handler by overriding the `handleUpload` method.

This method receives the `UploadedFile` object as the first argument and the `fileName` as the second argument.

The `fileName` matches the parameter that was used to receive the file in your action, in the example above it would be `icon_image`.

```php
    /**
     * Provides the default upload behaviour for the service.
     *
     * You can override this method in your service to provide custom upload behaviour.
     * @param UploadedFile $file The file to upload
     * @param string $fileName The name to save the file as
     * @throws Exception
     */
    public function handleUpload(UploadedFile $file, string $fileName): mixed
    {
        return $this->defaultUpload($file, $fileName);
    }
```
This is the core default implementation of the `handleUpload` method. 
Once this is defined in your service, all files will be uploaded using your custom handler.

{{<callout tip>}}
The `handleUpload` method should return the path to the file to be saved in the database. 
Whatever it returns, we will attempt to save it in the database.
{{</callout >}}

## Querying Relationships

This is the part where generic services shine the most. The frontend now has access to all the related data.
So they can even define the columns across relationships defined above to return from the db.

If the frontend want to withdraw from querying relationships back to querying the base table, they can define the 
`dontRelate` request parameter as `true`.

```JSON
{
  // other parameters,
    "dontRelate": true
}
```

The frontend can also define the `COLUMNS` parameter to define the columns to return from the base table.

```JSON
{
  // other parameters,
    "COLUMNS": ["id", "name"]
}
```
If your tables are aliased, you can use the alias in the `COLUMNS` parameter.

```JSON
{
  // other parameters,
    "COLUMNS": ["id", "name", "cat.name"]
}
```

Also, the frontend can achieve the `AS` clause by using the `()` syntax.

```JSON
{
  // other parameters,
    "COLUMNS": ["product.id(id)", "name", "cat.name(category_name)"] // product.id AS id, name, cat.name AS category_name
}
```

All the other functionalities of the Generic Services are still available in the advanced operations.

{{<callout tip>}}
When switching from relationships back to querying the base table alone, Pionia takes care of converting the `listColumns` 
however, if you had aliased your tables, you need to remember how you named your `pk_field` as it might no longer be `id`.
{{</callout >}}
