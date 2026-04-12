"use client";

import { Clock3 } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { formatDuration, formatRelativeDate } from "@/lib/utils";
import type { RecentlyPlayedWithTrack } from "@/features/history/hooks/use-recently-played";

interface RecentlyPlayedListProps {
  items: RecentlyPlayedWithTrack[];
  onPlay: (trackId: string) => void;
}

export function RecentlyPlayedList({ items, onPlay }: RecentlyPlayedListProps) {
  const { t } = useI18n();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
        {t("recentlyPlayedList.empty")}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
      {items.map((item) => (
        <li key={`${item.track_id}-${item.played_at}`} className="px-4 py-3">
          <button
            type="button"
            onClick={() => onPlay(item.track_id)}
            className="grid w-full grid-cols-[1fr_auto] items-center gap-3 text-left"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-100">{item.tracks.title}</p>
              <p className="truncate text-xs text-zinc-400">{item.tracks.artist}</p>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p>{formatDuration(item.tracks.duration)}</p>
              <p className="mt-1 inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {formatRelativeDate(item.played_at)}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
