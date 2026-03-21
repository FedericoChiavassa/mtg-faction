/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Database } from '@db/types';
import { supabase } from '@lib/create-client';

type BulkUpsertOptions = {
  table: keyof Database['public']['Tables'];
  rows: any[];
  onConflict: string;
  batchSize?: number;
};

// Helper to bulk upsert rows in chunks
export async function bulkUpsert({
  table,
  rows,
  onConflict,
  batchSize = 1000,
}: BulkUpsertOptions) {
  for (const batch of chunkArray(rows, batchSize)) {
    const { error } = await supabase.from(table).upsert(batch, {
      onConflict,
    });
    if (error) throw error;
  }
}

// Helper to process array in chunks
function* chunkArray<T>(array: T[], size: number): Generator<T[]> {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}
