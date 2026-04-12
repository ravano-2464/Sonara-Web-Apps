"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAudioController } from "@/features/audio/components/audio-runtime-provider";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { TrackList } from "@/features/tracks/components/track-list";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePlayerStore } from "@/stores/player-store";

export default function FavoritesPage() {
  const { t } = useI18n();
  const { user } = useSessionUser();
  const { playTrack } = useAudioController();

  const { favorites, favoriteTrackIds, loading, error, toggleFavorite } = useFavorites(user?.id);
  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const tracks = favorites.map((favorite) => favorite.tracks);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("favorites.title")}
        description={t("favorites.description")}
      />

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
          {t("favorites.loading")}
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
          emptyMessage={t("favorites.empty")}
        />
      )}
    </div>
  );
}
