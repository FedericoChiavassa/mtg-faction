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

Create a `.env` file in the workers directory using the credentials output from `supabase start`:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=your-local-service-role-key
```

Create a `.env.local` file in the frontend directory using the credentials output from `supabase start`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-local-anon-key
```

If you don't see the credentials in the output, look for them in the Supabase dashboard, usually at [http://127.0.0.1:54323](http://127.0.0.1:54323).

### 3. Resetting the Database

Completely wipe and reset the local database. This will re-apply any existing migrations:

```bash
supabase db reset
```

### 4. Run Import Script

Install dependencies and run the import script to populate the database:

```bash
npm install
npm run import-scryfall
```

### 5. Start the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.
