"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";
import type { Track } from "@/types/models";

interface FavoriteWithTrack {
  user_id: string;
  track_id: string;
  created_at: string;
  tracks: Track;
}

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<FavoriteWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    async (trackId: string) => {
      if (!userId) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const isFavorite = favoriteTrackIds.has(trackId);

      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("track_id", trackId);
      } else {
        await supabase.from("favorites").insert({
          user_id: userId,
          track_id: trackId,
        });
      }

      await fetchFavorites();
    },
    [favoriteTrackIds, fetchFavorites, userId],
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
