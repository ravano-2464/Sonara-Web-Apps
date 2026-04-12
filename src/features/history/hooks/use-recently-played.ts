"use client";

import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";
import type { Track } from "@/types/models";

export interface RecentlyPlayedWithTrack {
  user_id: string;
  track_id: string;
  played_at: string;
  tracks: Track;
}

export function useRecentlyPlayed(userId: string | undefined) {
  const [items, setItems] = useState<RecentlyPlayedWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentlyPlayed = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: queryError } = await supabase
      .from("recently_played")
      .select("user_id, track_id, played_at, tracks(*)")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(50);

    if (queryError) {
      setError(mapSupabaseErrorMessage(queryError.message));
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((data as unknown as RecentlyPlayedWithTrack[] | null) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchRecentlyPlayed();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchRecentlyPlayed]);

  const recordPlayback = useCallback(
    async (trackId: string) => {
      if (!userId) {
        return;
      }

      const supabase = getSupabaseBrowserClient();

      await supabase.from("recently_played").upsert(
        {
          user_id: userId,
          track_id: trackId,
          played_at: new Date().toISOString(),
        },
        { onConflict: "user_id,track_id" },
      );
    },
    [userId],
  );

  return {
    items,
    loading,
    error,
    refetch: fetchRecentlyPlayed,
    recordPlayback,
  };
}
