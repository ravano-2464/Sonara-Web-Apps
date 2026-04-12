"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import {
  EQ_BANDS,
  EQ_MAX_GAIN,
  EQ_MIN_GAIN,
  EQUALIZER_PRESETS,
} from "@/features/audio/lib/equalizer-presets";
import { useI18n } from "@/components/providers/i18n-provider";
import { useEqualizerStore } from "@/features/audio/stores/equalizer-store";
import { cn, formatFrequencyLabel } from "@/lib/utils";

interface EqualizerPanelProps {
  onClose?: () => void;
}

const CUSTOM_PRESET_VALUE = "Custom";

export function EqualizerPanel({ onClose }: EqualizerPanelProps) {
  const { t } = useI18n();
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const presetMenuRef = useRef<HTMLDivElement | null>(null);

  const bands = useEqualizerStore((state) => state.bands);
  const selectedPreset = useEqualizerStore((state) => state.selectedPreset);
  const outputDeviceType = useEqualizerStore((state) => state.outputDeviceType);
  const setBandGain = useEqualizerStore((state) => state.setBandGain);
  const applyPreset = useEqualizerStore((state) => state.applyPreset);
  const setCustomPreset = useEqualizerStore((state) => state.setCustomPreset);
  const reset = useEqualizerStore((state) => state.reset);
  const presetNames = useMemo(() => Object.keys(EQUALIZER_PRESETS), []);
  const activePresetName =
    selectedPreset in EQUALIZER_PRESETS ? selectedPreset : CUSTOM_PRESET_VALUE;
  const outputDeviceLabelKey =
    outputDeviceType === "headphone"
      ? "equalizer.outputHeadphone"
      : outputDeviceType === "speaker"
        ? "equalizer.outputSpeaker"
        : "equalizer.outputUnknown";

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      if (!presetMenuRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (!presetMenuRef.current.contains(event.target)) {
        setIsPresetMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPresetMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{t("equalizer.title")}</h2>
          <p className="mt-1 text-xs text-zinc-400">
            {t("equalizer.detectedOutput", { device: t(outputDeviceLabelKey) })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div ref={presetMenuRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isPresetMenuOpen}
              aria-label={t("equalizer.presetLabel")}
              onClick={() => setIsPresetMenuOpen((value) => !value)}
              className={cn(
                "inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-xs transition-all duration-200",
                isPresetMenuOpen
                  ? "border-cyan-400/70 bg-zinc-950 text-zinc-100 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                  : "border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-zinc-500",
              )}
            >
              <span className="truncate">
                {activePresetName === CUSTOM_PRESET_VALUE ? t("common.custom") : activePresetName}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                  isPresetMenuOpen ? "rotate-180 text-cyan-300" : "",
                )}
              />
            </button>

            <div
              className={cn(
                "absolute right-0 top-full z-30 mt-2 w-52 origin-top-right rounded-xl border border-zinc-700/80 bg-zinc-950/95 p-1 shadow-xl backdrop-blur-sm transition-all duration-150",
                isPresetMenuOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0",
              )}
            >
              <div className="max-h-64 overflow-y-auto sonara-scrollbar" role="listbox">
                {presetNames.map((preset) => {
                  const isActive = activePresetName === preset;

                  return (
                    <button
                      key={preset}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        applyPreset(preset);
                        setIsPresetMenuOpen(false);
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-cyan-500/20 text-cyan-200"
                          : "text-zinc-200 hover:bg-zinc-800/80 hover:text-zinc-100",
                      )}
                    >
                      <span className="truncate">{preset}</span>
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 transition-opacity duration-150",
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                        )}
                      />
                    </button>
                  );
                })}

                <div className="my-1 border-t border-zinc-800" />

                <button
                  type="button"
                  role="option"
                  aria-selected={activePresetName === CUSTOM_PRESET_VALUE}
                  onClick={() => {
                    setCustomPreset();
                    setIsPresetMenuOpen(false);
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    activePresetName === CUSTOM_PRESET_VALUE
                      ? "bg-cyan-500/20 text-cyan-200"
                      : "text-zinc-200 hover:bg-zinc-800/80 hover:text-zinc-100",
                  )}
                >
                  <span className="truncate">{t("common.custom")}</span>
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 transition-opacity duration-150",
                      activePresetName === CUSTOM_PRESET_VALUE
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-60",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-md border border-zinc-700 px-3 text-xs text-zinc-300 hover:border-cyan-400 hover:text-cyan-300"
          >
            {t("common.reset")}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="group inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-700 px-3 text-xs text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/70 hover:text-rose-300 active:translate-y-0 active:scale-95"
            >
              <X className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
              {t("common.close")}
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-h-[56vh] overflow-y-auto pr-1 sonara-scrollbar">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
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
                aria-label={t("equalizer.bandGainLabel", {
                  frequency: formatFrequencyLabel(frequency),
                })}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-400"
              />
              <span className="text-right text-xs text-zinc-500">
                {bands[frequency].toFixed(1)} dB
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
