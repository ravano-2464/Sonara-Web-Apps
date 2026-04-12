"use client";

import { create } from "zustand";

import {
  EQ_BANDS,
  EQUALIZER_PRESETS,
  FLAT_BANDS,
  OUTPUT_DEVICE_PRESET_NAME,
  type EqualizerFrequency,
} from "@/features/audio/lib/equalizer-presets";
import type { OutputDeviceType } from "@/features/audio/lib/output-device";
import type { EqualizerBandMap } from "@/types/models";

interface EqualizerStore {
  bands: EqualizerBandMap;
  selectedPreset: string;
  outputDeviceType: OutputDeviceType;
  setBandGain: (frequency: EqualizerFrequency, gain: number) => void;
  applyPreset: (presetName: string) => void;
  setCustomPreset: () => void;
  setOutputDeviceType: (outputDeviceType: OutputDeviceType) => void;
  applyOutputDevicePreset: (outputDeviceType: OutputDeviceType) => void;
  reset: () => void;
}

function cloneBandMap(bands: EqualizerBandMap): EqualizerBandMap {
  return EQ_BANDS.reduce((accumulator, frequency) => {
    accumulator[frequency] = bands[frequency];
    return accumulator;
  }, {} as EqualizerBandMap);
}

export const useEqualizerStore = create<EqualizerStore>((set) => ({
  bands: cloneBandMap(FLAT_BANDS),
  selectedPreset: "Flat",
  outputDeviceType: "unknown",
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
  setCustomPreset: () => {
    set({ selectedPreset: "Custom" });
  },
  setOutputDeviceType: (outputDeviceType) => {
    set({ outputDeviceType });
  },
  applyOutputDevicePreset: (outputDeviceType) => {
    const presetName = OUTPUT_DEVICE_PRESET_NAME[outputDeviceType];

    if (!presetName) {
      set({ outputDeviceType });
      return;
    }

    const preset = EQUALIZER_PRESETS[presetName];
    if (!preset) {
      set({ outputDeviceType });
      return;
    }

    set({
      outputDeviceType,
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
