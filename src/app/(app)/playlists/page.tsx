"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PlaylistList } from "@/features/playlists/components/playlist-list";
import { usePlaylists } from "@/features/playlists/hooks/use-playlists";
import { useSessionUser } from "@/hooks/use-session-user";

export default function PlaylistsPage() {
  const { user } = useSessionUser();
  const { playlists, loading, error, createPlaylist } = usePlaylists(user?.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Playlists"
        description="Create and manage playlists with custom track ordering."
      />

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
          Loading playlists...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <PlaylistList playlists={playlists} onCreate={createPlaylist} />
      )}
    </div>
  );
}
