export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      presets: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          upload_config: Json;
          display_config: Json;
          logo_url: string | null;
          primary_color: string;
          font_family: string;
          assets: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          upload_config?: Json;
          display_config?: Json;
          logo_url?: string | null;
          primary_color?: string;
          font_family?: string;
          assets?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["presets"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          preset_id: string | null;
          crew_token: string;
          upload_config: Json;
          display_config: Json;
          logo_url: string | null;
          primary_color: string;
          moderation_enabled: boolean;
          created_at: string;
          updated_at: string;
          starts_at: string | null;
          ends_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          preset_id?: string | null;
          crew_token?: string;
          upload_config?: Json;
          display_config?: Json;
          logo_url?: string | null;
          primary_color?: string;
          moderation_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          starts_at?: string | null;
          ends_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      selfies: {
        Row: {
          id: string;
          event_id: string;
          image_path: string;
          image_url: string;
          display_name: string | null;
          message: string | null;
          status: string;
          session_id: string | null;
          file_size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          image_path: string;
          image_url: string;
          display_name?: string | null;
          message?: string | null;
          status?: string;
          session_id?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["selfies"]["Insert"]>;
      };
      admin_profiles: {
        Row: {
          id: string;
          display_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
      };
    };
  };
}

// Application-level types (cast from DB rows)
export type SelfieStatus = "pending" | "approved" | "rejected";

export interface UploadConfig {
  max_file_size_mb?: number;
  allow_gallery?: boolean;
  require_name?: boolean;
  require_message?: boolean;
  welcome_text?: string;
  button_text?: string;
  success_text?: string;
}

export interface DisplayConfig {
  grid_columns?: number;
  swap_interval?: number;
  transition?: "fade" | "slide" | "zoom";
  background_color?: string;
  show_names?: boolean;
  show_messages?: boolean;
  overlay_opacity?: number;
  frame_border_color?: string;
  frame_border_width?: number;
}

export interface BrandAsset {
  url: string;
  type: "logo" | "background" | "overlay";
  name: string;
}

// Convenience aliases for DB row types
export type PresetRow = Database["public"]["Tables"]["presets"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type SelfieRow = Database["public"]["Tables"]["selfies"]["Row"];
export type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];

// Application types with proper JSONB typing
export interface Preset extends Omit<PresetRow, "upload_config" | "display_config" | "assets"> {
  upload_config: UploadConfig;
  display_config: DisplayConfig;
  assets: BrandAsset[];
}

export interface Event extends Omit<EventRow, "upload_config" | "display_config"> {
  upload_config: UploadConfig;
  display_config: DisplayConfig;
}

export interface Selfie extends Omit<SelfieRow, "status"> {
  status: SelfieStatus;
}

export type AdminProfile = AdminProfileRow;
