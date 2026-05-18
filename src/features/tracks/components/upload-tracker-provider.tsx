"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type UploadTrackerStage =
  | "uploadingAudio"
  | "uploadingCover"
  | "savingTrack"
  | "completed"
  | "failed";

export interface UploadTrackerItem {
  id: string;
  trackTitle: string;
  stage: UploadTrackerStage;
  progressPercent: number;
  uploadedBytes: number;
  totalBytes: number;
  speedBytesPerSecond: number;
  startedAt: number;
  updatedAt: number;
  finishedAt: number | null;
  error: string | null;
}

interface StartUploadTrackingInput {
  trackTitle: string;
  totalBytes: number;
}

interface UpdateUploadTrackingInput {
  stage?: UploadTrackerStage;
  progressPercent?: number;
  uploadedBytes?: number;
  totalBytes?: number;
  speedBytesPerSecond?: number;
}

interface UploadTrackerContextValue {
  items: UploadTrackerItem[];
  activeCount: number;
  latestSpeedBytesPerSecond: number | null;
  startUploadTracking: (input: StartUploadTrackingInput) => string;
  updateUploadTracking: (id: string, input: UpdateUploadTrackingInput) => void;
  markUploadCompleted: (id: string) => void;
  markUploadFailed: (id: string, error: string) => void;
  clearFinishedUploads: () => void;
}

const MAX_UPLOAD_HISTORY = 20;

const UploadTrackerContext = createContext<UploadTrackerContextValue | null>(null);

function createTrackingId() {
  return `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

interface UploadTrackerProviderProps {
  children: React.ReactNode;
}

export function UploadTrackerProvider({ children }: UploadTrackerProviderProps) {
  const [items, setItems] = useState<UploadTrackerItem[]>([]);

  const startUploadTracking = useCallback(
    ({ trackTitle, totalBytes }: StartUploadTrackingInput) => {
      const id = createTrackingId();
      const now = Date.now();

      setItems((previous) => {
        const next: UploadTrackerItem = {
          id,
          trackTitle,
          stage: "uploadingAudio",
          progressPercent: 0,
          uploadedBytes: 0,
          totalBytes: Math.max(totalBytes, 0),
          speedBytesPerSecond: 0,
          startedAt: now,
          updatedAt: now,
          finishedAt: null,
          error: null,
        };

        return [next, ...previous].slice(0, MAX_UPLOAD_HISTORY);
      });

      return id;
    },
    [],
  );

  const updateUploadTracking = useCallback((id: string, input: UpdateUploadTrackingInput) => {
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          stage: input.stage ?? item.stage,
          progressPercent:
            input.progressPercent === undefined
              ? item.progressPercent
              : clampProgress(input.progressPercent),
          uploadedBytes: input.uploadedBytes ?? item.uploadedBytes,
          totalBytes: input.totalBytes ?? item.totalBytes,
          speedBytesPerSecond: input.speedBytesPerSecond ?? item.speedBytesPerSecond,
          updatedAt: Date.now(),
        };
      }),
    );
  }, []);

  const markUploadCompleted = useCallback((id: string) => {
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          stage: "completed",
          progressPercent: 100,
          uploadedBytes: item.totalBytes,
          speedBytesPerSecond: item.speedBytesPerSecond,
          updatedAt: Date.now(),
          finishedAt: Date.now(),
          error: null,
        };
      }),
    );
  }, []);

  const markUploadFailed = useCallback((id: string, error: string) => {
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          stage: "failed",
          updatedAt: Date.now(),
          finishedAt: Date.now(),
          error,
        };
      }),
    );
  }, []);

  const clearFinishedUploads = useCallback(() => {
    setItems((previous) =>
      previous.filter((item) => item.stage !== "completed" && item.stage !== "failed"),
    );
  }, []);

  const activeCount = useMemo(
    () => items.filter((item) => item.stage !== "completed" && item.stage !== "failed").length,
    [items],
  );

  const latestSpeedBytesPerSecond = useMemo(() => {
    const activeWithSpeed = items.find(
      (item) =>
        item.stage !== "completed" &&
        item.stage !== "failed" &&
        item.speedBytesPerSecond > 0,
    );

    if (activeWithSpeed) {
      return activeWithSpeed.speedBytesPerSecond;
    }

    const finishedWithSpeed = items.find((item) => item.speedBytesPerSecond > 0);
    return finishedWithSpeed ? finishedWithSpeed.speedBytesPerSecond : null;
  }, [items]);

  const value = useMemo<UploadTrackerContextValue>(
    () => ({
      items,
      activeCount,
      latestSpeedBytesPerSecond,
      startUploadTracking,
      updateUploadTracking,
      markUploadCompleted,
      markUploadFailed,
      clearFinishedUploads,
    }),
    [
      activeCount,
      clearFinishedUploads,
      items,
      latestSpeedBytesPerSecond,
      markUploadCompleted,
      markUploadFailed,
      startUploadTracking,
      updateUploadTracking,
    ],
  );

  return (
    <UploadTrackerContext.Provider value={value}>{children}</UploadTrackerContext.Provider>
  );
}

export function useUploadTracker() {
  const context = useContext(UploadTrackerContext);

  if (!context) {
    throw new Error("useUploadTracker must be used within UploadTrackerProvider.");
  }

  return context;
}
