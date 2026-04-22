"use client";

import { useState } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SessionPanel } from "@/components/layout/session-panel";
import { PlayerBar } from "@/components/player/player-bar";
import { AudioRuntimeProvider } from "@/features/audio/components/audio-runtime-provider";

interface AppShellProps {
  username?: string;
  children: React.ReactNode;
}

export function AppShell({ username, children }: AppShellProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <AudioRuntimeProvider>
      <div className="flex h-dvh overflow-hidden bg-zinc-950">
        <SidebarNav username={username} desktopOpen={isDesktopSidebarOpen} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <main className="sonara-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-44 pt-4 sm:px-6 lg:px-8">
            <SessionPanel
              username={username}
              sidebarOpen={isDesktopSidebarOpen}
              onToggleSidebar={() => setIsDesktopSidebarOpen((value) => !value)}
            />
            {children}
          </main>
          <PlayerBar />
        </div>
      </div>
    </AudioRuntimeProvider>
  );
}
