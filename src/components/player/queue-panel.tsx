"use client";

import { Music2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Track } from "@/types/models";

interface QueuePanelProps {
  queue: Track[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export function QueuePanel({ queue, currentIndex, onSelectIndex }: QueuePanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Queue</h2>
        <span className="text-xs text-zinc-500">{queue.length} tracks</span>
      </div>

      {queue.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-xs text-zinc-500">
          Your queue is empty.
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
