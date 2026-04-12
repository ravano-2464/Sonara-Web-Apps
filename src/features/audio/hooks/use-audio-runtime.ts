"use client";

import { useCallback, useEffect } from "react";

import { audioEngine } from "@/features/audio/lib/audio-engine";
import { useEqualizerStore } from "@/features/audio/stores/equalizer-store";
import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/models";

interface UseAudioRuntimeOptions {
  onTrackStarted?: (track: Track) => void;
  onError?: (message: string) => void;
}

export function useAudioRuntime(options: UseAudioRuntimeOptions = {}) {
  const volume = usePlayerStore((state) => state.volume);
  const bands = useEqualizerStore((state) => state.bands);

  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);

  const syncTrackAtIndex = useCallback((index: number) => {
    const state = usePlayerStore.getState();
    const track = state.queue[index];

    if (!track) {
      return;
    }

    state.setCurrentIndex(index);
    audioEngine.playTrack(track);
    state.setPlaying(true);
  }, []);

  const playTrack = useCallback((track: Track, queueOverride?: Track[]) => {
    const state = usePlayerStore.getState();

    let queue = queueOverride ?? state.queue;
    let index = queue.findIndex((item) => item.id === track.id);

    if (queueOverride) {
      if (index < 0) {
        queue = [...queueOverride, track];
        index = queue.length - 1;
      }

      state.setQueue(queue, index);
    } else if (index < 0) {
      queue = [...state.queue, track];
      index = queue.length - 1;
      state.setQueue(queue, index);
    } else {
      state.setCurrentIndex(index);
    }

    audioEngine.playTrack(track);
    state.setPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    const state = usePlayerStore.getState();

    if (!state.activeTrack) {
      const fallbackIndex = state.currentIndex >= 0 ? state.currentIndex : 0;
      syncTrackAtIndex(fallbackIndex);
      return;
    }

    audioEngine.toggle();
    state.setPlaying(audioEngine.isPlaying());
  }, [syncTrackAtIndex]);

  const playNext = useCallback(() => {
    const state = usePlayerStore.getState();
    const nextIndex = state.getNextIndex();

    if (nextIndex === null) {
      audioEngine.pause();
      state.setPlaying(false);
      return;
    }

    syncTrackAtIndex(nextIndex);
  }, [syncTrackAtIndex]);

  const playPrevious = useCallback(() => {
    const state = usePlayerStore.getState();

    if (state.currentTime > 3) {
      audioEngine.seek(0);
      state.setCurrentTime(0);
      return;
    }

    const previousIndex = state.getPreviousIndex();

    if (previousIndex === null) {
      audioEngine.seek(0);
      state.setCurrentTime(0);
      return;
    }

    syncTrackAtIndex(previousIndex);
  }, [syncTrackAtIndex]);

  const seekTo = useCallback((time: number) => {
    audioEngine.seek(time);
  }, []);

  useEffect(() => {
    audioEngine.setCallbacks({
      onPlayStateChange: setPlaying,
      onTimeUpdate: (currentTime, duration) => {
        setCurrentTime(currentTime);
        setDuration(duration);
      },
      onTrackStarted: options.onTrackStarted,
      onTrackEnded: playNext,
      onError: options.onError,
    });

    return () => {
      audioEngine.setCallbacks({});
    };
  }, [options.onError, options.onTrackStarted, playNext, setCurrentTime, setDuration, setPlaying]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.setEqualizerGains(bands);
  }, [bands]);

  useEffect(() => {
    return () => {
      audioEngine.pause();
    };
  }, []);

  return {
    playTrack,
    playTrackAtIndex: syncTrackAtIndex,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    analyser: audioEngine.getAnalyser(),
  };
}
