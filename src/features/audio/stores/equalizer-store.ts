"use client";

import { create } from "zustand";

import {
  EQUALIZER_PRESETS,
  FLAT_BANDS,
  type EqualizerFrequency,
} from "@/features/audio/lib/equalizer-presets";
import type { EqualizerBandMap } from "@/types/models";

interface EqualizerStore {
  bands: EqualizerBandMap;
  selectedPreset: string;
  setBandGain: (frequency: EqualizerFrequency, gain: number) => void;
  applyPreset: (presetName: string) => void;
  reset: () => void;
}

function cloneBandMap(bands: EqualizerBandMap): EqualizerBandMap {
  return {
    60: bands[60],
    230: bands[230],
    910: bands[910],
    3600: bands[3600],
    14000: bands[14000],
  };
}

export const useEqualizerStore = create<EqualizerStore>((set) => ({
  bands: cloneBandMap(FLAT_BANDS),
  selectedPreset: "Flat",
  setBandGain: (frequency, gain) =>
    set((state) => ({
      bands: { ...state.bands, [frequency]: gain },
      selectedPreset: "Custom",
    })),
  applyPreset: (presetName) => {
    const preset = EQUALIZER_PRESETS[presetName];

    if (!preset) {
      return;
    }

    set({
      bands: cloneBandMap(preset),
      selectedPreset: presetName,
    });
  },
  reset: () =>
    set({
      bands: cloneBandMap(FLAT_BANDS),
      selectedPreset: "Flat",
    }),
}));
