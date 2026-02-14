import type { Database } from '@db/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabasePublishablekey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishablekey,
  {
    auth: {
      persistSession: false, // no accounts, no sessions
      autoRefreshToken: false,
    },
  },
);
