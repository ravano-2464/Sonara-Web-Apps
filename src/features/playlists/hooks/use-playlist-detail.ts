"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";
import type { Playlist, PlaylistTrackWithTrack, Track } from "@/types/models";

interface UsePlaylistDetailResult {
  playlist: Playlist | null;
  tracks: PlaylistTrackWithTrack[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updatePlaylist: (name: string, description: string) => Promise<{ error: string | null }>;
  deletePlaylist: () => Promise<{ error: string | null }>;
  addTrack: (track: Track) => Promise<{ error: string | null }>;
  removeTrack: (trackId: string) => Promise<{ error: string | null }>;
  trackIds: string[];
}

export function usePlaylistDetail(
  playlistId: string,
  userId: string | undefined,
): UsePlaylistDetailResult {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrackWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    async (name: string, description: string) => {
      if (!playlist || !userId) {
        return { error: "Playlist not found." };
      }

      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("playlists")
        .update({
          name,
          description: description.trim() || null,
        })
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
      return { error: "Playlist not found." };
    }

    const supabase = getSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlist.id)
      .eq("user_id", userId);

    if (deleteError) {
      return { error: mapSupabaseErrorMessage(deleteError.message) };
    }

    return { error: null };
  }, [playlist, userId]);

  const addTrack = useCallback(
    async (track: Track) => {
      if (!playlist) {
        return { error: "Playlist not found." };
      }

      const supabase = getSupabaseBrowserClient();
      const nextPosition = tracks.length;

      const { error: insertError } = await supabase.from("playlist_tracks").insert({
        playlist_id: playlist.id,
        track_id: track.id,
        position: nextPosition,
      });

      if (insertError) {
        return { error: mapSupabaseErrorMessage(insertError.message) };
      }

      await fetchPlaylist();
      return { error: null };
    },
    [fetchPlaylist, playlist, tracks.length],
  );

  const removeTrack = useCallback(
    async (trackId: string) => {
      if (!playlist) {
        return { error: "Playlist not found." };
      }

      const supabase = getSupabaseBrowserClient();
      const { error: deleteError } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", playlist.id)
        .eq("track_id", trackId);

      if (deleteError) {
        return { error: mapSupabaseErrorMessage(deleteError.message) };
      }

      await fetchPlaylist();
      return { error: null };
    },
    [fetchPlaylist, playlist],
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
