"use client";

import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";
import type { Track } from "@/types/models";

interface UseTracksOptions {
  search?: string;
  genre?: string;
}

export function useTracks({ search, genre }: UseTracksOptions = {}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    let query = supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (search && search.trim().length > 0) {
      const safeTerm = search.trim().replaceAll(",", " ");
      query = query.or(
        `title.ilike.%${safeTerm}%,artist.ilike.%${safeTerm}%,album.ilike.%${safeTerm}%,lyrics.ilike.%${safeTerm}%`,
      );
    }

    if (genre && genre !== "all") {
      query = query.eq("genre", genre);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(mapSupabaseErrorMessage(queryError.message));
      setTracks([]);
      setLoading(false);
      return;
    }

    setTracks(data ?? []);
    setLoading(false);
  }, [genre, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTracks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchTracks]);

  return {
    tracks,
    loading,
    error,
    refetch: fetchTracks,
  };
}
