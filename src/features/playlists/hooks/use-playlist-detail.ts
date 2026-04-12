"use client";

import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/providers/i18n-provider";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";
import type { Playlist, PlaylistTrackWithTrack, Track } from "@/types/models";

const PLAYLIST_DETAIL_TOAST_DURATION_MS = 5000;
const PLAYLIST_COVER_BUCKET = "track-covers";

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}

interface UsePlaylistDetailResult {
  playlist: Playlist | null;
  tracks: PlaylistTrackWithTrack[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updatePlaylist: (
    name: string,
    description: string,
    coverFile?: File,
  ) => Promise<{ error: string | null }>;
  deletePlaylist: () => Promise<{ error: string | null }>;
  addTrack: (track: Track) => Promise<{ error: string | null }>;
  removeTrack: (trackId: string) => Promise<{ error: string | null }>;
  trackIds: string[];
}

export function usePlaylistDetail(
  playlistId: string,
  userId: string | undefined,
): UsePlaylistDetailResult {
  const { t } = useI18n();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrackWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showPlaylistToast = useCallback(
    ({
      title,
      description,
      tone,
    }: {
      title: string;
      description: string;
      tone: "success" | "error" | "info";
    }) => {
      toast.custom(
        () =>
          createElement(AuthToastContent, {
            title,
            description,
            tone,
            durationMs: PLAYLIST_DETAIL_TOAST_DURATION_MS,
          }),
        {
          duration: PLAYLIST_DETAIL_TOAST_DURATION_MS,
          className: "sonara-toast-shell",
        },
      );
    },
    [],
  );

  const fetchPlaylist = useCallback(async () => {
    if (!playlistId || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    const [playlistResult, tracksResult] = await Promise.all([
      supabase
        .from("playlists")
        .select("*")
        .eq("id", playlistId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("playlist_tracks")
        .select("playlist_id, track_id, position, added_at, tracks(*)")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true }),
    ]);

    if (playlistResult.error) {
      setError(mapSupabaseErrorMessage(playlistResult.error.message));
      setLoading(false);
      return;
    }

    if (tracksResult.error) {
      setError(mapSupabaseErrorMessage(tracksResult.error.message));
      setLoading(false);
      return;
    }

    setPlaylist(playlistResult.data);
    setTracks((tracksResult.data as unknown as PlaylistTrackWithTrack[] | null) ?? []);
    setLoading(false);
  }, [playlistId, userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPlaylist();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchPlaylist]);

  const updatePlaylist = useCallback(
    async (name: string, description: string, coverFile?: File) => {
      if (!playlist || !userId) {
        return { error: "Playlist not found." };
      }

      const supabase = getSupabaseBrowserClient();
      let coverUrl: string | null | undefined;

      if (coverFile) {
        const timestamp = Date.now();
        const safeCoverName = slugifyFileName(coverFile.name);
        const coverPath = `${userId}/playlists/${playlist.id}-${timestamp}-${safeCoverName}`;

        const { error: coverUploadError } = await supabase.storage
          .from(PLAYLIST_COVER_BUCKET)
          .upload(coverPath, coverFile, {
            contentType: coverFile.type,
            upsert: false,
          });

        if (coverUploadError) {
          const message = mapSupabaseErrorMessage(coverUploadError.message);
          return { error: message };
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(PLAYLIST_COVER_BUCKET).getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      const updatePayload: {
        name: string;
        description: string | null;
        cover_url?: string | null;
      } = {
        name,
        description: description.trim() || null,
      };

      if (coverUrl !== undefined) {
        updatePayload.cover_url = coverUrl;
      }

      const { error: updateError } = await supabase
        .from("playlists")
        .update(updatePayload)
        .eq("id", playlist.id)
        .eq("user_id", userId);

      if (updateError) {
        return { error: mapSupabaseErrorMessage(updateError.message) };
      }

      await fetchPlaylist();
      return { error: null };
    },
    [fetchPlaylist, playlist, userId],
  );

  const deletePlaylist = useCallback(async () => {
    if (!playlist || !userId) {
      const message = t("playlistDetail.notFound");
      showPlaylistToast({
        title: t("playlist.toastFailedTitle"),
        description: message,
        tone: "error",
      });
      return { error: message };
    }

    const supabase = getSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlist.id)
      .eq("user_id", userId);

    if (deleteError) {
      const message = mapSupabaseErrorMessage(deleteError.message);
      showPlaylistToast({
        title: t("playlist.toastFailedTitle"),
        description: message,
        tone: "error",
      });
      return { error: message };
    }

    showPlaylistToast({
      title: t("playlist.toastSuccessTitle"),
      description: t("playlist.deletedDescription", { name: playlist.name }),
      tone: "success",
    });

    return { error: null };
  }, [playlist, showPlaylistToast, t, userId]);

  const addTrack = useCallback(
    async (track: Track) => {
      if (!playlist) {
        const message = t("playlistDetail.notFound");
        showPlaylistToast({
          title: t("playlist.toastFailedTitle"),
          description: message,
          tone: "error",
        });
        return { error: message };
      }

      const supabase = getSupabaseBrowserClient();
      const nextPosition = tracks.length;

      const { error: insertError } = await supabase.from("playlist_tracks").insert({
        playlist_id: playlist.id,
        track_id: track.id,
        position: nextPosition,
      });

      if (insertError) {
        const message = mapSupabaseErrorMessage(insertError.message);
        showPlaylistToast({
          title: t("playlist.toastFailedTitle"),
          description: message,
          tone: "error",
        });
        return { error: message };
      }

      await fetchPlaylist();
      showPlaylistToast({
        title: t("playlist.toastSuccessTitle"),
        description: t("playlist.trackAddedDescription", { title: track.title }),
        tone: "success",
      });
      return { error: null };
    },
    [fetchPlaylist, playlist, showPlaylistToast, t, tracks.length],
  );

  const removeTrack = useCallback(
    async (trackId: string) => {
      if (!playlist) {
        const message = t("playlistDetail.notFound");
        showPlaylistToast({
          title: t("playlist.toastFailedTitle"),
          description: message,
          tone: "error",
        });
        return { error: message };
      }

      const supabase = getSupabaseBrowserClient();
      const removedTrackTitle = tracks.find((item) => item.track_id === trackId)?.tracks.title;
      const { error: deleteError } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", playlist.id)
        .eq("track_id", trackId);

      if (deleteError) {
        const message = mapSupabaseErrorMessage(deleteError.message);
        showPlaylistToast({
          title: t("playlist.toastFailedTitle"),
          description: message,
          tone: "error",
        });
        return { error: message };
      }

      await fetchPlaylist();
      showPlaylistToast({
        title: t("playlist.toastSuccessTitle"),
        description: t("playlist.trackRemovedDescription", {
          title: removedTrackTitle ?? t("playlist.defaultTrackLabel"),
        }),
        tone: "success",
      });
      return { error: null };
    },
    [fetchPlaylist, playlist, showPlaylistToast, t, tracks],
  );

  const trackIds = useMemo(() => tracks.map((item) => item.track_id), [tracks]);

  return {
    playlist,
    tracks,
    loading,
    error,
    refetch: fetchPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrack,
    removeTrack,
    trackIds,
  };
}
