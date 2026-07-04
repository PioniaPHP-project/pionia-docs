---
title: "Step 5 — Database setup"
slug: "05-database-setup"
description: "Create tasks table schema and init-db script for SQLite."
summary: "database/schema.sql and bin/init-db.php"
date: 2026-07-01
lastmod: 2026-07-01
draft: false
weight: 105
toc: true
doc_type: tutorial
tutorial_step: 5
tutorial_total: 15
tutorial_prev: /documentation/deskflow-tutorial/04-project-layout/
tutorial_next: /documentation/deskflow-tutorial/06-list-from-database/
seo:
  title: "DeskFlow tutorial — Step 5"
---

DeskFlow tasks should **survive a server restart** — store them in SQLite.

## What you will learn

- Confirm `[db]` in `settings.ini` (already in the template)
- Write `database/schema.sql` and `bin/init-db.php`

{{< prerequisites >}}
- [Step 4](/documentation/deskflow-tutorial/04-project-layout/)
{{< /prerequisites >}}

## Confirm SQLite config

**`environment/settings.ini`** should include:

```ini
[db]
database_type=sqlite
database_name=database.sqlite3
default=true
```

## Create schema

{{< terminal >}}
```bash
mkdir -p database bin
```
{{< /terminal >}}

**`database/schema.sql`**:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    assignee TEXT,
    project_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tasks (title, status, assignee) VALUES
  ('Review homepage mockups', 'open', 'alex@northwind.studio'),
  ('Prepare sprint retro notes', 'done', 'alex@northwind.studio'),
  ('Update client project brief', 'open', 'jamie@northwind.studio');
```

**`bin/init-db.php`**:

```php
#!/usr/bin/env php
<?php
$root = dirname(__DIR__);
$pdo = new PDO('sqlite:' . $root . '/database.sqlite3');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec((string) file_get_contents($root . '/database/schema.sql'));
echo "Initialized {$root}/database.sqlite3\n";
```

{{< terminal >}}
```bash
chmod +x bin/init-db.php
php bin/init-db.php
```
{{< /terminal >}}

## Common mistakes

- **Forgetting to run init-db** — `task.list` will fail in Step 6 with "no such table".
- **Wrong working directory** — run `php bin/init-db.php` from project root.

{{< tutorial-nav >}}
