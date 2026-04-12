"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Playlist } from "@/types/models";

interface PlaylistListProps {
  playlists: Playlist[];
  onCreate: (name: string, description: string) => Promise<{ error: string | null }>;
}

export function PlaylistList({ playlists, onCreate }: PlaylistListProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const result = await onCreate(name, description);

    if (result.error) {
      setMessage(result.error);
      setSubmitting(false);
      return;
    }

    setName("");
    setDescription("");
    setMessage("Playlist created.");
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
      >
        <h2 className="text-sm font-semibold text-zinc-100">Create Playlist</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Playlist name"
          />
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
          {message ? <p className="text-xs text-zinc-400">{message}</p> : null}
        </div>
      </form>

      {playlists.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
          No playlists yet.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Link
                href={`/playlists/${playlist.id}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-cyan-400/70"
              >
                <p className="text-sm font-semibold text-zinc-100">{playlist.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {playlist.description ?? "No description"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
