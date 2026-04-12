"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { useAudioController } from "@/features/audio/components/audio-runtime-provider";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { PlaylistDetailManager } from "@/features/playlists/components/playlist-detail-manager";
import { usePlaylistDetail } from "@/features/playlists/hooks/use-playlist-detail";
import { useTracks } from "@/features/tracks/hooks/use-tracks";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePlayerStore } from "@/stores/player-store";

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const playlistId = params.id;

  const { user } = useSessionUser();
  const { playTrack } = useAudioController();

  const { tracks: allTracks } = useTracks();
  const {
    playlist,
    tracks: playlistTracks,
    loading,
    error,
    updatePlaylist,
    deletePlaylist,
    addTrack,
    removeTrack,
  } = usePlaylistDetail(playlistId, user?.id);

  const { favoriteTrackIds, toggleFavorite } = useFavorites(user?.id);
  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const playlistQueue = playlistTracks.map((item) => item.tracks);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Playlist Detail"
        description="Manage metadata, add tracks, and edit queue composition."
      />

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
          Loading playlist...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
          {error}
        </div>
      ) : playlist ? (
        <PlaylistDetailManager
          playlist={playlist}
          playlistTracks={playlistTracks}
          allTracks={allTracks}
          activeTrackId={activeTrack?.id ?? null}
          isPlaying={isPlaying}
          favoriteTrackIds={favoriteTrackIds}
          onPlayTrack={(track) => playTrack(track, playlistQueue)}
          onToggleFavorite={toggleFavorite}
          onUpdatePlaylist={updatePlaylist}
          onDeletePlaylist={deletePlaylist}
          onAddTrack={addTrack}
          onRemoveTrack={removeTrack}
        />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-400">
          Playlist not found.
        </div>
      )}
    </div>
  );
}
