"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { LanguageToggle } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";

const FORGOT_PASSWORD_TOAST_DURATION_MS = 5000;

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const showToast = ({
    title,
    description,
    tone,
  }: {
    title: string;
    description: string;
    tone: "success" | "error" | "info";
  }) => {
    toast.custom(
      () => (
        <AuthToastContent
          title={title}
          description={description}
          tone={tone}
          durationMs={FORGOT_PASSWORD_TOAST_DURATION_MS}
        />
      ),
      {
        duration: FORGOT_PASSWORD_TOAST_DURATION_MS,
        className: "sonara-toast-shell",
      },
    );
  };

  const submit = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError(t("forgot.emailRequired"));
      return;
    }

    setLoading(true);
    setError(null);
    setSent(false);

    const supabase = getSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/reset-password`
            : undefined,
      },
    );

    setLoading(false);

    if (resetError) {
      const message = mapSupabaseErrorMessage(resetError.message);
      setError(message);
      showToast({
        title: t("forgot.resetFailedTitle"),
        description: message,
        tone: "error",
      });
      return;
    }

    setSent(true);
    showToast({
      title: t("forgot.resetSentTitle"),
      description: t("forgot.resetSentDescription"),
      tone: "success",
    });
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/75 p-6 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">{t("forgot.title")}</h1>
          <p className="mt-1 text-sm text-zinc-400">{t("forgot.description")}</p>
        </div>
        <LanguageToggle className="shrink-0" />
      </div>

      <div className="mt-4 space-y-3">
        <Input
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? t("forgot.sending") : t("forgot.sendLink")}
        </Button>

        {sent ? (
          <p className="text-sm text-emerald-300">
            {t("forgot.sentInline")}
          </p>
        ) : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-3">
        <Link href="/auth/login" className="text-sm text-cyan-300 hover:text-cyan-200">
          {t("forgot.backToSignIn")}
        </Link>
      </div>
    </section>
  );
}
