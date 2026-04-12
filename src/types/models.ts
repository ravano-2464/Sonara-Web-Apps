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
  frequency: 60 | 230 | 910 | 3600 | 14000;
  gain: number;
}

export type EqualizerBandMap = Record<EqualizerBand["frequency"], number>;
