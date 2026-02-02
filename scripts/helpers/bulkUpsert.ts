import { SupabaseClient } from '@supabase/supabase-js';

type BulkUpsertOptions = {
  table: string;
  rows: any[];
  onConflict: string;
  batchSize?: number;
};

// Helper to bulk upsert rows in chunks
export async function bulkUpsert(
  supabase: SupabaseClient,
  { table, rows, onConflict, batchSize = 1000 }: BulkUpsertOptions,
) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, {
      onConflict,
    });
    if (error) throw error;
  }
}
