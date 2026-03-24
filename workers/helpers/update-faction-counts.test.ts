/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Database } from '@db/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MockedFunction } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as supabaseModule from '../lib/create-client';
import * as bulkUpsertModule from './bulk-upsert';
import { updateFactionCounts } from './update-faction-counts';

type FactionRow = Database['public']['Tables']['faction_identities']['Row'];
type CardRow = Database['public']['Tables']['cards']['Row'];

// --------------------
// Mock database state using Partial
const mockFactions: Partial<FactionRow>[] = [
  { id: 'f1', identity: ['elf'], identity_count: 1 },
  { id: 'f2', identity: ['wizard', 'dragon'], identity_count: 2 },
];

const mockCards: Partial<CardRow>[] = [
  { is_creature: true, faction_identity_id: 'f1', type_line: 'Creature — Elf' },
  {
    is_creature: true,
    faction_identity_id: 'f2',
    type_line: 'Creature — Dragon Wizard',
  },
  {
    is_creature: false,
    faction_identity_id: null,
    type_line: 'Sorcery',
    faction_affinities: [['wizard']],
  },
  {
    is_creature: false,
    faction_identity_id: null,
    type_line: 'Land',
    faction_affinities: [['elf']],
  },
];

// --------------------
describe('updateFactionCounts', () => {
  let fromMock: MockedFunction<SupabaseClient<Database>['from']>;
  let bulkUpsertMock: MockedFunction<typeof bulkUpsertModule.bulkUpsert>;

  beforeEach(() => {
    // rangeMock simulates paginated Supabase queries in call order:
    // call 1 → fetchAllFactionIdentities (all factions fit in one page)
    // call 2 → cards page (all 4 cards fit in one page, loop breaks since 4 < pageSize)
    // call 3 → never reached, defensive empty sentinel
    const rangeMock = vi
      .fn()
      .mockResolvedValueOnce({ data: mockFactions, error: null })
      .mockResolvedValueOnce({ data: mockCards, error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    // select mock returning object with range function
    const selectMock = vi.fn(() => ({ range: rangeMock }));

    // from mock returning object with select function
    fromMock = vi.fn(() => ({ select: selectMock }) as any);

    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({
      from: fromMock,
    } as unknown as SupabaseClient<Database>);

    bulkUpsertMock = vi
      .spyOn(bulkUpsertModule, 'bulkUpsert')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates faction counts correctly and calls bulkUpsert', async () => {
    await updateFactionCounts();

    expect(bulkUpsertMock).toHaveBeenCalledOnce();
    const callArgs = bulkUpsertMock.mock.calls[0][0];
    expect(callArgs.table).toBe('faction_identities');

    const f1Update = callArgs.rows.find(
      (r: Partial<FactionRow>) => r.id === 'f1',
    )!;
    const f2Update = callArgs.rows.find(
      (r: Partial<FactionRow>) => r.id === 'f2',
    )!;

    expect(f1Update.creatures_count).toBe(1);
    expect(f1Update.non_creatures_count).toBe(1);
    expect(f1Update.lands_count).toBe(1);
    expect(f1Update.count).toBe(2);

    expect(f2Update.creatures_count).toBe(1);
    expect(f2Update.non_creatures_count).toBe(1);
    expect(f2Update.lands_count).toBe(0);
    expect(f2Update.count).toBe(2);
  });
});
