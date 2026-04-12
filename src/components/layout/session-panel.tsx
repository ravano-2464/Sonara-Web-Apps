"use client";

import { LogOut, Menu, User2 } from "lucide-react";

import { LogoutConfirmModal } from "@/components/layout/logout-confirm-modal";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLogoutConfirm } from "@/hooks/use-logout-confirm";

interface SessionPanelProps {
  email?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function SessionPanel({
  email,
  sidebarOpen,
  onToggleSidebar,
}: SessionPanelProps) {
  const { open, setOpen, loading, confirmLogout } = useLogoutConfirm();

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 text-xs text-zinc-200 hover:bg-zinc-800 md:inline-flex"
        >
          <Menu className="h-3.5 w-3.5" />
          {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
            <User2 className="h-3.5 w-3.5 text-zinc-500" />
            <span className="max-w-48 truncate">{email ?? "Signed in"}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
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
