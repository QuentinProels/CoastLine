# CoastLine — Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"**
3. Name it `coastline` (or whatever you prefer)
4. Set a database password (save it somewhere — you won't need it for the app, but good to have)
5. Choose a region close to you (e.g., `us-east-1`)
6. Click **"Create new project"** — wait ~2 minutes for provisioning

## 2. Get Your API Keys

Once the project is ready:

1. Go to **Settings → API** (left sidebar)
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co` → This is your `SUPABASE_URL`
   - **anon (public) key**: `eyJ...` → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: `eyJ...` → This is your `SUPABASE_SERVICE_KEY` (backend only, keep secret)

## 3. Run the Migration

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the contents of `migrations/001_create_tables.sql` and paste into the editor
4. Click **"Run"** — you should see "Success. No rows returned."
5. Verify: Go to **Table Editor** (left sidebar) — you should see 4 tables: `profiles`, `expenses`, `debts`, `assets`

## 4. Seed Sample Data

1. In SQL Editor, click **"New Query"** again
2. Copy the contents of `seed/seed_data.sql` and paste into the editor
3. Click **"Run"**
4. Verify: Go to **Table Editor → profiles** — you should see 3 rows (Alex, Jordan, Morgan)

## 5. Configure Environment Variables

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

## 6. Verify Setup

After starting both frontend and backend:
1. Open `http://localhost:3000`
2. Click on "Alex" sample profile
3. Dashboard should load with Alex's data from Supabase
4. If you see empty data, check:
   - Browser console for Supabase errors
   - That your env vars are correct
   - That RLS policies were created (step 3)

## Table Schema Summary

| Table | Purpose | Rows after seed |
|-------|---------|----------------|
| `profiles` | User/sample account info (salary, career, goals) | 3 |
| `expenses` | Monthly expense categories per profile | 21 (7 per profile) |
| `debts` | Debt items per profile (name, balance, APR) | 5 |
| `assets` | Asset items per profile (401k, savings, etc.) | 8 |

## Notes
- RLS is enabled but policies allow all access (hackathon mode)
- The `interactive` profile slug is reserved for the build-your-own flow
- All sample profiles use fixed UUIDs for idempotent seeding
- To reset data, just re-run the seed SQL (it deletes existing sample data first)
