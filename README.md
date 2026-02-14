# Faction

See [project description here](docs/Project%20description.md)

## Local Development

### Prerequisites

- Node.js
- Docker
- Supabase CLI

#### VS Code setup (optional)

Copy `docs/vscode-settings.example.json` to `.vscode/settings.json` for the recommended editor configuration.

### 1. Start Supabase

Start the local Supabase instance:

```bash
supabase start
```

### 2. Configure Environment

Create a `.env` file in the root directory using the credentials output from `supabase start`:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=your-service-role-key
```

### 3. Resetting the Database

Completely wipe and reset the local database. This will re-apply any existing migrations:

```bash
supabase db reset
```

### 4. Run Import Script

Install dependencies and run the import script to populate the database:

```bash
npm install
node scripts/import-scryfall.ts
```
