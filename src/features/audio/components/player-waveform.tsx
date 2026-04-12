"use client";

import { useWaveform } from "@/features/audio/hooks/use-waveform";

interface PlayerWaveformProps {
  audioUrl: string | null;
  currentTime: number;
  onSeek: (nextTime: number) => void;
}

export function PlayerWaveform({
  audioUrl,
  currentTime,
  onSeek,
}: PlayerWaveformProps) {
  const { containerRef } = useWaveform({
    audioUrl,
    currentTime,
    onSeek,
  });

  return (
    <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
      {audioUrl ? (
        <div ref={containerRef} className="h-14 w-full" />
      ) : (
        <p className="py-3 text-center text-xs text-zinc-500">No waveform available</p>
      )}
    </div>
  );
}
