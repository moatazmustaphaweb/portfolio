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
          /**
           * The image beside the cover's leading run of sections (0033).
           * NOT the cover image — a case file may carry both.
           */
          cover_kind: "media" | "component";
          cover_component: string | null;
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
          cover_kind?: "media" | "component";
          cover_component?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["case_files"]["Insert"]>;
        Relationships: [];
      };
      entry_handles: {
        Row: {
          id: string;
          case_file_id: string;
          /** Null unless the handle names a chapter unambiguously (0017). */
          target_chapter_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          case_file_id: string;
          target_chapter_id?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["entry_handles"]["Insert"]>;
        Relationships: [];
      };
      case_file_siblings: {
        Row: {
          id: string;
          case_file_id: string;
          sibling_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          case_file_id: string;
          sibling_id: string;
          sort_order?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["case_file_siblings"]["Insert"]
        >;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          /** One of the form's subject keys, or null. */
          subject: string | null;
          message: string;
          created_at: string;
          /**
           * Operator-notification state (migration 0029, decision 051).
           * Both null means no attempt was recorded — see the column comments.
           */
          notified_at: string | null;
          notify_error: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          created_at?: string;
          notified_at?: string | null;
          notify_error?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [];
      };
      /**
       * Cover slots (0031). The slot is structure; the heading text a cover
       * uses for it is content and lives in `translations`.
       */
      cover_sections: {
        Row: {
          id: string;
          case_file_id: string;
          /** One of lib/sync/cover-slots.ts ALL_SLOTS. Text, not an enum. */
          slot: string;
          sort_order: number;
          /** Optional image beside this section (0041). Not the cover image. */
          media_id: string | null;
        };
        Insert: {
          id?: string;
          case_file_id: string;
          slot: string;
          sort_order: number;
          media_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cover_sections"]["Insert"]>;
        Relationships: [];
      };
      /** One row per paragraph, ordered. Never a joined string. */
      /**
       * One row per paragraph, ordered, and belonging to ONE locale.
       *
       * ⚠️ `locale` is not redundant with `translations.locale` (migration
       * 0046, the cover half of what 0045 did for chapters). It says which
       * language's SEQUENCE this row is part of, because the two languages
       * paragraph a slot differently — the UAE `thesis` is 2 in English and 3
       * in Arabic. `sort_order` is unique per (section, locale).
       */
      cover_paragraphs: {
        Row: {
          id: string;
          cover_section_id: string;
          sort_order: number;
          /** Which language's sequence this row belongs to. */
          locale: "en" | "ar";
        };
        Insert: {
          id?: string;
          cover_section_id: string;
          sort_order: number;
          locale: "en" | "ar";
        };
        Update: Partial<Database["public"]["Tables"]["cover_paragraphs"]["Insert"]>;
        Relationships: [];
      };
      /** Heading as written → slot. An unrecognised heading FAILS the cover. */
      cover_slot_aliases: {
        Row: {
          heading_norm: string;
          slot: string;
          observed_on: string | null;
        };
        Insert: {
          heading_norm: string;
          slot: string;
          observed_on?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cover_slot_aliases"]["Insert"]>;
        Relationships: [];
      };
      /* --- chapter slot model (migrations 0034 + 0035) --- */
      chapter_sections: {
        Row: {
          id: string;
          chapter_id: string;
          /** One of lib/sync/chapter-slots.ts ALL_SLOTS. Text, not an enum. */
          slot: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          slot: string;
          sort_order: number;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_sections"]["Insert"]>;
        Relationships: [];
      };
      /**
       * One row per paragraph, ordered, and belonging to ONE locale.
       *
       * A paragraph whose body is `[image:<uuid>]` renders as a <figure>. That
       * is why these are rows: <figure> is invalid inside <p>, so the figure
       * has to be a SIBLING of the paragraphs, not spliced into one.
       *
       * ⚠️ `locale` is not redundant with `translations.locale` (migration
       * 0045). A section owns two INDEPENDENT sequences — its English
       * paragraphs and its Arabic ones — because a paragraph is not a
       * translatable unit and the two languages split the same passage
       * differently. `sort_order` is unique per (section, locale).
       */
      chapter_paragraphs: {
        Row: {
          id: string;
          chapter_section_id: string;
          sort_order: number;
          /** 'prose' | 'table' — a table row has no body and owns cells. */
          kind: string;
          /** Which language's sequence this row belongs to. */
          locale: "en" | "ar";
          /**
           * 'body' | 'tail' — the two halves of a section, split at its
           * closing divider. The unit decision 013's fallback resolves over,
           * so an Arabic section can serve its own body and still fall back
           * for the English cross-chapter pointer that follows it.
           */
          part: string;
        };
        Insert: {
          id?: string;
          chapter_section_id: string;
          sort_order: number;
          kind?: string;
          locale: "en" | "ar";
          part: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_paragraphs"]["Insert"]>;
        Relationships: [];
      };
      /* Migration 0053 — the About page career timeline. Employer NAMES are
         deliberately not stored; see the migration for why. */
      career_roles: {
        Row: {
          id: string;
          locale: Database["public"]["Enums"]["locale_code"];
          sort_order: number;
          started: string;
          /** NULL means the role is current. */
          ended: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          locale: Database["public"]["Enums"]["locale_code"];
          sort_order: number;
          started: string;
          ended?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["career_roles"]["Insert"]>;
        Relationships: [];
      };
      chapter_table_cells: {
        Row: {
          id: string;
          chapter_paragraph_id: string;
          row_idx: number;
          col_idx: number;
          is_header: boolean;
        };
        Insert: {
          id?: string;
          chapter_paragraph_id: string;
          row_idx: number;
          col_idx: number;
          is_header?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_table_cells"]["Insert"]>;
        Relationships: [];
      };
      chapter_slot_aliases: {
        Row: {
          heading_norm: string;
          slot: string;
          observed_on: string | null;
        };
        Insert: {
          heading_norm: string;
          slot: string;
          observed_on?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_slot_aliases"]["Insert"]>;
        Relationships: [];
      };
      page_sections: {
        Row: {
          id: string;
          /** Route-derived: 'about' · 'about/philosophy' · 'systems' · 'contact'. */
          page: string;
          slug: string;
          sort_order: number;
          /** 'prose' | 'table' — a table stores TAB/NEWLINE cells in body. */
          kind: string;
          /**
           * The language this section IS (0048). Each locale owns its own
           * ordered sequence within a page; nothing pairs by position.
           */
          locale: Database["public"]["Enums"]["locale_code"];
        };
        Insert: {
          id?: string;
          page: string;
          slug: string;
          sort_order?: number;
          kind?: string;
          // No default in the database: an insert must state the locale.
          locale: Database["public"]["Enums"]["locale_code"];
        };
        Update: Partial<Database["public"]["Tables"]["page_sections"]["Insert"]>;
        Relationships: [];
      };
      page_section_slug_aliases: {
        Row: {
          page: string;
          derived_slug: string;
          slug: string;
          observed_on: string | null;
        };
        Insert: {
          page: string;
          derived_slug: string;
          slug: string;
          observed_on?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["page_section_slug_aliases"]["Insert"]
        >;
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
          kind: Database["public"]["Enums"]["chapter_kind"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_file_id: string;
          slug: string;
          kind?: Database["public"]["Enums"]["chapter_kind"];
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
      decisions: {
        Row: {
          id: string;
          chapter_id: string;
          sort_order: number;
          /**
           * The language this decision IS (0049). Each locale owns its own
           * ordered list within a chapter; nothing pairs by position.
           */
          locale: Database["public"]["Enums"]["locale_code"];
        };
        Insert: {
          id?: string;
          chapter_id: string;
          sort_order?: number;
          // No default in the database: an insert must state the locale.
          locale: Database["public"]["Enums"]["locale_code"];
        };
        Update: Partial<Database["public"]["Tables"]["decisions"]["Insert"]>;
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
      chapter_kind: "chapter" | "comparison" | "accessibility";
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
        | "entry_handle"
        | "case_file_sibling"
        | "page_section"
        | "ui_string"
        | "decision"
        /* Added by migration 0030 for the cover slot model. */
        | "cover_section"
        | "cover_paragraph"
        | "chapter_section"
        | "chapter_paragraph"
        | "chapter_table_cell"
        /* Added by migration 0055 for the career timeline. */
        | "career_role";
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
