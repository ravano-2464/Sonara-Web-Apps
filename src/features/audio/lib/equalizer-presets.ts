import type { EqualizerBandMap } from "@/types/models";

export const EQ_BANDS = [60, 230, 910, 3600, 14000] as const;

export const EQ_MIN_GAIN = -12;
export const EQ_MAX_GAIN = 12;

export type EqualizerFrequency = (typeof EQ_BANDS)[number];

export const FLAT_BANDS: EqualizerBandMap = {
  60: 0,
  230: 0,
  910: 0,
  3600: 0,
  14000: 0,
};

export const EQUALIZER_PRESETS: Record<string, EqualizerBandMap> = {
  Flat: FLAT_BANDS,
  Pop: {
    60: -1,
    230: 2,
    910: 4,
    3600: 3,
    14000: 1,
  },
  Rock: {
    60: 4,
    230: 2,
    910: -1,
    3600: 2,
    14000: 4,
  },
  Jazz: {
    60: 2,
    230: 3,
    910: 1,
    3600: 3,
    14000: 2,
  },
  Classical: {
    60: 1,
    230: 0,
    910: -2,
    3600: 2,
    14000: 3,
  },
  "Bass Boost": {
    60: 8,
    230: 5,
    910: 1,
    3600: -2,
    14000: -2,
  },
};
