"use client";

import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/providers/i18n-provider";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";
import type { Track } from "@/types/models";

const FAVORITES_TOAST_DURATION_MS = 5000;

interface FavoriteWithTrack {
  user_id: string;
  track_id: string;
  created_at: string;
  tracks: Track;
}

export function useFavorites(userId: string | undefined) {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<FavoriteWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showFavoritesToast = useCallback(
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
            durationMs: FAVORITES_TOAST_DURATION_MS,
          }),
        {
          duration: FAVORITES_TOAST_DURATION_MS,
          className: "sonara-toast-shell",
        },
      );
    },
    [],
  );

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: queryError } = await supabase
      .from("favorites")
      .select("user_id, track_id, created_at, tracks(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(mapSupabaseErrorMessage(queryError.message));
      setLoading(false);
      setFavorites([]);
      return;
    }

    setFavorites((data as unknown as FavoriteWithTrack[] | null) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchFavorites();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchFavorites]);

  const favoriteTrackIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.track_id)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (trackId: string, trackTitle?: string) => {
      if (!userId) {
        showFavoritesToast({
          title: t("favorites.toastFailedTitle"),
          description: t("favorites.userMustSignIn"),
          tone: "error",
        });
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const isFavorite = favoriteTrackIds.has(trackId);

      if (isFavorite) {
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("track_id", trackId);

        if (deleteError) {
          showFavoritesToast({
            title: t("favorites.toastFailedTitle"),
            description: mapSupabaseErrorMessage(deleteError.message),
            tone: "error",
          });
          return;
        }
      } else {
        const { error: insertError } = await supabase.from("favorites").insert({
          user_id: userId,
          track_id: trackId,
        });

        if (insertError) {
          showFavoritesToast({
            title: t("favorites.toastFailedTitle"),
            description: mapSupabaseErrorMessage(insertError.message),
            tone: "error",
          });
          return;
        }
      }

      await fetchFavorites();

      showFavoritesToast({
        title: t("favorites.toastSuccessTitle"),
        description: isFavorite
          ? t("favorites.removedDescription", {
              title: trackTitle ?? t("favorites.defaultTrackLabel"),
            })
          : t("favorites.addedDescription", {
              title: trackTitle ?? t("favorites.defaultTrackLabel"),
            }),
        tone: "success",
      });
    },
    [favoriteTrackIds, fetchFavorites, showFavoritesToast, t, userId],
  );

  return {
    favorites,
    favoriteTrackIds,
    loading,
    error,
    refetch: fetchFavorites,
    toggleFavorite,
  };
}
