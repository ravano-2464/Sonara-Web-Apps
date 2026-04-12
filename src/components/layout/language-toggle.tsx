"use client";

import { Languages } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-1 py-1",
        className,
      )}
      aria-label={t("language.switch")}
    >
      <Languages className="h-3.5 w-3.5 text-zinc-400" />
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition",
          locale === "en"
            ? "bg-cyan-400 text-zinc-950"
            : "text-zinc-300 hover:bg-zinc-800",
        )}
        aria-label="Switch to English"
      >
        {t("language.enShort")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={cn(
          "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition",
          locale === "id"
            ? "bg-cyan-400 text-zinc-950"
            : "text-zinc-300 hover:bg-zinc-800",
        )}
        aria-label="Beralih ke Bahasa Indonesia"
      >
        {t("language.idShort")}
      </button>
    </div>
  );
}
