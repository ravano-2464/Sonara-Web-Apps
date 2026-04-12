"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { TrackList } from "@/features/tracks/components/track-list";
import type { Playlist, PlaylistTrackWithTrack, Track } from "@/types/models";

interface PlaylistDetailManagerProps {
  playlist: Playlist;
  playlistTracks: PlaylistTrackWithTrack[];
  allTracks: Track[];
  activeTrackId: string | null;
  isPlaying: boolean;
  favoriteTrackIds: Set<string>;
  onPlayTrack: (track: Track, index: number) => void;
  onToggleFavorite: (trackId: string) => void;
  onUpdatePlaylist: (name: string, description: string) => Promise<{ error: string | null }>;
  onDeletePlaylist: () => Promise<{ error: string | null }>;
  onAddTrack: (track: Track) => Promise<{ error: string | null }>;
  onRemoveTrack: (trackId: string) => Promise<{ error: string | null }>;
}

export function PlaylistDetailManager({
  playlist,
  playlistTracks,
  allTracks,
  activeTrackId,
  isPlaying,
  favoriteTrackIds,
  onPlayTrack,
  onToggleFavorite,
  onUpdatePlaylist,
  onDeletePlaylist,
  onAddTrack,
  onRemoveTrack,
}: PlaylistDetailManagerProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description ?? "");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const tracksInPlaylist = useMemo(
    () => playlistTracks.map((item) => item.tracks),
    [playlistTracks],
  );

  const tracksNotInPlaylist = useMemo(() => {
    const existingIds = new Set(playlistTracks.map((item) => item.track_id));
    return allTracks.filter((track) => !existingIds.has(track.id));
  }, [allTracks, playlistTracks]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h1 className="text-lg font-semibold text-zinc-100">{playlist.name}</h1>
        <p className="mt-1 text-xs text-zinc-400">
          {t("playlistDetail.editSubtitle")}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("playlistDetail.descriptionPlaceholder")}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const result = await onUpdatePlaylist(name, description);
              setMessage(
                result.error
                  ? t("playlistDetail.errorPrefix", { error: result.error })
                  : t("playlistDetail.updated"),
              );
            }}
          >
            {t("common.saveChanges")}
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const result = await onDeletePlaylist();
              if (result.error) {
                setMessage(result.error);
                return;
              }

              router.push("/playlists");
            }}
          >
            {t("playlistDetail.deleted")}
          </Button>
          {message ? <p className="text-xs text-zinc-400">{message}</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">{t("playlistDetail.addTrackTitle")}</h2>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedTrackId}
            onChange={(event) => setSelectedTrackId(event.target.value)}
            className="h-10 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-200"
          >
            <option value="">{t("playlistDetail.selectTrack")}</option>
            {tracksNotInPlaylist.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title} - {track.artist}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={async () => {
              const track = tracksNotInPlaylist.find((item) => item.id === selectedTrackId);
              if (!track) {
                return;
              }

              const result = await onAddTrack(track);
              setMessage(
                result.error
                  ? t("playlistDetail.errorPrefix", { error: result.error })
                  : t("playlistDetail.trackAdded"),
              );
              setSelectedTrackId("");
            }}
            className="sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("common.add")}
          </Button>
        </div>
      </section>

      <TrackList
        tracks={tracksInPlaylist}
        activeTrackId={activeTrackId}
        isPlaying={isPlaying}
        favoriteTrackIds={favoriteTrackIds}
        onPlayTrack={onPlayTrack}
        onToggleFavorite={onToggleFavorite}
        emptyMessage={t("playlistDetail.emptyTracks")}
        actionSlot={(track) => (
          <button
            type="button"
            onClick={async () => {
              const result = await onRemoveTrack(track.id);
              setMessage(
                result.error
                  ? t("playlistDetail.errorPrefix", { error: result.error })
                  : t("playlistDetail.trackRemoved"),
              );
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:text-rose-300"
            aria-label={t("playlistDetail.removeTrackAria")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      />
    </div>
  );
}
