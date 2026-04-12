"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ImageUp, Music2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import { Input } from "@/components/ui/input";
import { extractAudioFileMetadata } from "@/features/tracks/lib/audio-file-metadata";
import { useTrackUpload } from "@/features/tracks/hooks/use-track-upload";

interface UploadTrackFormProps {
  userId: string | undefined;
  onUploaded: () => void;
}

export function UploadTrackForm({ userId, onUploaded }: UploadTrackFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);
  const [metadataDetected, setMetadataDetected] = useState(false);
  const [embeddedCoverDetected, setEmbeddedCoverDetected] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const coverPreviewRef = useRef<string | null>(null);
  const metadataRequestRef = useRef(0);
  const titleTouchedRef = useRef(false);
  const artistTouchedRef = useRef(false);
  const manualCoverSelectedRef = useRef(false);
  const embeddedCoverActiveRef = useRef(false);

  const { uploading, error, uploadTrack } = useTrackUpload(userId);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!audioFile) {
      setMessage(t("upload.selectAudioRequired"));
      return;
    }

    const result = await uploadTrack({
      title,
      artist,
      album,
      genre,
      audioFile,
      coverFile: coverFile ?? undefined,
    });

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage(t("upload.uploadSuccess"));
    setUploadedCoverUrl(result.coverUrl);
    setTitle("");
    setArtist("");
    setAlbum("");
    setGenre("");
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreviewFromFile(null);
    setMetadataDetected(false);
    setEmbeddedCoverDetected(false);
    titleTouchedRef.current = false;
    artistTouchedRef.current = false;
    manualCoverSelectedRef.current = false;
    embeddedCoverActiveRef.current = false;
    onUploaded();
  };

  const effectiveCoverPreview = coverPreviewUrl ?? uploadedCoverUrl;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
    >
      <h2 className="text-sm font-semibold text-zinc-100">{t("upload.title")}</h2>
      <p className="mt-1 text-xs text-zinc-400">
        {t("upload.subtitle")}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          required
          value={title}
          onChange={(event) => {
            titleTouchedRef.current = true;
            setTitle(event.target.value);
          }}
          placeholder={t("upload.trackTitle")}
          aria-label={t("upload.trackTitle")}
        />
        <Input
          required
          value={artist}
          onChange={(event) => {
            artistTouchedRef.current = true;
            setArtist(event.target.value);
          }}
          placeholder={t("upload.artist")}
          aria-label={t("upload.artist")}
        />
        <Input
          value={album}
          onChange={(event) => setAlbum(event.target.value)}
          placeholder={t("upload.album")}
          aria-label={t("upload.album")}
        />
        <Input
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          placeholder={t("upload.genre")}
          aria-label={t("upload.genre")}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <input
            id="audio-file"
            type="file"
            accept=".mp3,.wav,.ogg,.m4a,.mp4,audio/mpeg,audio/wav,audio/ogg,audio/mp4,video/mp4"
            required
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0] ?? null;
              setAudioFile(file);
              setUploadedCoverUrl(null);
              setMessage(null);
              setMetadataDetected(false);

              if (!file) {
                if (embeddedCoverActiveRef.current && !manualCoverSelectedRef.current) {
                  setCoverFile(null);
                  setCoverPreviewFromFile(null);
                  setEmbeddedCoverDetected(false);
                  embeddedCoverActiveRef.current = false;
                }
                return;
              }

              titleTouchedRef.current = false;
              artistTouchedRef.current = false;

              const requestId = metadataRequestRef.current + 1;
              metadataRequestRef.current = requestId;

              const metadata = await extractAudioFileMetadata(file);

              if (metadataRequestRef.current !== requestId) {
                return;
              }

              let hasDetectedText = false;

              if (!titleTouchedRef.current) {
                setTitle(metadata.title ?? "");
                hasDetectedText = hasDetectedText || Boolean(metadata.title);
              }

              if (!artistTouchedRef.current) {
                setArtist(metadata.artist ?? "");
                hasDetectedText = hasDetectedText || Boolean(metadata.artist);
              }

              setMetadataDetected(hasDetectedText);

              if (!manualCoverSelectedRef.current) {
                if (metadata.coverFile) {
                  setCoverFile(metadata.coverFile);
                  setCoverPreviewFromFile(metadata.coverFile);
                  setEmbeddedCoverDetected(true);
                  embeddedCoverActiveRef.current = true;
                } else if (embeddedCoverActiveRef.current) {
                  setCoverFile(null);
                  setCoverPreviewFromFile(null);
                  setEmbeddedCoverDetected(false);
                  embeddedCoverActiveRef.current = false;
                }
              }
            }}
          />
          <label
            htmlFor="audio-file"
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/70 px-3 py-4 text-center transition hover:border-cyan-400/70"
          >
            <Music2 className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-200">{t("upload.audioFile")}</span>
            <span className="max-w-full truncate text-[11px] text-zinc-500">
              {audioFile ? audioFile.name : t("upload.clickSelectAudio")}
            </span>
          </label>
        </div>

        <div>
          <input
            id="cover-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setUploadedCoverUrl(null);
              manualCoverSelectedRef.current = Boolean(file);
              embeddedCoverActiveRef.current = false;
              setEmbeddedCoverDetected(false);
              setCoverFile(file);
              setCoverPreviewFromFile(file);
            }}
          />
          <label
            htmlFor="cover-file"
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/70 px-3 py-4 text-center transition hover:border-cyan-400/70"
          >
            <ImageUp className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-200">{t("upload.coverImageOptional")}</span>
            <span className="max-w-full truncate text-[11px] text-zinc-500">
              {coverFile ? coverFile.name : t("upload.clickSelectCover")}
            </span>
          </label>
        </div>
      </div>

      {metadataDetected ? (
        <p className="mt-3 text-xs text-cyan-300">{t("upload.metadataDetectedHint")}</p>
      ) : null}
      {embeddedCoverDetected ? (
        <p className="mt-1 text-xs text-emerald-300">{t("upload.embeddedCoverHint")}</p>
      ) : null}

      {effectiveCoverPreview ? (
        <div className="mt-4 flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
          <p className="mb-2 text-center text-xs text-zinc-400">{t("upload.coverPreview")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={effectiveCoverPreview}
            alt="Cover preview"
            className="h-32 w-32 rounded-md object-cover"
          />
          {!coverPreviewUrl && uploadedCoverUrl ? (
            <p className="mt-2 text-center text-[11px] text-emerald-300">
              {t("upload.coverSaved")}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Button type="submit" disabled={uploading}>
          {uploading ? t("upload.uploading") : t("upload.uploadButton")}
        </Button>
        <p className="text-xs text-zinc-400">{t("upload.supportedFormats")}</p>
      </div>

      {message ? <p className="mt-2 text-center text-xs text-zinc-300">{message}</p> : null}
      {error ? <p className="mt-1 text-center text-xs text-rose-300">{error}</p> : null}
    </form>
  );
}
