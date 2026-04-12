"use client";

import { Music2, X } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/models";

interface QueuePanelProps {
  queue: Track[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onClose?: () => void;
}

export function QueuePanel({
  queue,
  currentIndex,
  onSelectIndex,
  onClose,
}: QueuePanelProps) {
  const { t } = useI18n();

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{t("queue.title")}</h2>
          <span className="text-xs text-zinc-500">
            {t("queue.trackCount", { count: queue.length })}
          </span>
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

      {queue.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-xs text-zinc-500">
          {t("queue.empty")}
        </p>
      ) : (
        <ul className="sonara-scrollbar max-h-48 space-y-1 overflow-y-auto pr-1">
          {queue.map((track, index) => {
            const active = index === currentIndex;

            return (
              <li key={`${track.id}-${index}`}>
                <button
                  type="button"
                  onClick={() => onSelectIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left",
                    active
                      ? "bg-cyan-400/15 text-cyan-200"
                      : "text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  <Music2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-xs">{track.title}</span>
                  <span className="ml-auto truncate text-[11px] text-zinc-500">
                    {track.artist}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
