"use client";

import { useVisualizer } from "@/features/audio/hooks/use-visualizer";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export function AudioVisualizer({ analyser, isPlaying }: AudioVisualizerProps) {
  const { canvasRef } = useVisualizer({
    analyser,
    isActive: isPlaying,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60">
      <canvas ref={canvasRef} className="h-20 w-full" aria-label="Real-time audio visualizer" />
    </div>
  );
}
