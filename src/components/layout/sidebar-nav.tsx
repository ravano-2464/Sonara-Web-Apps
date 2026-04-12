"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock3,
  Heart,
  Home,
  Library,
  ListMusic,
  LogOut,
  Music2,
} from "lucide-react";

import { LogoutConfirmModal } from "@/components/layout/logout-confirm-modal";
import { useLogoutConfirm } from "@/hooks/use-logout-confirm";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/recently-played", label: "Recently Played", icon: Clock3 },
];

interface SidebarNavProps {
  username?: string;
  desktopOpen: boolean;
}

export function SidebarNav({ username, desktopOpen }: SidebarNavProps) {
  const pathname = usePathname();
  const { open, setOpen, loading, confirmLogout } = useLogoutConfirm();

  return (
    <>
      <aside
        className={cn(
          "sonara-scrollbar hidden border-r border-zinc-800 bg-zinc-950/70 md:flex md:flex-col md:overflow-y-auto md:transition-all md:duration-300 md:ease-out",
          desktopOpen
            ? "md:w-64 md:min-w-64 md:p-4 md:opacity-100"
            : "md:pointer-events-none md:invisible md:w-0 md:min-w-0 md:overflow-hidden md:border-r-0 md:p-0 md:opacity-0",
        )}
        aria-hidden={!desktopOpen}
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-zinc-950">
            <Music2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Sonara</p>
            <p className="text-xs text-zinc-500">Premium Audio Lab</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition",
                  active
                    ? "bg-cyan-400/15 text-cyan-300"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-zinc-800 pt-4">
          <p className="truncate text-xs text-zinc-500">{username ?? "Signed in"}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/85 p-2 backdrop-blur md:hidden">
        <div className="sonara-scrollbar flex gap-1 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-2 text-xs",
                  active
                    ? "bg-cyan-400 text-zinc-950"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2">
          <p className="truncate text-xs text-zinc-400">{username ?? "Signed in"}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-zinc-700 px-2 text-xs text-zinc-300 hover:bg-zinc-800"
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
