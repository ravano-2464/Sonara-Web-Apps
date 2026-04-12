"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ImageUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Playlist } from "@/types/models";

interface PlaylistListProps {
  playlists: Playlist[];
  onCreate: (
    name: string,
    description: string,
    coverFile?: File,
  ) => Promise<{ error: string | null }>;
}

export function PlaylistList({ playlists, onCreate }: PlaylistListProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const coverPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreviewRef.current) {
        URL.revokeObjectURL(coverPreviewRef.current);
        coverPreviewRef.current = null;
      }
    };
  }, []);

  const setCoverPreviewFromFile = (file: File | null) => {
    if (coverPreviewRef.current) {
      URL.revokeObjectURL(coverPreviewRef.current);
      coverPreviewRef.current = null;
    }

    if (!file) {
      setCoverPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    coverPreviewRef.current = objectUrl;
    setCoverPreviewUrl(objectUrl);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const result = await onCreate(name, description, coverFile ?? undefined);

    if (result.error) {
      setMessage(result.error);
      setSubmitting(false);
      return;
    }

    setName("");
    setDescription("");
    setCoverFile(null);
    setCoverPreviewFromFile(null);
    setMessage(t("playlistList.created"));
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
      >
        <h2 className="text-sm font-semibold text-zinc-100">{t("playlistList.createTitle")}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("playlistList.playlistName")}
          />
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("playlistList.descriptionPlaceholder")}
          />
        </div>
        <div className="mt-3">
          <input
            id="playlist-cover-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setCoverFile(file);
              setCoverPreviewFromFile(file);
            }}
          />
          <label
            htmlFor="playlist-cover-file"
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/70 px-3 py-4 text-center transition hover:border-cyan-400/70"
          >
            <ImageUp className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-200">
              {t("playlistList.coverImageOptional")}
            </span>
            <span className="max-w-full truncate text-[11px] text-zinc-500">
              {coverFile ? coverFile.name : t("playlistList.clickSelectCover")}
            </span>
          </label>
        </div>
        {coverPreviewUrl ? (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreviewUrl}
              alt="Playlist cover preview"
              className="h-12 w-12 rounded-md object-cover"
            />
            <p className="text-xs text-zinc-400">{t("upload.coverPreview")}</p>
          </div>
        ) : null}
        <div className="mt-3 flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? t("playlistList.creating") : t("playlistList.createButton")}
          </Button>
          {message ? <p className="text-xs text-zinc-400">{message}</p> : null}
        </div>
      </form>

      {playlists.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
          {t("playlistList.empty")}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Link
                href={`/playlists/${playlist.id}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-cyan-400/70"
              >
                {playlist.cover_url ? (
                  <div className="mb-3 overflow-hidden rounded-lg bg-zinc-950/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={playlist.cover_url}
                      alt={`${playlist.name} cover`}
                      className="h-36 w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-3 h-36 w-full rounded-lg bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-zinc-800/70" />
                )}
                <p className="text-sm font-semibold text-zinc-100">{playlist.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {playlist.description ?? t("playlistList.noDescription")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
