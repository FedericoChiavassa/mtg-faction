import { MergeDeep, ObjectMerge, OverrideProperties } from 'type-fest';
import type { Database as DatabaseGenerated } from './database.gen.d.ts';

// --------------------
// HELPERS
// --------------------

type NN<T> = NonNullable<T>;

type CardsRow =
  DatabaseGenerated['public']['Functions']['get_cards_for_faction']['Returns'][number];

type CardsByFaction = ObjectMerge<
  CardsRow,
  {
    mana_value: NN<CardsRow['mana_value']>;
    name: NN<CardsRow['name']>;
    normal_img_url: NN<CardsRow['normal_img_url']>;
    oracle_id: NN<CardsRow['oracle_id']>;
    scryfall_uri: NN<CardsRow['scryfall_uri']>;
  }
>[];

// --------------------
// EXPORTS
// --------------------

// default
export type * from './database.gen.d.ts';
// overrides
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        card_summary_view: {
          Row: CardsByFaction[number];
          Insert: CardsByFaction[number];
          Update: CardsByFaction[number];
        };
      };
      Functions: {
        get_cards_for_faction: {
          Returns: CardsByFaction;
        };
      };
    };
  }
>;
