import type { Database } from '@db/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MockedFunction } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as bulkUpsertModule from './helpers/bulk-upsert';
import * as fetchAllModule from './helpers/fetch-all-faction-identities';
import * as updateFactionCountsModule from './helpers/update-faction-counts';
import type {
  ScryfallBulkData,
  ScryfallCard,
  ScryfallCatalog,
} from './import-scryfall';
import { run as importScryfall } from './import-scryfall';
import * as supabaseModule from './lib/create-client';

vi.mock('./lib/create-client', () => ({ supabase: {} }));

// --------------------
// Mock Scryfall API responses
// --------------------
const mockBulkData: ScryfallBulkData = {
  object: 'list',
  data: [
    {
      object: 'bulk_data',
      id: 'bulk-1',
      type: 'oracle_cards',
      updated_at: '2026-01-02T00:00:00Z',
      name: 'Oracle Cards',
      uri: 'https://api.scryfall.com/bulk-data/oracle-cards',
      download_uri: 'https://data.scryfall.com/oracle-cards.json',
    },
  ],
};

const mockCreatureTypes: ScryfallCatalog = {
  object: 'catalog',
  data: ['Elf', 'Wizard', 'Dragon'],
};

const mockScryfallCards: ScryfallCard[] = [
  // Valid creature
  {
    id: 'card-1',
    oracle_id: 'oracle-1',
    scryfall_uri: 'https://scryfall.com/card/1',
    name: 'Elvish Warrior',
    type_line: 'Creature — Elf',
    cmc: 2,
    set_type: 'expansion',
    games: ['paper'],
    layout: 'normal',
    image_uris: {
      normal: 'https://img.scryfall.com/1.jpg',
      small: '',
      large: '',
      png: '',
      art_crop: '',
      border_crop: '',
    },
  },
  // Valid non-creature with affinity
  {
    id: 'card-2',
    oracle_id: 'oracle-2',
    scryfall_uri: 'https://scryfall.com/card/2',
    name: 'Elven Council',
    type_line: 'Sorcery',
    cmc: 3,
    set_type: 'expansion',
    games: ['paper'],
    layout: 'normal',
    oracle_text: 'Search for an Elf card.',
    image_uris: {
      normal: 'https://img.scryfall.com/2.jpg',
      small: '',
      large: '',
      png: '',
      art_crop: '',
      border_crop: '',
    },
  },
  // Invalid card (token) — should be filtered out
  {
    id: 'card-3',
    oracle_id: 'oracle-3',
    scryfall_uri: 'https://scryfall.com/card/3',
    name: 'Elf Token',
    type_line: 'Token Creature — Elf',
    cmc: 0,
    set_type: 'expansion',
    games: ['paper'],
    layout: 'token',
    image_uris: {
      normal: 'https://img.scryfall.com/3.jpg',
      small: '',
      large: '',
      png: '',
      art_crop: '',
      border_crop: '',
    },
  },
];

const mockFactionIdentities = [{ id: 'f1', identity: ['elf'] }];

// --------------------
describe('importScryfall', () => {
  let bulkUpsertMock: MockedFunction<typeof bulkUpsertModule.bulkUpsert>;
  let fromMock: MockedFunction<SupabaseClient<Database>['from']>;

  beforeEach(() => {
    // --------------------
    // Mock global fetch
    // call 1 → bulk data index
    // call 2 → oracle cards download
    // call 3 → creature types catalog
    // --------------------
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockBulkData),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockScryfallCards),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockCreatureTypes),
        }),
    );

    // --------------------
    // Mock Supabase chain
    // sync_logs query uses a different chain (.order().limit().single())
    // so we need to handle both query shapes
    // --------------------
    const singleMock = vi.fn().mockResolvedValue({
      data: { completed_at: '2026-01-01T00:00:00Z' }, // older than scryfall → proceed
      error: null,
    });
    const limitMock = vi.fn(() => ({ single: singleMock }));
    const orderMock = vi.fn(() => ({ limit: limitMock }));
    const insertMock = vi.fn().mockResolvedValue({ error: null });

    const selectMock = vi.fn(() => ({
      order: orderMock, // for sync_logs
      range: vi.fn(), // unused here, fetchAllFactionIdentities is mocked below
    }));

    fromMock = vi.fn(() => ({
      select: selectMock,
      insert: insertMock,
    })) as unknown as MockedFunction<SupabaseClient<Database>['from']>;

    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({
      from: fromMock,
    } as unknown as SupabaseClient<Database>);

    // --------------------
    // Mock helpers
    // --------------------
    bulkUpsertMock = vi
      .spyOn(bulkUpsertModule, 'bulkUpsert')
      .mockResolvedValue(undefined);

    vi.spyOn(fetchAllModule, 'fetchAllFactionIdentities').mockResolvedValue(
      mockFactionIdentities as unknown as Awaited<
        ReturnType<typeof fetchAllModule.fetchAllFactionIdentities>
      >,
    );

    vi.spyOn(
      updateFactionCountsModule,
      'updateFactionCounts',
    ).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('runs the full import flow and calls bulkUpsert for each table', async () => {
    await importScryfall().catch(err => {
      console.error('\n❌ Error importing Scryfall cards:', err);
      process.exit(1);
    });
    // creature_types upsert
    expect(bulkUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ table: 'creature_types' }),
    );

    // faction_identities upsert
    expect(bulkUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ table: 'faction_identities' }),
    );

    // creature cards upsert
    const creatureCall = bulkUpsertMock.mock.calls.find(
      call =>
        call[0].table === 'cards' && call[0].rows[0]?.is_creature === true,
    );
    expect(creatureCall).toBeDefined();
    expect(creatureCall![0].rows).toHaveLength(1); // only card-1, token filtered out

    // non-creature cards upsert
    const nonCreatureCall = bulkUpsertMock.mock.calls.find(
      call =>
        call[0].table === 'cards' && call[0].rows[0]?.is_creature === false,
    );
    expect(nonCreatureCall).toBeDefined();
    expect(nonCreatureCall![0].rows).toHaveLength(1); // only card-2
  });

  it('skips import when DB is already up to date', async () => {
    const singleMock = vi.fn().mockResolvedValue({
      data: { completed_at: '2026-01-02T00:00:00Z' }, // same date as scryfall → skip
      error: null,
    });
    const limitMock = vi.fn(() => ({ single: singleMock }));
    const orderMock = vi.fn(() => ({ limit: limitMock }));
    const selectMock = vi.fn(() => ({ order: orderMock }));

    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({
      from: vi.fn(() => ({ select: selectMock })),
    } as unknown as SupabaseClient<Database>);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as () => never);

    await expect(
      importScryfall().catch(err => {
        console.error('\n❌ Error importing Scryfall cards:', err);
        process.exit(1);
      }),
    ).rejects.toThrow('process.exit called');

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(bulkUpsertMock).not.toHaveBeenCalled();
  });
});
