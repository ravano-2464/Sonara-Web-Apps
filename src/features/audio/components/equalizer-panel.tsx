"use client";

import {
  EQ_BANDS,
  EQ_MAX_GAIN,
  EQ_MIN_GAIN,
  EQUALIZER_PRESETS,
} from "@/features/audio/lib/equalizer-presets";
import { useEqualizerStore } from "@/features/audio/stores/equalizer-store";
import { formatFrequencyLabel } from "@/lib/utils";

export function EqualizerPanel() {
  const bands = useEqualizerStore((state) => state.bands);
  const selectedPreset = useEqualizerStore((state) => state.selectedPreset);
  const setBandGain = useEqualizerStore((state) => state.setBandGain);
  const applyPreset = useEqualizerStore((state) => state.applyPreset);
  const reset = useEqualizerStore((state) => state.reset);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-100">5-Band Equalizer</h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="eq-preset">
            Equalizer preset
          </label>
          <select
            id="eq-preset"
            value={selectedPreset in EQUALIZER_PRESETS ? selectedPreset : "Custom"}
            onChange={(event) => {
              if (event.target.value !== "Custom") {
                applyPreset(event.target.value);
              }
            }}
            className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-100"
          >
            {Object.keys(EQUALIZER_PRESETS).map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
            <option value="Custom">Custom</option>
          </select>
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-md border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-cyan-400 hover:text-cyan-300"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {EQ_BANDS.map((frequency) => (
          <label
            key={frequency}
            className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2"
          >
            <span className="text-xs text-zinc-400">{formatFrequencyLabel(frequency)}</span>
            <input
              type="range"
              min={EQ_MIN_GAIN}
              max={EQ_MAX_GAIN}
              step={0.5}
              value={bands[frequency]}
              onChange={(event) =>
                setBandGain(frequency, Number.parseFloat(event.target.value))
              }
              aria-label={`${formatFrequencyLabel(frequency)} band gain`}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-400"
            />
            <span className="text-right text-xs text-zinc-500">
              {bands[frequency].toFixed(1)} dB
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
