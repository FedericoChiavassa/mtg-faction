// --------------------
// Supabase client

import dotenv from 'dotenv';
import type { Database } from '@db/types';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// --------------------
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error('SUPABASE_URL or SUPABASE_SECRET_KEY missing in .env');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
);
