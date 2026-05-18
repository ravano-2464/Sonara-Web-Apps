"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, LogOut, PanelLeftClose, PanelLeftOpen, Upload, User2 } from "lucide-react";

import { LanguageToggle } from "@/components/layout/language-toggle";
import { LogoutConfirmModal } from "@/components/layout/logout-confirm-modal";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  type UploadTrackerStage,
  useUploadTracker,
} from "@/features/tracks/components/upload-tracker-provider";
import { useLogoutConfirm } from "@/hooks/use-logout-confirm";

interface SessionPanelProps {
  username?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const UPLOAD_STAGE_LABEL_KEY: Record<
  UploadTrackerStage,
  | "upload.trackerStage.uploadingAudio"
  | "upload.trackerStage.uploadingCover"
  | "upload.trackerStage.savingTrack"
  | "upload.trackerStage.completed"
  | "upload.trackerStage.failed"
> = {
  uploadingAudio: "upload.trackerStage.uploadingAudio",
  uploadingCover: "upload.trackerStage.uploadingCover",
  savingTrack: "upload.trackerStage.savingTrack",
  completed: "upload.trackerStage.completed",
  failed: "upload.trackerStage.failed",
};

export function SessionPanel({
  username,
  sidebarOpen,
  onToggleSidebar,
}: SessionPanelProps) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [trackerOpen, setTrackerOpen] = useState(false);
  const trackerRef = useRef<HTMLDivElement | null>(null);
  const {
    items,
    activeCount,
    latestSpeedBytesPerSecond,
    clearFinishedUploads,
  } = useUploadTracker();
  const { open, setOpen, loading, confirmLogout } = useLogoutConfirm();

  const visibleItems = useMemo(() => items.slice(0, 5), [items]);
  const latestSpeedLabel = useMemo(() => {
    if (!latestSpeedBytesPerSecond || latestSpeedBytesPerSecond <= 0) {
      return null;
    }

    return formatUploadSpeed(latestSpeedBytesPerSecond);
  }, [latestSpeedBytesPerSecond]);

  useEffect(() => {
    if (!trackerOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!trackerRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (!trackerRef.current.contains(event.target)) {
        setTrackerOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTrackerOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [trackerOpen]);

  const openUploader = () => {
    const uploaderAnchor = "/library#upload-track-form";

    if (pathname !== "/library") {
      router.push(uploaderAnchor);
      return;
    }

    const target = document.getElementById("upload-track-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", "#upload-track-form");
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? t("session.closeSidebar") : t("session.openSidebar")}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 text-xs text-zinc-200 hover:bg-zinc-800 md:inline-flex"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          )}
          {sidebarOpen ? t("session.hideSidebar") : t("session.showSidebar")}
        </button>

        <div ref={trackerRef} className="relative ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openUploader}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            <Upload className="h-3.5 w-3.5" />
            {t("upload.topbarButton")}
          </button>
          <button
            type="button"
            onClick={() => setTrackerOpen((value) => !value)}
            aria-expanded={trackerOpen}
            aria-label={t("upload.trackerButton")}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            <Activity className="h-3.5 w-3.5" />
            {activeCount > 0
              ? t("upload.trackerActiveCount", { count: activeCount })
              : t("upload.trackerButton")}
            {latestSpeedLabel ? (
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-200">
                {latestSpeedLabel}
              </span>
            ) : null}
          </button>
          {trackerOpen ? (
            <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-zinc-700 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-100">{t("upload.trackerTitle")}</p>
                <button
                  type="button"
                  onClick={clearFinishedUploads}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200"
                >
                  {t("upload.trackerClearHistory")}
                </button>
              </div>

              {visibleItems.length === 0 ? (
                <p className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-400">
                  {t("upload.trackerEmpty")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {visibleItems.map((item) => {
                    const stageLabel = t(UPLOAD_STAGE_LABEL_KEY[item.stage]);

                    return (
                      <li key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-2">
                        <p className="truncate text-xs font-medium text-zinc-100">{item.trackTitle}</p>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-zinc-400">{stageLabel}</span>
                          <span className="text-zinc-300">{item.progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                          <span>{formatUploadSize(item.uploadedBytes)} / {formatUploadSize(item.totalBytes)}</span>
                          <span>{formatUploadSpeed(item.speedBytesPerSecond)}</span>
                        </div>
                        {item.error ? (
                          <p className="mt-1 truncate text-[11px] text-rose-300">{item.error}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}
          <LanguageToggle />
          <ThemeToggle />
          <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
            <User2 className="h-3.5 w-3.5 text-zinc-500" />
            <span className="max-w-48 truncate">{username ?? t("common.signedIn")}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("common.logout")}
          </button>
        </div>
      </div>

      <LogoutConfirmModal
        open={open}
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

function formatUploadSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatUploadSpeed(bytesPerSecond: number) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) {
    return "0 Mbps";
  }

  const megaBitsPerSecond = (bytesPerSecond * 8) / 1_000_000;

  if (megaBitsPerSecond >= 1) {
    return `${megaBitsPerSecond.toFixed(1)} Mbps`;
  }

  const kiloBitsPerSecond = (bytesPerSecond * 8) / 1000;
  return `${kiloBitsPerSecond.toFixed(0)} Kbps`;
}
