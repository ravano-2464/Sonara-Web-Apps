"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LogoutConfirmModalProps {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  open,
  loading,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 backdrop-blur-sm transition-opacity duration-200 ease-out ${
        open ? "bg-black/55 opacity-100" : "pointer-events-none bg-black/0 opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-labelledby="logout-confirm-title"
      aria-describedby="logout-confirm-description"
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-950/95 p-5 shadow-2xl shadow-black/80 transition-all duration-200 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex size-9 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
            <AlertTriangle className="size-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex size-7 items-center justify-center rounded-md border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
            aria-label="Close logout confirmation"
          >
            <X className="size-4" />
          </button>
        </div>

        <h2 id="logout-confirm-title" className="mt-3 text-base font-semibold text-zinc-100">
          Confirm Logout
        </h2>
        <p id="logout-confirm-description" className="mt-1 text-sm text-zinc-400">
          Kamu yakin ingin logout dari akun ini?
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-4 animate-spin" />
                Logging out...
              </span>
            ) : (
              "Ya, Logout"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
