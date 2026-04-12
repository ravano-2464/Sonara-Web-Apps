"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { useAudioController } from "@/features/audio/components/audio-runtime-provider";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { useRecentlyPlayed } from "@/features/history/hooks/use-recently-played";
import { AlbumGrid } from "@/features/tracks/components/album-grid";
import { TrackList } from "@/features/tracks/components/track-list";
import { usePlaylists } from "@/features/playlists/hooks/use-playlists";
import { useTracks } from "@/features/tracks/hooks/use-tracks";
import { useI18n } from "@/components/providers/i18n-provider";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/models";

export default function HomePage() {
  const { t } = useI18n();
  const { user } = useSessionUser();
  const { playTrack } = useAudioController();

  const { tracks, loading, error } = useTracks();
  const { playlists } = usePlaylists(user?.id);
  const { favoriteTrackIds, toggleFavorite } = useFavorites(user?.id);
  const { items: recentItems } = useRecentlyPlayed(user?.id);

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const playFromMainList = (track: Track) => {
    playTrack(track, tracks);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("home.title")}
        description={t("home.description")}
      />

      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/70 to-cyan-950/40 p-5">
        <p className="text-xs uppercase tracking-widest text-cyan-300">{t("home.nowBuilding")}</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          {t("home.heroTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          {t("home.heroDescription")}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {t("home.yourPlaylists")}
        </h2>
        {playlists.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
            {t("home.noPlaylists")}{" "}
            <Link href="/playlists" className="text-cyan-300">
              {t("home.createOne")}
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {playlists.slice(0, 5).map((playlist) => (
              <li key={playlist.id}>
                <Link
                  href={`/playlists/${playlist.id}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-200 transition hover:border-cyan-400/70"
                >
                  <p className="truncate font-medium">{playlist.name}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {playlist.description ?? t("home.noDescription")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlbumGrid tracks={tracks} onSelectTrack={playFromMainList} />

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {t("home.recentlyPlayed")}
          </h2>
          {recentItems.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
              {t("home.nothingPlayed")}
            </div>
          ) : (
            <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
              {recentItems.slice(0, 5).map((item) => (
                <li key={`${item.track_id}-${item.played_at}`}>
                  <button
                    type="button"
                    onClick={() => playTrack(item.tracks, tracks)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-800"
                  >
                    <span className="truncate text-sm text-zinc-100">{item.tracks.title}</span>
                    <span className="truncate text-xs text-zinc-500">{item.tracks.artist}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {t("home.tracks")}
          </h2>
          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
              {t("home.loadingTracks")}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
              {error}
            </div>
          ) : (
            <TrackList
              tracks={tracks.slice(0, 8)}
              activeTrackId={activeTrack?.id ?? null}
              isPlaying={isPlaying}
              favoriteTrackIds={favoriteTrackIds}
              onToggleFavorite={toggleFavorite}
              onPlayTrack={(track) => playTrack(track, tracks)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
