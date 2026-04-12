"use client";

import { useEffect, useRef } from "react";

import { usePlayerStore } from "@/stores/player-store";

interface PlaybackShortcutOptions {
  onTogglePlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function usePlaybackShortcuts({
  onTogglePlayPause,
  onNext,
  onPrevious,
}: PlaybackShortcutOptions) {
  const lastVolumeRef = useRef(0.8);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      const isTyping =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable;

      if (isTyping) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        onTogglePlayPause();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.code === "ArrowRight") {
        event.preventDefault();
        onNext();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.code === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
        return;
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        const { volume, setVolume } = usePlayerStore.getState();

        if (volume > 0) {
          lastVolumeRef.current = volume;
          setVolume(0);
        } else {
          setVolume(lastVolumeRef.current || 0.8);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onNext, onPrevious, onTogglePlayPause]);
}
