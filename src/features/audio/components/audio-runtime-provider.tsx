"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

import { usePlaybackShortcuts } from "@/features/audio/hooks/use-playback-shortcuts";
import { useAudioRuntime } from "@/features/audio/hooks/use-audio-runtime";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useSessionUser } from "@/hooks/use-session-user";
import type { Track } from "@/types/models";

interface AudioController {
  analyser: AnalyserNode | null;
  playTrack: (track: Track, queueOverride?: Track[]) => void;
  playTrackAtIndex: (index: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
}

const AudioRuntimeContext = createContext<AudioController | null>(null);

export function AudioRuntimeProvider({ children }: PropsWithChildren) {
  const { user } = useSessionUser();

  const recordRecentlyPlayed = useCallback(
    async (trackId: string) => {
      if (!user?.id) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      await supabase.from("recently_played").upsert(
        {
          user_id: user.id,
          track_id: trackId,
          played_at: new Date().toISOString(),
        },
        { onConflict: "user_id,track_id" },
      );
    },
    [user],
  );

  const runtime = useAudioRuntime({
    onTrackStarted: (track) => {
      void recordRecentlyPlayed(track.id);
    },
    onError: (message) => {
      console.error(message);
    },
  });

  usePlaybackShortcuts({
    onNext: runtime.playNext,
    onPrevious: runtime.playPrevious,
    onTogglePlayPause: runtime.togglePlayPause,
  });

  const value = useMemo<AudioController>(
    () => ({
      analyser: runtime.analyser,
      playTrack: runtime.playTrack,
      playTrackAtIndex: runtime.playTrackAtIndex,
      togglePlayPause: runtime.togglePlayPause,
      playNext: runtime.playNext,
      playPrevious: runtime.playPrevious,
      seekTo: runtime.seekTo,
    }),
    [
      runtime.analyser,
      runtime.playNext,
      runtime.playPrevious,
      runtime.playTrack,
      runtime.playTrackAtIndex,
      runtime.seekTo,
      runtime.togglePlayPause,
    ],
  );

  return (
    <AudioRuntimeContext.Provider value={value}>
      {children}
    </AudioRuntimeContext.Provider>
  );
}

export function useAudioController() {
  const context = useContext(AudioRuntimeContext);

  if (!context) {
    throw new Error("useAudioController must be used inside AudioRuntimeProvider.");
  }

  return context;
}
