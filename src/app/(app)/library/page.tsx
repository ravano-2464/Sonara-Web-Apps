"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { useAudioController } from "@/features/audio/components/audio-runtime-provider";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { TrackList } from "@/features/tracks/components/track-list";
import { UploadTrackForm } from "@/features/tracks/components/upload-track-form";
import { useTracks } from "@/features/tracks/hooks/use-tracks";
import { useI18n } from "@/components/providers/i18n-provider";
import { useSessionUser } from "@/hooks/use-session-user";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";

const QUICK_GENRE_LIMIT = 8;

export default function LibraryPage() {
  const { t } = useI18n();
  const { user } = useSessionUser();
  const { playTrack } = useAudioController();

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const genreMenuRef = useRef<HTMLDivElement | null>(null);

  const { tracks, loading, error, refetch } = useTracks({ search, genre });
  const { favoriteTrackIds, toggleFavorite } = useFavorites(user?.id);

  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const genres = useMemo(() => {
    const unique = new Set<string>();
    tracks.forEach((track) => {
      if (track.genre) {
        unique.add(track.genre);
      }
    });
    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [tracks]);
  const quickGenres = useMemo(() => genres.slice(0, QUICK_GENRE_LIMIT), [genres]);
  const activeGenreLabel = genre === "all" ? t("library.allGenres") : genre;

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      if (!genreMenuRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (!genreMenuRef.current.contains(event.target)) {
        setIsGenreMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsGenreMenuOpen(false);
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
    <div className="space-y-5">
      <PageHeader
        title={t("library.title")}
        description={t("library.description")}
      />

      <UploadTrackForm userId={user?.id} onUploaded={refetch} />

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("library.searchPlaceholder")}
            aria-label={t("library.searchAria")}
          />
          <div ref={genreMenuRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isGenreMenuOpen}
              aria-label={t("library.filterByGenreAria")}
              onClick={() => setIsGenreMenuOpen((value) => !value)}
              className={cn(
                "inline-flex h-10 w-full items-center justify-between rounded-md border bg-zinc-950 px-3 text-sm transition-all duration-200",
                isGenreMenuOpen
                  ? "border-cyan-400/70 text-zinc-100 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                  : "border-zinc-700 text-zinc-100 hover:border-zinc-500",
              )}
            >
              <span className="truncate">{activeGenreLabel}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-400 transition-transform duration-200",
                  isGenreMenuOpen ? "rotate-180 text-cyan-300" : "",
                )}
              />
            </button>

            <div
              className={cn(
                "absolute right-0 top-full z-30 mt-2 w-full origin-top rounded-xl border border-zinc-700/80 bg-zinc-950/95 p-1 shadow-xl backdrop-blur-sm transition-all duration-150",
                isGenreMenuOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0",
              )}
            >
              <div className="max-h-64 overflow-y-auto sonara-scrollbar" role="listbox">
                {genres.map((entry) => {
                  const isActive = genre === entry;
                  const label = entry === "all" ? t("library.allGenres") : entry;

                  return (
                    <button
                      key={entry}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setGenre(entry);
                        setIsGenreMenuOpen(false);
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-cyan-500/20 text-cyan-200"
                          : "text-zinc-200 hover:bg-zinc-800/80 hover:text-zinc-100",
                      )}
                    >
                      <span className="truncate">{label}</span>
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 transition-opacity duration-150",
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickGenres.map((entry) => {
            const isActive = genre === entry;
            const label = entry === "all" ? t("library.allGenres") : entry;

            return (
              <button
                key={entry}
                type="button"
                onClick={() => setGenre(entry)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  isActive
                    ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-200"
                    : "border-zinc-700 bg-zinc-950/70 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100",
                )}
              >
                {label}
              </button>
            );
          })}

          {genres.length > QUICK_GENRE_LIMIT ? (
            <button
              type="button"
              onClick={() => setIsGenreMenuOpen(true)}
              className="rounded-full border border-zinc-700 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              {t("library.moreGenres")}
            </button>
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
          {t("library.loadingTracks")}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <TrackList
          tracks={tracks}
          activeTrackId={activeTrack?.id ?? null}
          isPlaying={isPlaying}
          favoriteTrackIds={favoriteTrackIds}
          onToggleFavorite={toggleFavorite}
          onPlayTrack={(track) => playTrack(track, tracks)}
          emptyMessage={t("library.emptyTracks")}
        />
      )}
    </div>
  );
}
