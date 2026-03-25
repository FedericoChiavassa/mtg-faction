# Faction

[Faction](https://mtgfaction.vercel.app) is built to support a community-created _Magic: The Gathering_ format.  
It uses automated data ingestion and normalization to transform a large real-world dataset into a fast, structured search experience.

## Technical Features

- Clean monorepo setup with **workspaces** and a CI workflow
- **Database-first development** using migrations
- **Automated data pipelines** (Node workers + cron + Supabase)
- **Testable backend logic** (Vitest + isolated helpers)
- **Fully typed database layer** using generated Supabase types
- **Pure functions** for complex logic (easier testing + maintainability)
- **Feature-based frontend architecture**
- **Real-world performance patterns** (virtualized lists, server-driven filtering)
- **Responsive UI** designed to work smoothly on both mobile and esktop
- **Contact form** that writes to the database and sends email notifications with **Resend**
- **Vercel analytics** to track usage (no personal data is collected)

## Architecture

Scryfall API  
 ↓  
[Workers](workers) (Node + Vitest)  
 ↓  
[Supabase](supabase) (PostgreSQL + migrations + Edge functions)  
 ↓  
[Vite + React frontend](frontend) (TypeScript, TanStack Router + Query + Table + Form, Zod, Shadcn UI, Tailwind CSS)

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

Using the credentials output from `supabase start`

Create a `.env` file in the workers directory:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=your-local-service-role-key
```

Create a `.env.local` file in the frontend directory:

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
