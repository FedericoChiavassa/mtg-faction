export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: {
          created_at: string;
          faction_affinities: Json | null;
          faction_identity_id: string | null;
          id: string;
          is_creature: boolean;
          mana_value: number;
          name: string;
          normal_img_url: string;
          normal_img_url_2: string | null;
          oracle_id: string;
          type_line: string;
        };
        Insert: {
          created_at?: string;
          faction_affinities?: Json | null;
          faction_identity_id?: string | null;
          id?: string;
          is_creature: boolean;
          mana_value: number;
          name: string;
          normal_img_url: string;
          normal_img_url_2?: string | null;
          oracle_id: string;
          type_line: string;
        };
        Update: {
          created_at?: string;
          faction_affinities?: Json | null;
          faction_identity_id?: string | null;
          id?: string;
          is_creature?: boolean;
          mana_value?: number;
          name?: string;
          normal_img_url?: string;
          normal_img_url_2?: string | null;
          oracle_id?: string;
          type_line?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cards_faction_identity_id_fkey';
            columns: ['faction_identity_id'];
            isOneToOne: false;
            referencedRelation: 'faction_identities';
            referencedColumns: ['id'];
          },
        ];
      };
      faction_identities: {
        Row: {
          count: number;
          created_at: string;
          creatures_count: number;
          id: string;
          identity: string[];
          identity_count: number;
          lands_count: number;
          name: string;
          non_creatures_count: number;
        };
        Insert: {
          count?: number;
          created_at?: string;
          creatures_count?: number;
          id?: string;
          identity: string[];
          identity_count?: number;
          lands_count?: number;
          name: string;
          non_creatures_count?: number;
        };
        Update: {
          count?: number;
          created_at?: string;
          creatures_count?: number;
          id?: string;
          identity?: string[];
          identity_count?: number;
          lands_count?: number;
          name?: string;
          non_creatures_count?: number;
        };
        Relationships: [];
      };
      format_legalities: {
        Row: {
          card_id: string;
          format: string;
          status: Database['public']['Enums']['legality_status'];
        };
        Insert: {
          card_id: string;
          format: string;
          status: Database['public']['Enums']['legality_status'];
        };
        Update: {
          card_id?: string;
          format?: string;
          status?: Database['public']['Enums']['legality_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'format_legalities_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      card_summary_view: {
        Row: {
          mana_value: number | null;
          name: string | null;
          normal_img_url: string | null;
          normal_img_url_2: string | null;
          oracle_id: string | null;
        };
        Insert: {
          mana_value?: number | null;
          name?: string | null;
          normal_img_url?: string | null;
          normal_img_url_2?: string | null;
          oracle_id?: string | null;
        };
        Update: {
          mana_value?: number | null;
          name?: string | null;
          normal_img_url?: string | null;
          normal_img_url_2?: string | null;
          oracle_id?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_cards_for_faction: {
        Args: { p_creature_filter?: boolean; p_faction_id: string };
        Returns: {
          mana_value: number | null;
          name: string | null;
          normal_img_url: string | null;
          normal_img_url_2: string | null;
          oracle_id: string | null;
        }[];
        SetofOptions: {
          from: '*';
          to: 'card_summary_view';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: {
      legality_status: 'legal' | 'not_legal' | 'banned' | 'restricted';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      legality_status: ['legal', 'not_legal', 'banned', 'restricted'],
    },
  },
} as const;
