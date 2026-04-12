"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { LanguageToggle } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";

const AUTH_TOAST_DURATION_MS = 5000;

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "sign-in";
  const nextPath = searchParams.get("next") || "/home";
  const nextQuery =
    nextPath && nextPath !== "/home" ? `?next=${encodeURIComponent(nextPath)}` : "";

  const showAuthToast = ({
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
          durationMs={AUTH_TOAST_DURATION_MS}
        />
      ),
      {
        duration: AUTH_TOAST_DURATION_MS,
        className: "sonara-toast-shell",
      },
    );
  };

  const submit = async () => {
    const normalizedUsername = username.trim();
    const normalizedIdentifier = identifier.trim();
    const normalizedEmail = email.trim();

    if (isLogin && !normalizedIdentifier) {
      setError(t("auth.usernameRequired"));
      return;
    }

    if (!isLogin && normalizedUsername.length < 3) {
      setError(t("auth.usernameMin"));
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    type AuthSubmitResult =
      | Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>
      | Awaited<ReturnType<typeof supabase.auth.signUp>>;

    let result: AuthSubmitResult;

    if (isLogin) {
      let loginEmail = normalizedIdentifier;

      if (!loginEmail.includes("@")) {
        const { data: resolvedEmail, error: resolveError } = await supabase.rpc(
          "resolve_login_email",
          {
            login_identifier: normalizedIdentifier,
          },
        );

        if (resolveError) {
          setLoading(false);
          const message = mapSupabaseErrorMessage(resolveError.message);
          setError(message);
          showAuthToast({
            title: t("auth.loginFailedTitle"),
            description: message,
            tone: "error",
          });
          return;
        }

        if (!resolvedEmail) {
          setLoading(false);
          const message = t("auth.usernameNotFound");
          setError(message);
          showAuthToast({
            title: t("auth.loginFailedTitle"),
            description: message,
            tone: "error",
          });
          return;
        }

        loginEmail = resolvedEmail;
      }

      result = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
    } else {
      result = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: normalizedUsername,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/home`
              : undefined,
        },
      });
    }

    setLoading(false);

    if (result.error) {
      const message = mapSupabaseErrorMessage(result.error.message);
      setError(message);
      showAuthToast({
        title: isLogin ? t("auth.loginFailedTitle") : t("auth.registerFailedTitle"),
        description: message,
        tone: "error",
      });
      return;
    }

    setError(null);

    if (!isLogin && !result.data.session) {
      showAuthToast({
        title: t("auth.registerSuccessTitle"),
        description: t("auth.registerVerifyDescription"),
        tone: "success",
      });
      router.push("/auth/login");
      router.refresh();
      return;
    }

    showAuthToast({
      title: isLogin ? t("auth.loginSuccessTitle") : t("auth.registerSuccessTitle"),
      description: t("auth.authSuccessDescription"),
      tone: "success",
    });

    router.push(nextPath);
    router.refresh();
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/75 p-6 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">{t("auth.welcome")}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {isLogin ? t("auth.signInDescription") : t("auth.signUpDescription")}
          </p>
        </div>
        <LanguageToggle className="shrink-0" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-zinc-950 p-1">
        <Link
          href={`/auth/login${nextQuery}`}
          className={`h-9 rounded-md text-sm ${
            isLogin ? "bg-cyan-400 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className="flex h-full items-center justify-center">{t("auth.signInTab")}</span>
        </Link>
        <Link
          href={`/auth/register${nextQuery}`}
          className={`h-9 rounded-md text-sm ${
            !isLogin ? "bg-cyan-400 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className="flex h-full items-center justify-center">{t("auth.registerTab")}</span>
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {isLogin ? (
          <Input
            type="text"
            placeholder={t("auth.identifierPlaceholder")}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
        ) : (
          <>
            <Input
              type="text"
              placeholder={t("auth.usernamePlaceholder")}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <Input
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </>
        )}
        <Input
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        {isLogin ? (
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-cyan-300 transition hover:text-cyan-200"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
        ) : null}
        <Button onClick={submit} disabled={loading} className="w-full">
          {loading
            ? t("common.processing")
            : isLogin
              ? t("auth.signInButton")
              : t("auth.createAccountButton")}
        </Button>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </section>
  );
}
