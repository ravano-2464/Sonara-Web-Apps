"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface UseWaveformOptions {
  audioUrl: string | null;
  currentTime: number;
  onSeek: (nextTime: number) => void;
}

export function useWaveform({
  audioUrl,
  currentTime,
  onSeek,
}: UseWaveformOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const isReady = Boolean(audioUrl) && readyUrl === audioUrl;

  useEffect(() => {
    if (!containerRef.current || !audioUrl) {
      return;
    }

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      height: 56,
      waveColor: "#3f3f46",
      progressColor: "#22d3ee",
      cursorColor: "#67e8f9",
      barWidth: 2,
      barGap: 1,
      barRadius: 4,
      normalize: true,
      interact: true,
      dragToSeek: true,
    });

    waveSurferRef.current = waveSurfer;

    const unsubscribeReady = waveSurfer.on("ready", () => {
      setReadyUrl(audioUrl);
    });

    const unsubscribeInteraction = waveSurfer.on("interaction", (newTime) => {
      onSeek(newTime);
    });

    void waveSurfer.load(audioUrl);

    return () => {
      unsubscribeReady();
      unsubscribeInteraction();
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [audioUrl, onSeek]);

  useEffect(() => {
    if (!isReady || !waveSurferRef.current) {
      return;
    }

    waveSurferRef.current.setTime(currentTime);
  }, [currentTime, isReady]);

  return { containerRef, isReady };
}
