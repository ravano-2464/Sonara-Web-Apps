"use client";

import { Heart, Pause, Play } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/models";

interface TrackListProps {
  tracks: Track[];
  activeTrackId: string | null;
  isPlaying: boolean;
  favoriteTrackIds?: Set<string>;
  onPlayTrack: (track: Track, index: number) => void;
  onToggleFavorite?: (trackId: string, trackTitle?: string) => void;
  emptyMessage?: string;
  actionSlot?: (track: Track) => ReactNode;
}

export function TrackList({
  tracks,
  activeTrackId,
  isPlaying,
  favoriteTrackIds,
  onPlayTrack,
  onToggleFavorite,
  emptyMessage,
  actionSlot,
}: TrackListProps) {
  const { t } = useI18n();
  const resolvedEmptyMessage = emptyMessage ?? t("trackList.emptyDefault");

  if (tracks.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
        {resolvedEmptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
      <ul className="divide-y divide-zinc-800">
        {tracks.map((track, index) => {
          const isActive = activeTrackId === track.id;
          const isFav = favoriteTrackIds?.has(track.id) ?? false;

          return (
            <li
              key={track.id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 sm:grid-cols-[auto_minmax(0,1fr)_140px_90px_auto]",
                isActive ? "bg-cyan-400/10" : "hover:bg-zinc-800/70",
              )}
            >
              <button
                type="button"
                onClick={() => onPlayTrack(track, index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-cyan-400 hover:text-cyan-300"
                aria-label={isActive && isPlaying ? t("trackList.pauseTrack") : t("trackList.playTrack")}
              >
                {isActive && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">{track.title}</p>
                <p className="truncate text-xs text-zinc-400">{track.artist}</p>
              </div>

              <p className="hidden truncate text-xs text-zinc-400 sm:block">
                {track.album ?? t("trackList.single")}
              </p>
              <p className="hidden text-xs text-zinc-500 sm:block">{formatDuration(track.duration)}</p>

              <div className="flex items-center gap-1">
                {onToggleFavorite ? (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(track.id, track.title)}
                    aria-label={isFav ? t("trackList.removeFavorite") : t("trackList.addFavorite")}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full",
                      isFav
                        ? "text-rose-400 hover:text-rose-300"
                        : "text-zinc-500 hover:text-zinc-200",
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isFav ? "fill-current" : "")} />
                  </button>
                ) : null}
                {actionSlot ? actionSlot(track) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
