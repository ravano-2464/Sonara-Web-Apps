"use client";

import { createElement, useCallback, useState } from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/providers/i18n-provider";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { useUploadTracker } from "@/features/tracks/components/upload-tracker-provider";
import { env } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";

interface UploadPayload {
  title: string;
  artist: string;
  isPublic: boolean;
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

interface UploadProgressSnapshot {
  loadedBytes: number;
  totalBytes: number;
  speedBytesPerSecond: number;
}

function encodeStorageObjectPath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function uploadFileWithProgress({
  bucket,
  path,
  file,
  contentType,
  accessToken,
  onProgress,
}: {
  bucket: string;
  path: string;
  file: File;
  contentType?: string;
  accessToken: string;
  onProgress?: (snapshot: UploadProgressSnapshot) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const startedAt = performance.now();
    const objectPath = encodeStorageObjectPath(path);
    const url = `${env.supabaseUrl()}/storage/v1/object/${bucket}/${objectPath}`;
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", env.supabaseAnonKey());
    xhr.setRequestHeader("x-upsert", "false");

    if (contentType) {
      xhr.setRequestHeader("content-type", contentType);
    }

    xhr.upload.onprogress = (event) => {
      const loadedBytes = event.loaded;
      const totalBytes = event.lengthComputable ? event.total : file.size;
      const elapsedSeconds = Math.max((performance.now() - startedAt) / 1000, 0.05);
      const speedBytesPerSecond = loadedBytes / elapsedSeconds;

      onProgress?.({
        loadedBytes,
        totalBytes,
        speedBytesPerSecond,
      });
    };

    xhr.onerror = () => reject(new Error("Network error while uploading file."));

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      let message = `Upload failed (${xhr.status}).`;

      if (xhr.responseText) {
        try {
          const parsed = JSON.parse(xhr.responseText) as { error?: string; message?: string };
          message = parsed.message ?? parsed.error ?? message;
        } catch {
          // Ignore JSON parsing failures and keep generic message.
        }
      }

      reject(new Error(message));
    };

    xhr.send(file);
  });
}

export function useTrackUpload(userId: string | undefined, uploaderName?: string | null) {
  const { t } = useI18n();
  const {
    startUploadTracking,
    updateUploadTracking,
    markUploadCompleted,
    markUploadFailed,
  } = useUploadTracker();
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
      isPublic,
      album,
      genre,
      lyrics,
      audioFile,
      coverFile,
    }: UploadPayload): Promise<UploadTrackResult> => {
      const totalUploadBytes = audioFile.size + (coverFile?.size ?? 0);
      const trackingId = startUploadTracking({
        trackTitle: title,
        totalBytes: totalUploadBytes,
      });

      if (!userId) {
        const message = t("upload.userMustSignIn");
        markUploadFailed(trackingId, message);
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
        const uploadStartedAt = performance.now();
        let transferredBytesBeforeCurrentFile = 0;

        if (!isSupportedAudioFile(audioFile)) {
          const message = t("upload.unsupportedFormat");
          setError(message);
          markUploadFailed(trackingId, message);
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          const message = t("upload.userMustSignIn");
          setError(message);
          markUploadFailed(trackingId, message);
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

        updateUploadTracking(trackingId, {
          stage: "uploadingAudio",
          progressPercent: 0,
          uploadedBytes: 0,
          totalBytes: totalUploadBytes,
          speedBytesPerSecond: 0,
        });

        await uploadFileWithProgress({
          bucket: AUDIO_BUCKET,
          path: audioPath,
          file: audioFile,
          contentType: audioContentType,
          accessToken,
          onProgress: ({ loadedBytes, speedBytesPerSecond }) => {
            const uploadedBytes = transferredBytesBeforeCurrentFile + loadedBytes;
            const progressPercent =
              totalUploadBytes > 0 ? (uploadedBytes / totalUploadBytes) * 100 : 0;

            updateUploadTracking(trackingId, {
              stage: "uploadingAudio",
              uploadedBytes,
              totalBytes: totalUploadBytes,
              progressPercent,
              speedBytesPerSecond,
            });
          },
        });

        transferredBytesBeforeCurrentFile += audioFile.size;
        const audioElapsedSeconds = Math.max((performance.now() - uploadStartedAt) / 1000, 0.05);
        const audioAverageSpeed = transferredBytesBeforeCurrentFile / audioElapsedSeconds;

        updateUploadTracking(trackingId, {
          stage: coverFile ? "uploadingCover" : "savingTrack",
          uploadedBytes: transferredBytesBeforeCurrentFile,
          totalBytes: totalUploadBytes,
          progressPercent: totalUploadBytes > 0 ? (transferredBytesBeforeCurrentFile / totalUploadBytes) * 100 : 100,
          speedBytesPerSecond: audioAverageSpeed,
        });

        const {
          data: { publicUrl: audioUrl },
        } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(audioPath);

        let coverUrl: string | null = null;

        if (coverFile) {
          const safeCoverName = slugifyFileName(coverFile.name);
          const coverPath = `${userId}/${timestamp}-${safeCoverName}`;

          const coverUploadStartedAt = performance.now();

          await uploadFileWithProgress({
            bucket: COVER_BUCKET,
            path: coverPath,
            file: coverFile,
            contentType: coverFile.type,
            accessToken,
            onProgress: ({ loadedBytes, speedBytesPerSecond }) => {
              const uploadedBytes = transferredBytesBeforeCurrentFile + loadedBytes;
              const progressPercent =
                totalUploadBytes > 0 ? (uploadedBytes / totalUploadBytes) * 100 : 0;

              updateUploadTracking(trackingId, {
                stage: "uploadingCover",
                uploadedBytes,
                totalBytes: totalUploadBytes,
                progressPercent,
                speedBytesPerSecond,
              });
            },
          });
          transferredBytesBeforeCurrentFile += coverFile.size;

          const coverElapsedSeconds = Math.max(
            (performance.now() - coverUploadStartedAt) / 1000,
            0.05,
          );
          const coverAverageSpeed = coverFile.size / coverElapsedSeconds;

          updateUploadTracking(trackingId, {
            stage: "savingTrack",
            uploadedBytes: transferredBytesBeforeCurrentFile,
            totalBytes: totalUploadBytes,
            progressPercent:
              totalUploadBytes > 0
                ? (transferredBytesBeforeCurrentFile / totalUploadBytes) * 100
                : 100,
            speedBytesPerSecond: coverAverageSpeed,
          });

          const {
            data: { publicUrl },
          } = supabase.storage.from(COVER_BUCKET).getPublicUrl(coverPath);

          coverUrl = publicUrl;
        }

        const { error: insertError } = await supabase.from("tracks").insert({
          user_id: userId,
          uploader_name: uploaderName?.trim() || null,
          is_public: isPublic,
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
          markUploadFailed(trackingId, message);
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

        const totalElapsedSeconds = Math.max((performance.now() - uploadStartedAt) / 1000, 0.05);
        const averageSpeedBytesPerSecond = totalUploadBytes / totalElapsedSeconds;

        updateUploadTracking(trackingId, {
          stage: "completed",
          progressPercent: 100,
          uploadedBytes: totalUploadBytes,
          totalBytes: totalUploadBytes,
          speedBytesPerSecond: averageSpeedBytesPerSecond,
        });
        markUploadCompleted(trackingId);

        return { error: null, coverUrl, audioUrl };
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? mapSupabaseErrorMessage(caughtError.message)
            : t("upload.unexpectedError");
        setError(message);
        markUploadFailed(trackingId, message);
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
    [
      markUploadCompleted,
      markUploadFailed,
      showUploadToast,
      startUploadTracking,
      t,
      updateUploadTracking,
      uploaderName,
      userId,
    ],
  );

  return {
    uploading,
    error,
    uploadTrack,
  };
}
