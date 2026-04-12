"use client";

import type { Track } from "@/types/models";

interface AlbumGridProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

interface AlbumCardModel {
  album: string;
  artist: string;
  coverUrl: string | null;
  representativeTrack: Track;
  tracksCount: number;
}

function buildAlbumCards(tracks: Track[]): AlbumCardModel[] {
  const map = new Map<string, AlbumCardModel>();

  tracks.forEach((track) => {
    const albumName = track.album?.trim() || "Singles";
    const key = `${albumName}::${track.artist}`;

    const existing = map.get(key);

    if (existing) {
      existing.tracksCount += 1;
      return;
    }

    map.set(key, {
      album: albumName,
      artist: track.artist,
      coverUrl: track.cover_url,
      representativeTrack: track,
      tracksCount: 1,
    });
  });

  return Array.from(map.values());
}

export function AlbumGrid({ tracks, onSelectTrack }: AlbumGridProps) {
  const albums = buildAlbumCards(tracks).slice(0, 8);

  if (albums.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Albums
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {albums.map((album) => (
          <li key={`${album.album}-${album.artist}`}>
            <button
              type="button"
              onClick={() => onSelectTrack(album.representativeTrack)}
              className="group w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 text-left transition hover:border-cyan-400/70"
            >
              {album.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={album.coverUrl}
                  alt={`${album.album} cover`}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square w-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
              )}
              <div className="p-3">
                <p className="truncate text-sm font-medium text-zinc-100">{album.album}</p>
                <p className="truncate text-xs text-zinc-400">{album.artist}</p>
                <p className="mt-1 text-[11px] text-zinc-500">{album.tracksCount} tracks</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
