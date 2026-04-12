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
          band_60: number;
          band_230: number;
          band_910: number;
          band_3600: number;
          band_14000: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          band_60?: number;
          band_230?: number;
          band_910?: number;
          band_3600?: number;
          band_14000?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          band_60?: number;
          band_230?: number;
          band_910?: number;
          band_3600?: number;
          band_14000?: number;
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
