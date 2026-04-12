"use client";

import { createElement, useCallback, useState } from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/providers/i18n-provider";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";

interface UploadPayload {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  lyrics?: string;
  audioFile: File;
  coverFile?: File;
}

interface UploadTrackResult {
  error: string | null;
  coverUrl: string | null;
  audioUrl: string | null;
}

const AUDIO_BUCKET = "track-audio";
const COVER_BUCKET = "track-covers";
const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "video/mp4",
]);
const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg", ".m4a", ".mp4"];
const TRACK_UPLOAD_TOAST_DURATION_MS = 5000;

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement("audio");

    audio.preload = "metadata";
    audio.src = url;

    const onLoaded = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const onError = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read audio metadata."));
    };

    audio.addEventListener("loadedmetadata", onLoaded, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

function isSupportedAudioFile(file: File) {
  const mimeType = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();

  if (mimeType && SUPPORTED_AUDIO_MIME_TYPES.has(mimeType)) {
    return true;
  }

  return SUPPORTED_AUDIO_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

function inferAudioContentType(file: File): string | undefined {
  if (file.type) {
    return file.type;
  }

  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".mp3")) return "audio/mpeg";
  if (lowerName.endsWith(".wav")) return "audio/wav";
  if (lowerName.endsWith(".ogg")) return "audio/ogg";
  if (lowerName.endsWith(".m4a")) return "audio/mp4";
  if (lowerName.endsWith(".mp4")) return "video/mp4";

  return undefined;
}

export function useTrackUpload(userId: string | undefined) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showUploadToast = useCallback(
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
            durationMs: TRACK_UPLOAD_TOAST_DURATION_MS,
          }),
        {
          duration: TRACK_UPLOAD_TOAST_DURATION_MS,
          className: "sonara-toast-shell",
        },
      );
    },
    [],
  );

  const uploadTrack = useCallback(
    async ({
      title,
      artist,
      album,
      genre,
      lyrics,
      audioFile,
      coverFile,
    }: UploadPayload): Promise<UploadTrackResult> => {
      if (!userId) {
        const message = t("upload.userMustSignIn");
        showUploadToast({
          title: t("upload.toastFailedTitle"),
          description: message,
          tone: "error",
        });
        return {
          error: message,
          coverUrl: null,
          audioUrl: null,
        };
      }

      setUploading(true);
      setError(null);

      try {
        const supabase = getSupabaseBrowserClient();
        const timestamp = Date.now();
        const safeAudioName = slugifyFileName(audioFile.name);
        const audioPath = `${userId}/${timestamp}-${safeAudioName}`;

        if (!isSupportedAudioFile(audioFile)) {
          const message = t("upload.unsupportedFormat");
          setError(message);
          showUploadToast({
            title: t("upload.toastFailedTitle"),
            description: message,
            tone: "error",
          });
          return {
            error: message,
            coverUrl: null,
            audioUrl: null,
          };
        }

        const duration = await readAudioDuration(audioFile);
        const audioContentType = inferAudioContentType(audioFile);

        const { error: audioUploadError } = await supabase.storage
          .from(AUDIO_BUCKET)
          .upload(audioPath, audioFile, {
            contentType: audioContentType,
            upsert: false,
          });

        if (audioUploadError) {
          const message = mapSupabaseErrorMessage(audioUploadError.message);
          setError(message);
          showUploadToast({
            title: t("upload.toastFailedTitle"),
            description: message,
            tone: "error",
          });
          return {
            error: message,
            coverUrl: null,
            audioUrl: null,
          };
        }

        const {
          data: { publicUrl: audioUrl },
        } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(audioPath);

        let coverUrl: string | null = null;

        if (coverFile) {
          const safeCoverName = slugifyFileName(coverFile.name);
          const coverPath = `${userId}/${timestamp}-${safeCoverName}`;

          const { error: coverUploadError } = await supabase.storage
            .from(COVER_BUCKET)
            .upload(coverPath, coverFile, {
              contentType: coverFile.type,
              upsert: false,
            });

          if (coverUploadError) {
            const message = mapSupabaseErrorMessage(coverUploadError.message);
            setError(message);
            showUploadToast({
              title: t("upload.toastFailedTitle"),
              description: message,
              tone: "error",
            });
            return {
              error: message,
              coverUrl: null,
              audioUrl: null,
            };
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from(COVER_BUCKET).getPublicUrl(coverPath);

          coverUrl = publicUrl;
        }

        const { error: insertError } = await supabase.from("tracks").insert({
          user_id: userId,
          title,
          artist,
          album: album?.trim() || null,
          genre: genre?.trim() || null,
          lyrics: lyrics?.trim() || null,
          duration,
          cover_url: coverUrl,
          audio_url: audioUrl,
        });

        if (insertError) {
          const message = mapSupabaseErrorMessage(insertError.message);
          setError(message);
          showUploadToast({
            title: t("upload.toastFailedTitle"),
            description: message,
            tone: "error",
          });
          return { error: message, coverUrl: null, audioUrl: null };
        }

        showUploadToast({
          title: t("upload.toastSuccessTitle"),
          description: t("upload.successDescription", { title }),
          tone: "success",
        });

        return { error: null, coverUrl, audioUrl };
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? mapSupabaseErrorMessage(caughtError.message)
            : t("upload.unexpectedError");
        setError(message);
        showUploadToast({
          title: t("upload.toastFailedTitle"),
          description: message,
          tone: "error",
        });
        return { error: message, coverUrl: null, audioUrl: null };
      } finally {
        setUploading(false);
      }
    },
    [showUploadToast, t, userId],
  );

  return {
    uploading,
    error,
    uploadTrack,
  };
}
