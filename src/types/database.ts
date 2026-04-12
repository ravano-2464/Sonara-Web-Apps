export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RepeatMode = "off" | "all" | "one";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          artist: string;
          album: string | null;
          duration: number;
          genre: string | null;
          lyrics: string | null;
          cover_url: string | null;
          audio_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          artist: string;
          album?: string | null;
          duration: number;
          genre?: string | null;
          lyrics?: string | null;
          cover_url?: string | null;
          audio_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          artist?: string;
          album?: string | null;
          duration?: number;
          genre?: string | null;
          lyrics?: string | null;
          cover_url?: string | null;
          audio_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      playlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          cover_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          cover_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          cover_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      playlist_tracks: {
        Row: {
          playlist_id: string;
          track_id: string;
          position: number;
          added_at: string;
        };
        Insert: {
          playlist_id: string;
          track_id: string;
          position?: number;
          added_at?: string;
        };
        Update: {
          playlist_id?: string;
          track_id?: string;
          position?: number;
          added_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          user_id: string;
          track_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          track_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          track_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      recently_played: {
        Row: {
          user_id: string;
          track_id: string;
          played_at: string;
        };
        Insert: {
          user_id: string;
          track_id: string;
          played_at?: string;
        };
        Update: {
          user_id?: string;
          track_id?: string;
          played_at?: string;
        };
        Relationships: [];
      };
      equalizer_presets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          band_20: number;
          band_25: number;
          band_31: number;
          band_40: number;
          band_50: number;
          band_63: number;
          band_80: number;
          band_100: number;
          band_125: number;
          band_160: number;
          band_200: number;
          band_250: number;
          band_315: number;
          band_400: number;
          band_500: number;
          band_630: number;
          band_800: number;
          band_1000: number;
          band_1250: number;
          band_1600: number;
          band_2000: number;
          band_2500: number;
          band_3150: number;
          band_4000: number;
          band_5000: number;
          band_6300: number;
          band_8000: number;
          band_10000: number;
          band_12500: number;
          band_16000: number;
          band_18000: number;
          band_20000: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          band_20?: number;
          band_25?: number;
          band_31?: number;
          band_40?: number;
          band_50?: number;
          band_63?: number;
          band_80?: number;
          band_100?: number;
          band_125?: number;
          band_160?: number;
          band_200?: number;
          band_250?: number;
          band_315?: number;
          band_400?: number;
          band_500?: number;
          band_630?: number;
          band_800?: number;
          band_1000?: number;
          band_1250?: number;
          band_1600?: number;
          band_2000?: number;
          band_2500?: number;
          band_3150?: number;
          band_4000?: number;
          band_5000?: number;
          band_6300?: number;
          band_8000?: number;
          band_10000?: number;
          band_12500?: number;
          band_16000?: number;
          band_18000?: number;
          band_20000?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          band_20?: number;
          band_25?: number;
          band_31?: number;
          band_40?: number;
          band_50?: number;
          band_63?: number;
          band_80?: number;
          band_100?: number;
          band_125?: number;
          band_160?: number;
          band_200?: number;
          band_250?: number;
          band_315?: number;
          band_400?: number;
          band_500?: number;
          band_630?: number;
          band_800?: number;
          band_1000?: number;
          band_1250?: number;
          band_1600?: number;
          band_2000?: number;
          band_2500?: number;
          band_3150?: number;
          band_4000?: number;
          band_5000?: number;
          band_6300?: number;
          band_8000?: number;
          band_10000?: number;
          band_12500?: number;
          band_16000?: number;
          band_18000?: number;
          band_20000?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      resolve_login_email: {
        Args: {
          login_identifier: string;
        };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T extends TableName> =
  Database["public"]["Tables"][T]["Row"];

export type TableInsert<T extends TableName> =
  Database["public"]["Tables"][T]["Insert"];

export type TableUpdate<T extends TableName> =
  Database["public"]["Tables"][T]["Update"];
