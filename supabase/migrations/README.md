# Supabase Migrations

This folder contains all database schema migrations for the project.

## ⚠️ Important: regenerate frontend types

Whenever you **add, modify, or delete a migration**, you **must regenerate Supabase types** so that frontend and workers stay in sync with the database schema.

### Required step after changing migrations

From the project root:

```bash
npm run types:gen
```

or

```bash
supabase gen types typescript \
  --local \
  --schema public \
  > supabase/types/database.gen.d.ts
```
