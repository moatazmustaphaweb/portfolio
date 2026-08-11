/**
 * Database types — generated from the live schema.
 *
 * Regenerate after any migration. Do not hand-edit: if this drifts from the
 * database, every type guarantee below it is a lie.
 *
 * Trimmed from the generator's output in one respect: the verbose
 * `Tables<>` / `TablesInsert<>` / `CompositeTypes<>` helper generics are
 * replaced by the three short aliases at the bottom, which are the only ones
 * this codebase uses. Row, Insert, Update and Enums are verbatim.
 */

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
      media: {
        Row: {
          id: string;
          cloudinary_public_id: string;
          width: number | null;
          height: number | null;
          format: string | null;
          redacted: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          cloudinary_public_id: string;
          width?: number | null;
          height?: number | null;
          format?: string | null;
          redacted?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media"]["Insert"]>;
        Relationships: [];
      };
      case_files: {
        Row: {
          id: string;
          slug: string;
          grammar: Database["public"]["Enums"]["grammar_type"];
          domain: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          nda: boolean;
          cover_media_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          grammar: Database["public"]["Enums"]["grammar_type"];
          domain: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          nda?: boolean;
          cover_media_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["case_files"]["Insert"]>;
        Relationships: [];
      };
      chapters: {
        Row: {
          id: string;
          case_file_id: string;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          hero_media_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_file_id: string;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          hero_media_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapters"]["Insert"]>;
        Relationships: [];
      };
      features: {
        Row: { id: string; chapter_id: string; sort_order: number };
        Insert: { id?: string; chapter_id: string; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["features"]["Insert"]>;
        Relationships: [];
      };
      outcomes: {
        Row: {
          id: string;
          case_file_id: string;
          value: string;
          status: Database["public"]["Enums"]["outcome_status"];
          sort_order: number;
        };
        Insert: {
          id?: string;
          case_file_id: string;
          value: string;
          // No default in the database: an explicit call every time (decision 007).
          status: Database["public"]["Enums"]["outcome_status"];
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["outcomes"]["Insert"]>;
        Relationships: [];
      };
      targets: {
        Row: {
          id: string;
          case_file_id: string;
          status: Database["public"]["Enums"]["target_status"];
          sort_order: number;
        };
        Insert: {
          id?: string;
          case_file_id: string;
          status: Database["public"]["Enums"]["target_status"];
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["targets"]["Insert"]>;
        Relationships: [];
      };
      series: {
        Row: {
          id: string;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
        };
        Insert: {
          id?: string;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Update: Partial<Database["public"]["Tables"]["series"]["Insert"]>;
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          slug: string;
          stream: Database["public"]["Enums"]["article_stream"];
          series_id: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          hero_media_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          stream: Database["public"]["Enums"]["article_stream"];
          series_id?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          hero_media_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
        Relationships: [];
      };
      studio_works: {
        Row: {
          id: string;
          slug: string;
          year: number | null;
          media_id: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
        };
        Insert: {
          id?: string;
          slug: string;
          year?: number | null;
          media_id?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Update: Partial<Database["public"]["Tables"]["studio_works"]["Insert"]>;
        Relationships: [];
      };
      experiments: {
        Row: {
          id: string;
          slug: string;
          domain: string | null;
          state: string | null;
          url: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
        };
        Insert: {
          id?: string;
          slug: string;
          domain?: string | null;
          state?: string | null;
          url?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Update: Partial<Database["public"]["Tables"]["experiments"]["Insert"]>;
        Relationships: [];
      };
      translations: {
        Row: {
          id: string;
          entity_type: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          locale: Database["public"]["Enums"]["locale_code"];
          field: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          locale: Database["public"]["Enums"]["locale_code"];
          field: string;
          value: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["translations"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: { id: string; key: string; value: string | null; sort_order: number };
        Insert: { id?: string; key: string; value?: string | null; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      navigation: {
        Row: {
          id: string;
          route: string;
          parent_id: string | null;
          sort_order: number;
          location: Database["public"]["Enums"]["nav_location"];
          visible: boolean;
        };
        Insert: {
          id?: string;
          route: string;
          parent_id?: string | null;
          sort_order?: number;
          location: Database["public"]["Enums"]["nav_location"];
          visible?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["navigation"]["Insert"]>;
        Relationships: [];
      };
      ui_strings: {
        Row: { id: string; key: string; context: string | null };
        Insert: { id?: string; key: string; context?: string | null };
        Update: Partial<Database["public"]["Tables"]["ui_strings"]["Insert"]>;
        Relationships: [];
      };
      revisions: {
        Row: {
          id: string;
          entity_type: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          snapshot: Json;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          entity_type: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          snapshot: Json;
          created_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["revisions"]["Insert"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          started_at: string;
          locale: Database["public"]["Enums"]["locale_code"] | null;
          referrer_type: string | null;
          device: string | null;
          // Resolved at the edge. The IP itself is never read or stored.
          country: string | null;
          city: string | null;
        };
        Insert: {
          id?: string;
          started_at?: string;
          locale?: Database["public"]["Enums"]["locale_code"] | null;
          referrer_type?: string | null;
          device?: string | null;
          country?: string | null;
          city?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          session_id: string | null;
          type: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          type: string;
          payload?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      article_stream: "build-log" | "field-notes" | "positions";
      comment_status: "pending" | "approved" | "spam";
      content_status: "draft" | "published" | "archived";
      entity_type:
        | "case_file"
        | "chapter"
        | "feature"
        | "outcome"
        | "target"
        | "article"
        | "series"
        | "studio_work"
        | "experiment"
        | "media"
        | "nav_item"
        | "setting"
        | "ui_string";
      grammar_type: "country-culture" | "ecosystem" | "design-system";
      locale_code: "en" | "ar";
      nav_location: "header" | "footer";
      outcome_status: "projected" | "achieved" | "not-measurable";
      target_status: "achieved" | "missed" | "not-measurable";
    };
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
