# Supabase Migrations

This folder contains all database schema migrations for the project.

## ⚠️ Important: regenerate types for frontend and workers

Whenever you **add a migration**, you **must regenerate Supabase types** so that frontend and workers stay in sync with the database schema.

### Required step after changing migrations

From the project root:

```bash
npm run types:gen
```
