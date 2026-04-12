"use client";

import { FileText, X } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import type { Track } from "@/types/models";

interface LyricsPanelProps {
  track: Track | null;
  onClose?: () => void;
}

export function LyricsPanel({ track, onClose }: LyricsPanelProps) {
  const { t } = useI18n();
  const lyrics = track?.lyrics?.trim();
  const headingText = track ? `${track.title} - ${track.artist}` : t("lyrics.noTrack");

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-100">{t("lyrics.title")}</h2>
          <span className="block truncate text-xs text-zinc-500">{headingText}</span>
        </div>
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

      <div className="sonara-scrollbar max-h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
        {lyrics ? (
          <p className="whitespace-pre-wrap text-xs leading-6 text-zinc-200">{lyrics}</p>
        ) : (
          <p className="text-xs text-zinc-500">
            {track ? t("lyrics.empty") : t("lyrics.noTrack")}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
        <FileText className="h-3.5 w-3.5" />
        <span>{t("lyrics.title")}</span>
      </div>
    </section>
  );
}
