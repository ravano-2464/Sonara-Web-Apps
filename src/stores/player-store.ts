"use client";

import { create } from "zustand";

import { clamp } from "@/lib/utils";
import type { Track } from "@/types/models";

export type RepeatMode = "off" | "all" | "one";

interface PlayerStore {
  queue: Track[];
  currentIndex: number;
  activeTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  isQueueOpen: boolean;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  setCurrentIndex: (index: number) => void;
  setPlaying: (value: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  toggleQueue: () => void;
  getNextIndex: () => number | null;
  getPreviousIndex: () => number | null;
  clearPlayer: () => void;
}

function getTrackAtIndex(queue: Track[], index: number) {
  if (index < 0 || index >= queue.length) {
    return null;
  }

  return queue[index] ?? null;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  queue: [],
  currentIndex: -1,
  activeTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  repeatMode: "off",
  shuffleEnabled: false,
  isQueueOpen: false,
  setQueue: (tracks, startIndex = 0) => {
    const safeIndex = tracks.length === 0 ? -1 : clamp(startIndex, 0, tracks.length - 1);

    set({
      queue: tracks,
      currentIndex: safeIndex,
      activeTrack: getTrackAtIndex(tracks, safeIndex),
      currentTime: 0,
      duration: 0,
    });
  },
  setCurrentIndex: (index) => {
    const { queue } = get();
    const safeIndex = clamp(index, -1, Math.max(-1, queue.length - 1));

    set({
      currentIndex: safeIndex,
      activeTrack: getTrackAtIndex(queue, safeIndex),
      currentTime: 0,
    });
  },
  setPlaying: (value) => set({ isPlaying: value }),
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setDuration: (duration) => set({ duration: Math.max(0, duration) }),
  setVolume: (volume) => set({ volume: clamp(volume, 0, 1) }),
  cycleRepeatMode: () => {
    const next: Record<RepeatMode, RepeatMode> = {
      off: "all",
      all: "one",
      one: "off",
    };

    set((state) => ({ repeatMode: next[state.repeatMode] }));
  },
  toggleShuffle: () => set((state) => ({ shuffleEnabled: !state.shuffleEnabled })),
  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
  getNextIndex: () => {
    const { queue, currentIndex, repeatMode, shuffleEnabled } = get();

    if (queue.length === 0 || currentIndex < 0) {
      return null;
    }

    if (repeatMode === "one") {
      return currentIndex;
    }

    if (shuffleEnabled && queue.length > 1) {
      let nextIndex = currentIndex;

      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }

      return nextIndex;
    }

    const sequential = currentIndex + 1;
    if (sequential < queue.length) {
      return sequential;
    }

    return repeatMode === "all" ? 0 : null;
  },
  getPreviousIndex: () => {
    const { queue, currentIndex, repeatMode } = get();

    if (queue.length === 0 || currentIndex < 0) {
      return null;
    }

    const previous = currentIndex - 1;

    if (previous >= 0) {
      return previous;
    }

    return repeatMode === "all" ? queue.length - 1 : null;
  },
  clearPlayer: () =>
    set({
      queue: [],
      currentIndex: -1,
      activeTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }),
}));
