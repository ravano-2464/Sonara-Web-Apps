"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-right"
        closeButton
        visibleToasts={4}
        toastOptions={{
          duration: 5000,
          classNames: {
            toast:
              "w-[360px] rounded-xl border border-zinc-700/70 bg-zinc-950/90 text-zinc-100 shadow-2xl shadow-black/70 backdrop-blur-xl",
            title: "text-[13px] font-semibold tracking-wide text-zinc-100",
            description: "text-xs leading-relaxed text-zinc-300/95",
            closeButton:
              "border-zinc-700 bg-zinc-900/90 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
            actionButton:
              "bg-cyan-400 text-zinc-950 hover:bg-cyan-300 font-medium rounded-md",
            cancelButton:
              "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 font-medium rounded-md",
          },
        }}
      />
    </ThemeProvider>
  );
}
