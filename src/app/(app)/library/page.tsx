"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { useAudioController } from "@/features/audio/components/audio-runtime-provider";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { TrackList } from "@/features/tracks/components/track-list";
import { UploadTrackForm } from "@/features/tracks/components/upload-track-form";
import { useTracks } from "@/features/tracks/hooks/use-tracks";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePlayerStore } from "@/stores/player-store";

export default function LibraryPage() {
  const { user } = useSessionUser();
  const { playTrack } = useAudioController();

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");

  const { tracks, loading, error, refetch } = useTracks({ search, genre });
  const { favoriteTrackIds, toggleFavorite } = useFavorites(user?.id);

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const genres = useMemo(() => {
    const unique = new Set<string>();
    tracks.forEach((track) => {
      if (track.genre) {
        unique.add(track.genre);
      }
    });
    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [tracks]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Library"
        description="Upload audio, search tracks, and curate your catalog."
      />

      <UploadTrackForm userId={user?.id} onUploaded={refetch} />

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, artist, or album"
            aria-label="Search tracks"
          />
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            aria-label="Filter by genre"
            className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
          >
            {genres.map((entry) => (
              <option key={entry} value={entry}>
                {entry === "all" ? "All genres" : entry}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
          Loading tracks...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <TrackList
          tracks={tracks}
          activeTrackId={activeTrack?.id ?? null}
          isPlaying={isPlaying}
          favoriteTrackIds={favoriteTrackIds}
          onToggleFavorite={toggleFavorite}
          onPlayTrack={(track) => playTrack(track, tracks)}
          emptyMessage="No tracks in library. Upload your first track above."
        />
      )}
    </div>
  );
}
