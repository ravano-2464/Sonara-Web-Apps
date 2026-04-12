"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAudioController } from "@/features/audio/components/audio-runtime-provider";
import { RecentlyPlayedList } from "@/features/history/components/recently-played-list";
import { useRecentlyPlayed } from "@/features/history/hooks/use-recently-played";
import { useSessionUser } from "@/hooks/use-session-user";

export default function RecentlyPlayedPage() {
  const { t } = useI18n();
  const { user } = useSessionUser();
  const { playTrack } = useAudioController();

  const { items, loading, error } = useRecentlyPlayed(user?.id);

  const tracks = items.map((item) => item.tracks);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("recentlyPlayed.title")}
        description={t("recentlyPlayed.description")}
      />

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
          {t("recentlyPlayed.loading")}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <RecentlyPlayedList
          items={items}
          onPlay={(trackId) => {
            const track = items.find((item) => item.track_id === trackId)?.tracks;
            if (!track) {
              return;
            }
            playTrack(track, tracks);
          }}
        />
      )}
    </div>
  );
}
