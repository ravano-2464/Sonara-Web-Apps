"use client";

import { createElement, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/providers/i18n-provider";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";
import type { Playlist } from "@/types/models";

const PLAYLIST_TOAST_DURATION_MS = 5000;
const PLAYLIST_COVER_BUCKET = "track-covers";

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}

export function usePlaylists(userId: string | undefined) {
  const { t } = useI18n();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
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
            durationMs: PLAYLIST_TOAST_DURATION_MS,
          }),
        {
          duration: PLAYLIST_TOAST_DURATION_MS,
          className: "sonara-toast-shell",
        },
      );
    },
    [],
  );

  const fetchPlaylists = useCallback(async () => {
    if (!userId) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: queryError } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (queryError) {
      setError(mapSupabaseErrorMessage(queryError.message));
      setPlaylists([]);
      setLoading(false);
      return;
    }

    setPlaylists(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPlaylists();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchPlaylists]);

  const createPlaylist = useCallback(
    async (name: string, description: string, coverFile?: File) => {
      if (!userId) {
        const message = t("playlist.userNotFound");
        showPlaylistToast({
          title: t("playlist.toastFailedTitle"),
          description: message,
          tone: "error",
        });
        return { error: message };
      }

      const supabase = getSupabaseBrowserClient();
      let coverUrl: string | null = null;

      if (coverFile) {
        const timestamp = Date.now();
        const safeCoverName = slugifyFileName(coverFile.name);
        const coverPath = `${userId}/playlists/${timestamp}-${safeCoverName}`;

        const { error: coverUploadError } = await supabase.storage
          .from(PLAYLIST_COVER_BUCKET)
          .upload(coverPath, coverFile, {
            contentType: coverFile.type,
            upsert: false,
          });

        if (coverUploadError) {
          const message = mapSupabaseErrorMessage(coverUploadError.message);
          showPlaylistToast({
            title: t("playlist.toastFailedTitle"),
            description: message,
            tone: "error",
          });
          return { error: message };
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(PLAYLIST_COVER_BUCKET).getPublicUrl(coverPath);

        coverUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from("playlists").insert({
        user_id: userId,
        name,
        description: description.trim() || null,
        cover_url: coverUrl,
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

      await fetchPlaylists();
      showPlaylistToast({
        title: t("playlist.toastSuccessTitle"),
        description: t("playlist.createdDescription", { name }),
        tone: "success",
      });
      return { error: null };
    },
    [fetchPlaylists, showPlaylistToast, t, userId],
  );

  return {
    playlists,
    loading,
    error,
    refetch: fetchPlaylists,
    createPlaylist,
  };
}
