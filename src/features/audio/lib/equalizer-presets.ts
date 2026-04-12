import type { EqualizerBandMap } from "@/types/models";
import type { OutputDeviceType } from "@/features/audio/lib/output-device";

export const EQ_BANDS = [
  20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
  1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 18000, 20000,
] as const;

export const EQ_MIN_GAIN = -12;
export const EQ_MAX_GAIN = 12;

export type EqualizerFrequency = (typeof EQ_BANDS)[number];
export const HEADPHONE_AUTO_PRESET_NAME = "Headphone Auto";
export const SPEAKER_AUTO_PRESET_NAME = "Speaker Auto";
export const OUTPUT_DEVICE_PRESET_NAME: Record<OutputDeviceType, string | null> = {
  headphone: HEADPHONE_AUTO_PRESET_NAME,
  speaker: SPEAKER_AUTO_PRESET_NAME,
  unknown: null,
};

type PresetAnchor = readonly [number, number];

function normalizeGain(gain: number) {
  const rounded = Number.parseFloat(gain.toFixed(1));
  return Math.min(Math.max(rounded, EQ_MIN_GAIN), EQ_MAX_GAIN);
}

function createBandMap(
  resolver: (frequency: EqualizerFrequency) => number,
): EqualizerBandMap {
  return EQ_BANDS.reduce((accumulator, frequency) => {
    accumulator[frequency] = normalizeGain(resolver(frequency));
    return accumulator;
  }, {} as EqualizerBandMap);
}

function createInterpolatedPreset(anchors: readonly PresetAnchor[]) {
  const sortedAnchors = [...anchors].sort((left, right) => left[0] - right[0]);

  return createBandMap((frequency) => {
    const firstAnchor = sortedAnchors[0];
    const lastAnchor = sortedAnchors[sortedAnchors.length - 1];

    if (!firstAnchor || !lastAnchor) {
      return 0;
    }

    if (frequency <= firstAnchor[0]) {
      return firstAnchor[1];
    }

    if (frequency >= lastAnchor[0]) {
      return lastAnchor[1];
    }

    for (let index = 1; index < sortedAnchors.length; index += 1) {
      const [endFrequency, endGain] = sortedAnchors[index];
      const [startFrequency, startGain] = sortedAnchors[index - 1];

      if (frequency > endFrequency) {
        continue;
      }

      const range = endFrequency - startFrequency;
      if (range <= 0) {
        return endGain;
      }

      const ratio = (frequency - startFrequency) / range;
      return startGain + (endGain - startGain) * ratio;
    }

    return 0;
  });
}

export const FLAT_BANDS: EqualizerBandMap = createBandMap(() => 0);

export const EQUALIZER_PRESETS: Record<string, EqualizerBandMap> = {
  Flat: FLAT_BANDS,
  Pop: createInterpolatedPreset([
    [20, -2],
    [80, 0],
    [250, 2.5],
    [1000, 4],
    [4000, 3.5],
    [10000, 2],
    [20000, 1],
  ]),
  Rock: createInterpolatedPreset([
    [20, 6],
    [63, 5],
    [250, 2],
    [1000, -1],
    [2500, 1],
    [8000, 4],
    [20000, 5],
  ]),
  Jazz: createInterpolatedPreset([
    [20, 1],
    [80, 2],
    [250, 3],
    [1000, 1.5],
    [4000, 3],
    [10000, 2.5],
    [20000, 2],
  ]),
  Classical: createInterpolatedPreset([
    [20, 0],
    [125, 1],
    [500, -1],
    [1000, -2],
    [2500, 1],
    [6300, 2.5],
    [16000, 3.5],
    [20000, 3],
  ]),
  "Bass Boost": createInterpolatedPreset([
    [20, 10],
    [63, 9],
    [125, 7],
    [250, 5],
    [500, 3],
    [1000, 1],
    [2500, 0],
    [6300, -1],
    [12500, -2],
    [20000, -2],
  ]),
  [HEADPHONE_AUTO_PRESET_NAME]: createInterpolatedPreset([
    [20, -1],
    [80, -0.5],
    [250, 0],
    [1000, 0],
    [2500, 1.5],
    [6300, 1.2],
    [12500, 0.8],
    [20000, 0.4],
  ]),
  [SPEAKER_AUTO_PRESET_NAME]: createInterpolatedPreset([
    [20, 2],
    [63, 2.5],
    [125, 2],
    [250, 1],
    [1000, 0],
    [2500, 1],
    [6300, 1.5],
    [12500, 1.8],
    [20000, 1.4],
  ]),
};
