"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { LyricsPanel } from "@/components/player/lyrics-panel";
import { QueuePanel } from "@/components/player/queue-panel";
import { AudioVisualizer } from "@/features/audio/components/audio-visualizer";
import { EqualizerPanel } from "@/features/audio/components/equalizer-panel";
import { PlayerWaveform } from "@/features/audio/components/player-waveform";
import { useAudioController } from "@/features/audio/components/audio-runtime-provider";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";

export function PlayerBar() {
  const { t } = useI18n();
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const shuffleEnabled = usePlayerStore((state) => state.shuffleEnabled);
  const isQueueOpen = usePlayerStore((state) => state.isQueueOpen);

  const setVolume = usePlayerStore((state) => state.setVolume);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const toggleQueue = usePlayerStore((state) => state.toggleQueue);

  const { analyser, playNext, playPrevious, playTrackAtIndex, seekTo, togglePlayPause } =
    useAudioController();

  const repeatLabel = useMemo(() => {
    if (repeatMode === "off") {
      return t("player.repeatOff");
    }

    if (repeatMode === "all") {
      return t("player.repeatAll");
    }

    return t("player.repeatOne");
  }, [repeatMode, t]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      {showEqualizer || showLyrics || isQueueOpen ? (
        <div className="grid gap-3 border-b border-zinc-800 px-3 py-3 md:grid-cols-3 md:px-6">
          {showEqualizer ? <EqualizerPanel onClose={() => setShowEqualizer(false)} /> : null}
          {showLyrics ? (
            <LyricsPanel track={activeTrack} onClose={() => setShowLyrics(false)} />
          ) : null}
          {isQueueOpen ? (
            <QueuePanel
              queue={queue}
              currentIndex={currentIndex}
              onSelectIndex={playTrackAtIndex}
              onClose={toggleQueue}
            />
          ) : null}
          <div
            className={cn(
              "md:col-span-3",
              !showEqualizer && !showLyrics && !isQueueOpen ? "hidden" : "",
            )}
          >
            <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 px-3 py-3 md:grid-cols-[260px_minmax(0,1fr)_220px] md:items-center md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {activeTrack?.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeTrack.cover_url}
              alt={`${activeTrack.title} cover`}
              className="h-12 w-12 rounded-md object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-md bg-gradient-to-br from-cyan-500/40 to-blue-500/30" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">
              {activeTrack?.title ?? t("player.noTrackSelected")}
            </p>
            <p className="truncate text-xs text-zinc-400">{activeTrack?.artist ?? "-"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label={t("player.toggleShuffle")}
              onClick={toggleShuffle}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full",
                shuffleEnabled
                  ? "text-cyan-300"
                  : "text-zinc-500 hover:text-zinc-200",
              )}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={playPrevious}
              aria-label={t("player.previousTrack")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? t("player.pause") : t("player.play")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={playNext}
              aria-label={t("player.nextTrack")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={repeatLabel}
              title={repeatLabel}
              onClick={cycleRepeatMode}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full",
                repeatMode !== "off"
                  ? "text-cyan-300"
                  : "text-zinc-500 hover:text-zinc-200",
              )}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-10 text-right text-xs text-zinc-500">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-400"
              aria-label={t("player.seek")}
            />
            <span className="w-10 text-xs text-zinc-500">{formatDuration(duration)}</span>
          </div>

          <PlayerWaveform
            audioUrl={activeTrack?.audio_url ?? null}
            currentTime={currentTime}
            onSeek={seekTo}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowEqualizer((value) => !value)}
            aria-label={t("player.toggleEqualizer")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full",
              showEqualizer ? "text-cyan-300" : "text-zinc-500 hover:text-zinc-200",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleQueue}
            aria-label={t("player.toggleQueue")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full",
              isQueueOpen ? "text-cyan-300" : "text-zinc-500 hover:text-zinc-200",
            )}
          >
            <ListMusic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowLyrics((value) => !value)}
            aria-label={t("player.toggleLyrics")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full",
              showLyrics ? "text-cyan-300" : "text-zinc-500 hover:text-zinc-200",
            )}
          >
            <FileText className="h-4 w-4" />
          </button>
          <Volume2 className="h-4 w-4 text-zinc-500" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label={t("player.volume")}
            className="h-2 w-24 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}
