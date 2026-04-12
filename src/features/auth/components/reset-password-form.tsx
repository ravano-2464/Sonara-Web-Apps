"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";

const RESET_PASSWORD_TOAST_DURATION_MS = 5000;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          durationMs={RESET_PASSWORD_TOAST_DURATION_MS}
        />
      ),
      {
        duration: RESET_PASSWORD_TOAST_DURATION_MS,
        className: "sonara-toast-shell",
      },
    );
  };

  useEffect(() => {
    const initializeRecovery = async () => {
      setInitializing(true);
      setError(null);

      const supabase = getSupabaseBrowserClient();

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      if (accessToken && refreshToken && hashType === "recovery") {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (setSessionError) {
          setError(mapSupabaseErrorMessage(setSessionError.message));
          setRecoveryReady(false);
          setInitializing(false);
          return;
        }

        setRecoveryReady(true);
        setInitializing(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (tokenHash && type === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (verifyError) {
          setError(mapSupabaseErrorMessage(verifyError.message));
          setRecoveryReady(false);
          setInitializing(false);
          return;
        }

        setRecoveryReady(true);
        setInitializing(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setRecoveryReady(Boolean(session));
      setInitializing(false);

      if (!session) {
        setError("Reset link is invalid or expired. Please request a new reset link.");
      }
    };

    void initializeRecovery();
  }, [searchParams]);

  const submit = async () => {
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      const message = mapSupabaseErrorMessage(updateError.message);
      setError(message);
      showToast({
        title: "Password Update Failed",
        description: message,
        tone: "error",
      });
      return;
    }

    showToast({
      title: "Password Updated",
      description: "Your password has been changed. Please sign in with your new password.",
      tone: "success",
    });

    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/75 p-6 shadow-2xl shadow-black/40">
      <h1 className="text-xl font-semibold text-zinc-50">Reset Password</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Set a new password for your account.
      </p>

      {initializing ? (
        <p className="mt-4 text-sm text-zinc-400">Verifying reset link...</p>
      ) : recoveryReady ? (
        <div className="mt-4 space-y-3">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
          />
          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Password"}
          </Button>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-rose-300">
            {error ?? "Reset link is invalid or expired. Please request a new reset link."}
          </p>
          <Link href="/forgot-password" className="text-sm text-cyan-300 hover:text-cyan-200">
            Request a new reset link
          </Link>
        </div>
      )}
    </section>
  );
}
