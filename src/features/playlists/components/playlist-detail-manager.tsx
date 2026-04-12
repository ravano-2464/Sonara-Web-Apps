"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ImageUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { TrackList } from "@/features/tracks/components/track-list";
import { cn } from "@/lib/utils";
import type { Playlist, PlaylistTrackWithTrack, Track } from "@/types/models";

interface PlaylistDetailManagerProps {
  playlist: Playlist;
  playlistTracks: PlaylistTrackWithTrack[];
  allTracks: Track[];
  activeTrackId: string | null;
  isPlaying: boolean;
  favoriteTrackIds: Set<string>;
  onPlayTrack: (track: Track, index: number) => void;
  onToggleFavorite: (trackId: string, trackTitle?: string) => void;
  onUpdatePlaylist: (
    name: string,
    description: string,
    coverFile?: File,
  ) => Promise<{ error: string | null }>;
  onDeletePlaylist: () => Promise<{ error: string | null }>;
  onAddTrack: (track: Track) => Promise<{ error: string | null }>;
  onRemoveTrack: (trackId: string) => Promise<{ error: string | null }>;
}

export function PlaylistDetailManager({
  playlist,
  playlistTracks,
  allTracks,
  activeTrackId,
  isPlaying,
  favoriteTrackIds,
  onPlayTrack,
  onToggleFavorite,
  onUpdatePlaylist,
  onDeletePlaylist,
  onAddTrack,
  onRemoveTrack,
}: PlaylistDetailManagerProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description ?? "");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [isTrackMenuOpen, setIsTrackMenuOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const trackMenuRef = useRef<HTMLDivElement | null>(null);
  const coverPreviewRef = useRef<string | null>(null);

  const tracksInPlaylist = useMemo(
    () => playlistTracks.map((item) => item.tracks),
    [playlistTracks],
  );

  const tracksNotInPlaylist = useMemo(() => {
    const existingIds = new Set(playlistTracks.map((item) => item.track_id));
    return allTracks.filter((track) => !existingIds.has(track.id));
  }, [allTracks, playlistTracks]);

  const selectedTrackLabel = useMemo(() => {
    const selectedTrack = tracksNotInPlaylist.find((item) => item.id === selectedTrackId);
    return selectedTrack
      ? `${selectedTrack.title} - ${selectedTrack.artist}`
      : t("playlistDetail.selectTrack");
  }, [selectedTrackId, t, tracksNotInPlaylist]);

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      if (!trackMenuRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (!trackMenuRef.current.contains(event.target)) {
        setIsTrackMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTrackMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreviewRef.current) {
        URL.revokeObjectURL(coverPreviewRef.current);
        coverPreviewRef.current = null;
      }
    };
  }, []);

  const setCoverPreviewFromFile = (file: File | null) => {
    if (coverPreviewRef.current) {
      URL.revokeObjectURL(coverPreviewRef.current);
      coverPreviewRef.current = null;
    }

    if (!file) {
      setCoverPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    coverPreviewRef.current = objectUrl;
    setCoverPreviewUrl(objectUrl);
  };

  const effectiveCoverPreview = coverPreviewUrl ?? playlist.cover_url;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex items-start gap-3">
          {effectiveCoverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={effectiveCoverPreview}
              alt={`${playlist.name} cover`}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-cyan-500/35 via-blue-500/20 to-zinc-800/70" />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-zinc-100">{playlist.name}</h1>
            <p className="mt-1 text-xs text-zinc-400">
              {t("playlistDetail.editSubtitle")}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("playlistDetail.descriptionPlaceholder")}
          />
        </div>
        <div className="mt-3">
          <input
            id="playlist-detail-cover-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setCoverFile(file);
              setCoverPreviewFromFile(file);
            }}
          />
          <label
            htmlFor="playlist-detail-cover-file"
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/70 px-3 py-4 text-center transition hover:border-cyan-400/70"
          >
            <ImageUp className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-200">
              {t("playlistList.coverImageOptional")}
            </span>
            <span className="max-w-full truncate text-[11px] text-zinc-500">
              {coverFile ? coverFile.name : t("playlistList.clickSelectCover")}
            </span>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const result = await onUpdatePlaylist(name, description, coverFile ?? undefined);
              setMessage(
                result.error
                  ? t("playlistDetail.errorPrefix", { error: result.error })
                  : t("playlistDetail.updated"),
              );
              if (!result.error) {
                setCoverFile(null);
                setCoverPreviewFromFile(null);
              }
            }}
          >
            {t("common.saveChanges")}
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const result = await onDeletePlaylist();
              if (result.error) {
                setMessage(result.error);
                return;
              }

              router.push("/playlists");
            }}
          >
            {t("playlistDetail.deleted")}
          </Button>
          {message ? <p className="text-xs text-zinc-400">{message}</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">{t("playlistDetail.addTrackTitle")}</h2>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div ref={trackMenuRef} className="relative flex-1">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isTrackMenuOpen}
              aria-label={t("playlistDetail.selectTrack")}
              onClick={() => setIsTrackMenuOpen((value) => !value)}
              className={cn(
                "inline-flex h-10 w-full items-center justify-between rounded-md border bg-zinc-950 px-3 text-sm transition-all duration-200",
                isTrackMenuOpen
                  ? "border-cyan-400/70 text-zinc-100 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                  : "border-zinc-700 text-zinc-100 hover:border-zinc-500",
              )}
            >
              <span className="truncate">{selectedTrackLabel}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-400 transition-transform duration-200",
                  isTrackMenuOpen ? "rotate-180 text-cyan-300" : "",
                )}
              />
            </button>

            <div
              className={cn(
                "absolute right-0 top-full z-30 mt-2 w-full origin-top rounded-xl border border-zinc-700/80 bg-zinc-950/95 p-1 shadow-xl backdrop-blur-sm transition-all duration-150",
                isTrackMenuOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0",
              )}
            >
              <div className="sonara-scrollbar max-h-64 overflow-y-auto" role="listbox">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedTrackId === ""}
                  onClick={() => {
                    setSelectedTrackId("");
                    setIsTrackMenuOpen(false);
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    selectedTrackId === ""
                      ? "bg-cyan-500/20 text-cyan-200"
                      : "text-zinc-200 hover:bg-zinc-800/80 hover:text-zinc-100",
                  )}
                >
                  <span className="truncate">{t("playlistDetail.selectTrack")}</span>
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 transition-opacity duration-150",
                      selectedTrackId === "" ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                    )}
                  />
                </button>
                {tracksNotInPlaylist.map((track) => {
                  const value = `${track.title} - ${track.artist}`;
                  const isActive = selectedTrackId === track.id;

                  return (
                    <button
                      key={track.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setSelectedTrackId(track.id);
                        setIsTrackMenuOpen(false);
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-cyan-500/20 text-cyan-200"
                          : "text-zinc-200 hover:bg-zinc-800/80 hover:text-zinc-100",
                      )}
                    >
                      <span className="truncate">{value}</span>
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
          <Button
            variant="secondary"
            onClick={async () => {
              const track = tracksNotInPlaylist.find((item) => item.id === selectedTrackId);
              if (!track) {
                return;
              }

              const result = await onAddTrack(track);
              setMessage(
                result.error
                  ? t("playlistDetail.errorPrefix", { error: result.error })
                  : t("playlistDetail.trackAdded"),
              );
              setSelectedTrackId("");
              setIsTrackMenuOpen(false);
            }}
            className="sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("common.add")}
          </Button>
        </div>
      </section>

      <TrackList
        tracks={tracksInPlaylist}
        activeTrackId={activeTrackId}
        isPlaying={isPlaying}
        favoriteTrackIds={favoriteTrackIds}
        onPlayTrack={onPlayTrack}
        onToggleFavorite={onToggleFavorite}
        emptyMessage={t("playlistDetail.emptyTracks")}
        actionSlot={(track) => (
          <button
            type="button"
            onClick={async () => {
              const result = await onRemoveTrack(track.id);
              setMessage(
                result.error
                  ? t("playlistDetail.errorPrefix", { error: result.error })
                  : t("playlistDetail.trackRemoved"),
              );
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:text-rose-300"
            aria-label={t("playlistDetail.removeTrackAria")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      />
    </div>
  );
}
