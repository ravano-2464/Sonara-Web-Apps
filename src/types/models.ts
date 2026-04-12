import type { TableRow } from "@/types/database";

export type Track = TableRow<"tracks">;
export type Playlist = TableRow<"playlists">;
export type Favorite = TableRow<"favorites">;
export type RecentlyPlayed = TableRow<"recently_played">;

export interface PlaylistTrackWithTrack {
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
  tracks: Track;
}

export interface EqualizerBand {
  frequency:
    | 20
    | 25
    | 31
    | 40
    | 50
    | 63
    | 80
    | 100
    | 125
    | 160
    | 200
    | 250
    | 315
    | 400
    | 500
    | 630
    | 800
    | 1000
    | 1250
    | 1600
    | 2000
    | 2500
    | 3150
    | 4000
    | 5000
    | 6300
    | 8000
    | 10000
    | 12500
    | 16000
    | 18000
    | 20000;
  gain: number;
}

export type EqualizerBandMap = Record<EqualizerBand["frequency"], number>;
